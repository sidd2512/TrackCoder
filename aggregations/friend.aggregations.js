// Friend aggregation pipeline
export const getFriendPipeline = (friendName) => [
  { $unwind: "$friends" },
  { $match: { "friends.name": friendName } },

  // Fetch platform base data
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

  // Unwind platform data
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

  // Process LeetCode data
  {
    $addFields: {
      leetcode_data: {
        $cond: {
          if: { $ne: ["$leetcode_data", null] },
          then: {
            $mergeObjects: [
              "$leetcode_data",
              {
                question_solved: {
                  $slice: [
                    {
                      $sortArray: {
                        input: "$leetcode_data.question_solved",
                        sortBy: { solvedAt: -1 },
                      },
                    },
                    30,
                  ],
                },
              },
            ],
          },
          else: null,
        },
      },
    },
  },
  {
    $lookup: {
      from: "leetcodequestions",
      localField: "leetcode_data.question_solved.question",
      foreignField: "_id",
      as: "leetcode_questions",
    },
  },
  {
    $addFields: {
      "leetcode_data.question_solved": {
        $cond: {
          if: { $ne: ["$leetcode_data", null] },
          then: {
            $map: {
              input: "$leetcode_data.question_solved",
              as: "qs",
              in: {
                $let: {
                  vars: {
                    q: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$leetcode_questions",
                            as: "q",
                            cond: { $eq: ["$$q._id", "$$qs.question"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    id: "$$q.id",
                    title: "$$q.title",
                    difficulty: "$$q.difficulty",
                    link: "$$q.link",
                    solvedAt: "$$qs.solvedAt",
                  },
                },
              },
            },
          },
          else: [],
        },
      },
    },
  },
  { $project: { leetcode_questions: 0 } },

  // Process GFG data
  {
    $addFields: {
      gfg_data: {
        $cond: {
          if: { $ne: ["$gfg_data", null] },
          then: {
            $mergeObjects: [
              "$gfg_data",
              {
                question_solved: {
                  $slice: [
                    {
                      $sortArray: {
                        input: "$gfg_data.question_solved",
                        sortBy: { solvedAt: -1 },
                      },
                    },
                    30,
                  ],
                },
              },
            ],
          },
          else: null,
        },
      },
    },
  },
  {
    $lookup: {
      from: "gfgquestions",
      localField: "gfg_data.question_solved.question",
      foreignField: "_id",
      as: "gfg_questions",
    },
  },
  {
    $addFields: {
      "gfg_data.question_solved": {
        $cond: {
          if: { $ne: ["$gfg_data", null] },
          then: {
            $map: {
              input: "$gfg_data.question_solved",
              as: "qs",
              in: {
                $let: {
                  vars: {
                    q: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$gfg_questions",
                            as: "q",
                            cond: { $eq: ["$$q._id", "$$qs.question"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    id: "$$q.id",
                    title: "$$q.title",
                    difficulty: "$$q.difficulty",
                    link: "$$q.link",
                    solvedAt: "$$qs.solvedAt",
                  },
                },
              },
            },
          },
          else: [],
        },
      },
    },
  },
  { $project: { gfg_questions: 0 } },

  // Process CodeChef data
  {
    $addFields: {
      codechef_data: {
        $cond: {
          if: { $ne: ["$codechef_data", null] },
          then: {
            $mergeObjects: [
              "$codechef_data",
              {
                question_solved: {
                  $slice: [
                    {
                      $sortArray: {
                        input: "$codechef_data.question_solved",
                        sortBy: { solvedAt: -1 },
                      },
                    },
                    30,
                  ],
                },
              },
            ],
          },
          else: null,
        },
      },
    },
  },
  {
    $lookup: {
      from: "codechefquestions",
      localField: "codechef_data.question_solved.question",
      foreignField: "_id",
      as: "codechef_questions",
    },
  },
  {
    $addFields: {
      "codechef_data.question_solved": {
        $cond: {
          if: { $ne: ["$codechef_data", null] },
          then: {
            $map: {
              input: "$codechef_data.question_solved",
              as: "qs",
              in: {
                $let: {
                  vars: {
                    q: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$codechef_questions",
                            as: "q",
                            cond: { $eq: ["$$q._id", "$$qs.question"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    title: "$$q.title",
                    link: "$$q.link",
                    solvedAt: "$$qs.solvedAt",
                  },
                },
              },
            },
          },
          else: [],
        },
      },
    },
  },
  { $project: { codechef_questions: 0 } },

  // Final projection
  {
    $project: {
      _id: "$friends._id",
      name: "$friends.name",
      leetcode_data: 1,
      gfg_data: 1,
      codechef_data: 1,
    },
  },
];
