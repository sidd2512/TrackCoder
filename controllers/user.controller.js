import fetchAndUpdatePlatformData from "../utils/SraperHerper.js";
import User from "../models/user.model.js";
import UpdateFriendData from "../utils/UpdateFriendData.js";

export const getUserInfo = async (req, res) => {
  const { user_id } = req.user;

  try {
    // Fetch the current user data with platform info
    const user = await User.aggregate([
      {
        $match: {
          user_id: user_id,
        },
      },
      {
        $lookup: {
          from: "leetcodes",
          localField: "leetcode_id",
          foreignField: "_id",
          as: "leetcode_data",
        },
      },
      {
        $lookup: {
          from: "gfgs",
          localField: "gfg_id",
          foreignField: "_id",
          as: "gfg_data",
        },
      },
      {
        $lookup: {
          from: "codechefs",
          localField: "codechef_id",
          foreignField: "_id",
          as: "codechef_data",
        },
      },
      {
        $unwind: {
          path: "$leetcode_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "leetcodequestions",
          localField: "leetcode_data.question_solved.question",
          foreignField: "_id",
          as: "leetcode_data.question_solved",
        },
      },
      {
        $unwind: {
          path: "$gfg_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "gfgquestions",
          localField: "gfg_data.question_solved.question",
          foreignField: "_id",
          as: "gfg_data.question_solved",
        },
      },
      {
        $unwind: {
          path: "$codechef_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "codechefquestions",
          localField: "codechef_data.question_solved.question",
          foreignField: "_id",
          as: "codechef_data.question_solved",
        },
      },
      {
        $project: {
          refreshToken: 0,
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the current user data immediately
    res.status(200).json(user[0]);
    //console.log(user[0]);

    //now update the user info
    const promises = [];

    if (user[0].gfg_data.user_id) {
      promises.push(
        fetchAndUpdatePlatformData(user[0].gfg_data.user_id, "GFG")
      );
    }
    if (user[0].leetcode_data.user_id) {
      promises.push(
        fetchAndUpdatePlatformData(user[0].leetcode_data.user_id, "LeetCode")
      );
    }
    if (user[0].codechef_data.user_id) {
      promises.push(
        fetchAndUpdatePlatformData(user[0].codechef_data.user_id, "CodeChef")
      );
    }

    await Promise.all(promises);

    await UpdateFriendData(user[0].friends);
    console.log("User data updated successfully");
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    res
      .status(500)
      .json({ message: "Error fetching user data", error: error.message });
  }
};

export const compareUserWithFriend = async (req, res) => {
  const { userId, friendname } = req.params;

  try {
    // Step 1: Fetch user data without the question_solved array
    const user = await User.aggregate([
      { $match: { user_id: userId } },
      {
        $lookup: {
          from: "leetcodes",
          localField: "leetcode_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                question_solved: 0, // Exclude question_solved
              },
            },
          ],
          as: "leetcode_data",
        },
      },
      {
        $lookup: {
          from: "gfgs",
          localField: "gfg_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                question_solved: 0, // Exclude question_solved
              },
            },
          ],
          as: "gfg_data",
        },
      },
      {
        $lookup: {
          from: "codechefs",
          localField: "codechef_id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                question_solved: 0, // Exclude question_solved
              },
            },
          ],
          as: "codechef_data",
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$user_id",
          name: "$name",
          email: "$email",
          leetcode_data: { $arrayElemAt: ["$leetcode_data", 0] },
          gfg_data: { $arrayElemAt: ["$gfg_data", 0] },
          codechef_data: { $arrayElemAt: ["$codechef_data", 0] },
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Fetch friend data including question_solved
    const friendData = await User.aggregate([
      { $unwind: "$friends" },
      { $match: { "friends.name": friendname } },

      // Fetch leetcode, gfg, and codechef base data
      {
        $lookup: {
          from: "leetcodes",
          localField: "friends.leetcode_id",
          foreignField: "_id",
          as: "leetcode_data",
        },
      },
      {
        $lookup: {
          from: "gfgs",
          localField: "friends.gfg_id",
          foreignField: "_id",
          as: "gfg_data",
        },
      },
      {
        $lookup: {
          from: "codechefs",
          localField: "friends.codechef_id",
          foreignField: "_id",
          as: "codechef_data",
        },
      },

      // Unwind platform data to access question_solved arrays
      {
        $unwind: {
          path: "$leetcode_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$gfg_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$codechef_data",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup question details for each platform
      {
        $lookup: {
          from: "leetcodequestions",
          localField: "leetcode_data.question_solved.question",
          foreignField: "_id",
          as: "leetcode_data.question_solved",
        },
      },
      {
        $lookup: {
          from: "gfgquestions",
          localField: "gfg_data.question_solved.question",
          foreignField: "_id",
          as: "gfg_data.question_solved",
        },
      },
      {
        $lookup: {
          from: "codechefquestions",
          localField: "codechef_data.question_solved.question",
          foreignField: "_id",
          as: "codechef_data.question_solved",
        },
      },

      // Assemble and return
      {
        $project: {
          _id: "$friends._id",
          name: "$friends.name",
          leetcode_data: 1,
          gfg_data: 1,
          codechef_data: 1,
        },
      },
    ]);

    console.log(JSON.stringify(friendData, null, 2));
    if (!friendData || friendData.length === 0) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Step 3: Combine user and friend data
    const result = {
      user: user[0], // Aggregation result for user
      friend: friendData[0], // Aggregation result for friend
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching comparison data:", error.message);
    res.status(500).json({
      message: "Error fetching comparison data",
      error: error.message,
    });
  }
};

//for leaderboard

export const getLeaderboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const leaderboardData = await User.aggregate([
      {
        $match: {
          user_id: userId,
        },
      },
      {
        $lookup: {
          from: "leetcodes",
          localField: "leetcode_id",
          foreignField: "_id",
          as: "leetcode_data",
        },
      },
      {
        $lookup: {
          from: "gfgs",
          localField: "gfg_id",
          foreignField: "_id",
          as: "gfg_data",
        },
      },
      {
        $lookup: {
          from: "codechefs",
          localField: "codechef_id",
          foreignField: "_id",
          as: "codechef_data",
        },
      },
      {
        $addFields: {
          leetcode_data: { $arrayElemAt: ["$leetcode_data", 0] },
          gfg_data: { $arrayElemAt: ["$gfg_data", 0] },
          codechef_data: { $arrayElemAt: ["$codechef_data", 0] },
        },
      },
      {
        $unwind: {
          path: "$friends",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "leetcodes",
          localField: "friends.leetcode_id",
          foreignField: "_id",
          as: "friends.leetcode_data",
        },
      },
      {
        $lookup: {
          from: "gfgs",
          localField: "friends.gfg_id",
          foreignField: "_id",
          as: "friends.gfg_data",
        },
      },
      {
        $lookup: {
          from: "codechefs",
          localField: "friends.codechef_id",
          foreignField: "_id",
          as: "friends.codechef_data",
        },
      },
      {
        $addFields: {
          "friends.leetcode_data": {
            $arrayElemAt: ["$friends.leetcode_data", 0],
          },
          "friends.gfg_data": { $arrayElemAt: ["$friends.gfg_data", 0] },
          "friends.codechef_data": {
            $arrayElemAt: ["$friends.codechef_data", 0],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          user: {
            $first: {
              name: "$name",
              user_id: "$user_id",
              leetcode: {
                solved: { $ifNull: ["$leetcode_data.total_solved", 0] },
                easy: { $ifNull: ["$leetcode_data.easy", 0] },
                medium: { $ifNull: ["$leetcode_data.medium", 0] },
                hard: { $ifNull: ["$leetcode_data.hard", 0] },
                rating: { $ifNull: ["$leetcode_data.rating", 0] },
              },
              gfg: {
                solved: { $ifNull: ["$gfg_data.total_solved", 0] },
                easy: { $ifNull: ["$gfg_data.easy", 0] },
                medium: { $ifNull: ["$gfg_data.medium", 0] },
                hard: { $ifNull: ["$gfg_data.hard", 0] },
                rating: { $ifNull: ["$gfg_data.rating", 0] },
              },
              codechef: {
                solved: { $ifNull: ["$codechef_data.total_solved", 0] },
                rating: { $ifNull: ["$codechef_data.rating", 0] },
              },
              totalSolved: {
                $add: [
                  { $ifNull: ["$leetcode_data.total_solved", 0] },
                  { $ifNull: ["$gfg_data.total_solved", 0] },
                  { $ifNull: ["$codechef_data.total_solved", 0] },
                ],
              },
            },
          },
          friends: {
            $push: {
              name: "$friends.name",
              leetcode: {
                solved: { $ifNull: ["$friends.leetcode_data.total_solved", 0] },
                easy: { $ifNull: ["$friends.leetcode_data.easy", 0] },
                medium: { $ifNull: ["$friends.leetcode_data.medium", 0] },
                hard: { $ifNull: ["$friends.leetcode_data.hard", 0] },
                rating: { $ifNull: ["$friends.leetcode_data.rating", 0] },
              },
              gfg: {
                solved: { $ifNull: ["$friends.gfg_data.total_solved", 0] },
                easy: { $ifNull: ["$friends.gfg_data.easy", 0] },
                medium: { $ifNull: ["$friends.gfg_data.medium", 0] },
                hard: { $ifNull: ["$friends.gfg_data.hard", 0] },
                rating: { $ifNull: ["$friends.gfg_data.rating", 0] },
              },
              codechef: {
                solved: { $ifNull: ["$friends.codechef_data.total_solved", 0] },
                rating: { $ifNull: ["$friends.codechef_data.rating", 0] },
              },
              totalSolved: {
                $add: [
                  { $ifNull: ["$friends.leetcode_data.total_solved", 0] },
                  { $ifNull: ["$friends.gfg_data.total_solved", 0] },
                  { $ifNull: ["$friends.codechef_data.total_solved", 0] },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          friends: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: leaderboardData[0], // Expecting one document containing user and friends' data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
};

// import mongoose from 'mongoose';
// import User from '../models/user.model.js';

// export const getUserProfile = async (req, res) => {
//   try {
//     const { userId } = req.params; // Get `userId` from route params
//      const user = await User.findOne({user_id:userId});
//     const result = await User.aggregate([
//       {
//         $match: {
//           _id: user._id
//         },
//       },
//       {
//         $lookup: {
//           from: 'leetcodes',
//           localField: 'leetcode_id',
//           foreignField: '_id',
//           as: 'leetcode_data',
//         },
//       },
//       {
//         $lookup: {
//           from: 'gfgs',
//           localField: 'gfg_id',
//           foreignField: '_id',
//           as: 'gfg_data',
//         },
//       },
//       {
//         $lookup: {
//           from: 'codechefs',
//           localField: 'codechef_id',
//           foreignField: '_id',
//           as: 'codechef_data',
//         },
//       },
//       { $unwind: { path: '$leetcode_data', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'leetcodequestions',
//           localField: 'leetcode_data.question_solved',
//           foreignField: '_id',
//           as: 'leetcode_data.question_solved',
//         },
//       },
//       { $unwind: { path: '$gfg_data', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'gfgquestions',
//           localField: 'gfg_data.question_solved',
//           foreignField: '_id',
//           as: 'gfg_data.question_solved',
//         },
//       },
//       { $unwind: { path: '$codechef_data', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'codechefquestions',
//           localField: 'codechef_data.question_solved',
//           foreignField: '_id',
//           as: 'codechef_data.question_solved',
//         },
//       },
//       {
//         $group: {
//           _id: '$_id',
//           email: { $first: '$email' },
//           userId: { $first: '$userId' },
//           name: { $first: '$name' },
//           leetcode_data: { $first: '$leetcode_data' },
//           gfg_data: { $first: '$gfg_data' },
//           codechef_data: { $first: '$codechef_data' },
//         },
//       },
//     ]);

//     if (result.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json(result[0]);
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
