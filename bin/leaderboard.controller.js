// import User from "../models/user.model.js";

// export const getLeaderboard = async (req, res) => {
//   try {
//     const leaderboardData = await User.aggregate([
//       // Lookup for LeetCode data
//       {
//         $lookup: {
//           from: "leetcodes",
//           localField: "leetcode_id",
//           foreignField: "_id",
//           as: "leetcode_data",
//         },
//       },
//       {
//         $unwind: {
//           path: "$leetcode_data",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // Lookup for GFG data
//       {
//         $lookup: {
//           from: "gfgs",
//           localField: "gfg_id",
//           foreignField: "_id",
//           as: "gfg_data",
//         },
//       },
//       {
//         $unwind: {
//           path: "$gfg_data",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // Lookup for CodeChef data
//       {
//         $lookup: {
//           from: "codechefs",
//           localField: "codechef_id",
//           foreignField: "_id",
//           as: "codechef_data",
//         },
//       },
//       {
//         $unwind: {
//           path: "$codechef_data",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // Project necessary fields and compute totalSolved
//       {
//         $project: {
//           name: 1,
//           totalSolved: {
//             $sum: [
//               { $ifNull: ["$leetcode_data.total_solved", 0] },
//               { $ifNull: ["$gfg_data.total_solved", 0] },
//               { $ifNull: ["$codechef_data.total_solved", 0] },
//             ],
//           },
//           leetcode: {
//             solved: { $ifNull: ["$leetcode_data.total_solved", 0] },
//             rating: { $ifNull: ["$leetcode_data.rating", 0] },
//           },
//           codechef: {
//             solved: { $ifNull: ["$codechef_data.total_solved", 0] },
//             rating: { $ifNull: ["$codechef_data.rating", 0] },
//           },
//           geeksforgeeks: {
//             solved: { $ifNull: ["$gfg_data.total_solved", 0] },
//             rating: { $ifNull: ["$gfg_data.rating", 0] },
//           },
//           lastSolved: {
//             $max: [
//               { $ifNull: ["$leetcode_data.last_solved", null] },
//               { $ifNull: ["$gfg_data.last_solved", null] },
//               { $ifNull: ["$codechef_data.last_solved", null] },
//             ],
//           },
//         },
//       },
//       // Sort by totalSolved in descending order
//       {
//         $sort: {
//           totalSolved: -1,
//         },
//       },
//     ]);

//     // Response
//     res.status(200).json(leaderboardData);
//   } catch (error) {
//     console.error("Error fetching leaderboard data:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };
