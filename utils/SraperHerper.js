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
    console.log("Scraping data...", platformUserDoc);
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

// import mongoose from 'mongoose';
// import { User, LeetCode, CodeChef, GFG, LeetCodeQuestion, GFGQuestion, CodeChefQuestion } from '../models/index.js';
// import { scrapeLeetCode, scrapeGFG, scrapeCodeChef } from '../Scrapers/index.js';

// export default async function fetchAndUpdatePlatformData(userId, platformId, platformType) {
//   let model, questionModel, scrapeFunction;

//   if (platformType === 'LeetCode') {
//     model = LeetCode;
//     questionModel = LeetCodeQuestion;
//     scrapeFunction = scrapeLeetCode;
//   } else if (platformType === 'GFG') {
//     model = GFG;
//     questionModel = GFGQuestion;
//     scrapeFunction = scrapeGFG;
//   } else if (platformType === 'CodeChef') {
//     model = CodeChef;
//     questionModel = CodeChefQuestion;
//     scrapeFunction = scrapeCodeChef;
//   }

//   // Fetch user by ObjectId
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new Error('User not found');
//   }

//   const existingData = await model.findOne({ user_id: platformId });

//   if (!existingData || (existingData && Date.now() - existingData.modifiedAt.getTime() > 24 * 60 * 60 * 1000)) {
//     // Run scraper if data doesn't exist or is older than 24 hours
//     const data = await scrapeFunction(platformId);

//     // Add questions to the question model if they don't exist
//     const questionIds = [];
//     for (let question of data.recentProblems) {
//       let existingQuestion = await questionModel.findOne({ title: question.title });
//       if (!existingQuestion) {
//         const newQuestion = new questionModel({
//           title: question.title,
//           difficulty: question.difficulty,
//           link: question.link,
//           id: question.id
//         });
//         existingQuestion = await newQuestion.save();
//       }
//       questionIds.push(existingQuestion._id);
//     }

//     // Prepare platform data
//     const platformData = {
//       user_id: platformId,
//       total_solved: data.totalSolved,
//       easy: data.easySolved,
//       medium: data.mediumSolved,
//       hard: data.hardSolved,
//       rating: data.rating,
//       question_solved: questionIds,
//       modifiedAt: new Date()
//     };

//     // Update or create the platform data model
//     if (existingData) {
//       await model.findByIdAndUpdate(existingData._id, platformData);
//     } else {
//       const newPlatformData = new model(platformData);
//       await newPlatformData.save();
//     }
//   } else {
//     // Handle case when data is already fresh
//     console.log('Data is fresh, no need to scrape');
//   }
// }
