// Leaderboard aggregation pipeline
export const getLeaderboardPipeline = (user_id) => [
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
];
