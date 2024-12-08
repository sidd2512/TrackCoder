

///////////////////////


import { User, LeetCode, CodeChef, GFG, LeetCodeQuestion, GFGQuestion, CodeChefQuestion } from '../models/index.js';
import { scrapeLeetCode, scrapeGFG, scrapeCodeChef } from '../Scrapers/index.js';

export default async function fetchAndUpdatePlatformData( platformId, platformType) {
  let model, questionModel, scrapeFunction;

  // Determine model, question model, and scrape function based on platformType
  if (platformType === 'LeetCode') {
    model = LeetCode;
    questionModel = LeetCodeQuestion;
    scrapeFunction = scrapeLeetCode;
  } else if (platformType === 'GFG') {
    model = GFG;
    questionModel = GFGQuestion;
    scrapeFunction = scrapeGFG;
  } else if (platformType === 'CodeChef') {
    model = CodeChef;
    questionModel = CodeChefQuestion;
    scrapeFunction = scrapeCodeChef;
  }

  // const user = await User.findById(userId);
  const existingData = await model.findOne({ user_id: platformId });

  // Check if scraping is needed (if no data exists or last update was over 24 hours ago)
  if (!existingData || (existingData && Date.now() - existingData.modifiedAt.getTime() > 24 * 60 * 60 * 1000)) {
    const data = await scrapeFunction(platformId);

    // Add new questions to the question model if they don't already exist
    const questionIds = [];
    for (let question of data.recentProblems) {
      let existingQuestion = await questionModel.findOne({ title: question.title });
      if (!existingQuestion) {
        const newQuestion = new questionModel({
          title: question.title,
          difficulty: question.difficulty,
          link: question.link,
          // id: question.id
        });
        existingQuestion = await newQuestion.save();
      }
      questionIds.push(existingQuestion._id);
    }

    // Prepare the platform data model
    const platformData = {
      user_id: platformId,
      total_solved: data.totalSolved,
      easy: data.easySolved,
      medium: data.mediumSolved,
      hard: data.hardSolved,
      rating: data.rating,
      question_solved: questionIds,
      modifiedAt: new Date()
    };

    // Save or update the platform data in the model
    let savedData;
    if (existingData) {
      savedData = await model.findByIdAndUpdate(existingData._id, platformData, { new: true });
    } else {
      const newPlatformData = new model(platformData);
      savedData = await newPlatformData.save();
    }

    // Update user's platform ID reference with saved platform data _id
    // await User.findByIdAndUpdate(userId, { [`${platformType.toLowerCase()}_id`]: savedData._id });
    return savedData._id;
  } else {
    // await User.findByIdAndUpdate(userId, { [`${platformType.toLowerCase()}_id`]: existingData._id });
    console.log("No scraping needed; data is up-to-date.");
    return existingData._id ;
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

