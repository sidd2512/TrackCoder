import {
  LeetCode,
  CodeChef,
  GFG,
  LeetCodeQuestion,
  GFGQuestion,
  CodeChefQuestion,
} from "../models/index.js";

import {
  scrapeLeetCode,
  scrapeGFG,
  scrapeCodeChef,
} from "../Scrapers/index.js";

import redisClient from "../utils/redis.js";

export default async function fetchAndUpdatePlatformData(
  platformId,
  platformType,
  id = false
) {
  let model, questionModel, scrapeFunction;

  // Step 1: Resolve platform-specifics
  if (platformType === "LeetCode") {
    model = LeetCode;
    questionModel = LeetCodeQuestion;
    scrapeFunction = scrapeLeetCode;
  } else if (platformType === "GFG") {
    model = GFG;
    questionModel = GFGQuestion;
    scrapeFunction = scrapeGFG;
  } else if (platformType === "CodeChef") {
    model = CodeChef;
    questionModel = CodeChefQuestion;
    scrapeFunction = scrapeCodeChef;
  } else {
    throw new Error("Invalid platform type");
  }

  // Step 2: Get platform user data
  // If id is true, we are using the user_id from the request body
  let platformUserDoc;
  if (id) platformUserDoc = await model.findById(platformId);
  // Otherwise, we are using the user_id from the platformId
  else platformUserDoc = await model.findOne({ user_id: platformId });

  const shouldScrape =
    !platformUserDoc ||
    Date.now() - platformUserDoc.modifiedAt.getTime() > 60 * 60 * 1000;

  if (!shouldScrape) {
    console.log("No scraping needed; data is fresh.");
    return platformUserDoc._id;
  }

  try {
    // Step 3: Scrape
    //console.log("Scraping data...", platformUserDoc);
    let scraped;
    if (platformUserDoc)
      scraped = await scrapeFunction(platformUserDoc.user_id);
    else scraped = await scrapeFunction(platformId);

    // Step 4: Build Redis cache map of all questions
    let redisKey = `${platformType}_questions`;
    let allQuestions = await redisClient.hGetAll(redisKey); // { title: ObjectId }

    // Step 5: Convert to objectId map
    const redisQuestionsMap = {};
    for (const [title, id] of Object.entries(allQuestions)) {
      redisQuestionsMap[title] = id;
    }

    const newQuestionEntries = [];

    for (let q of scraped.recentProblems) {
      if (!redisQuestionsMap[q.title]) {
        const newQuestion = await questionModel.create({
          title: q.title,
          difficulty: q.difficulty,
          link: q.link,
        });

        // Save in Redis
        await redisClient.hSet(redisKey, q.title, newQuestion._id.toString());
        redisQuestionsMap[q.title] = newQuestion._id.toString();
      }

      newQuestionEntries.push({
        _id: redisQuestionsMap[q.title],
        solvedAt: q.timespan ? new Date(q.timespan * 1000) : new Date(),
      });
    }

    // Step 6: Insert into platform user model
    if (!platformUserDoc) {
      platformUserDoc = new model({
        user_id: platformId,
        total_solved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        rating: 0,
        question_solved: [],
      });
    }

    // Build existing question _id set
    const existingSet = new Set(
      platformUserDoc.question_solved.map((q) => q.question.toString())
    );

    for (let q of newQuestionEntries) {
      if (!existingSet.has(q._id)) {
        platformUserDoc.question_solved.push({
          question: q._id,
          solvedAt: q.solvedAt,
        });
      }
    }

    // Step 7: Update stats
    platformUserDoc.total_solved = scraped.totalSolved;
    platformUserDoc.easy = scraped.easySolved;
    platformUserDoc.medium = scraped.mediumSolved;
    platformUserDoc.hard = scraped.hardSolved;
    if (scraped.rating) platformUserDoc.rating = scraped.rating;
    platformUserDoc.modifiedAt = new Date();

    await platformUserDoc.save();
    return platformUserDoc._id;
  } catch (err) {
    console.error("Error while scraping:", err);
    return platformUserDoc ? platformUserDoc._id : null;
  }
}
