import fetchAndUpdatePlatformData from "../utils/SraperHerper.js";
import User from "../models/user.model.js";
import UpdateFriendData from "../utils/UpdateFriendData.js";
import {
  getUserBasicPipeline,
  getUserPipeline,
} from "../aggregations/user.aggregations.js";
import { getFriendPipeline } from "../aggregations/friend.aggregations.js";
import { getLeaderboardPipeline } from "../aggregations/leaderboard.aggregations.js";

export const getUserInfo = async (req, res) => {
  const { user_id } = req.user;

  try {
    // Fetch the current user data with platform info
    const user = await User.aggregate(getUserPipeline(user_id));

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
  const { friendname } = req.params;
  const { user_id } = req.user;
  const userId = user_id; // Assuming user_id is the same as userId in the request

  try {
    // Step 1: Fetch user data without the question_solved array
    const user = await User.aggregate(getUserBasicPipeline(userId));

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Fetch friend data including question_solved
    const friendData = await User.aggregate(getFriendPipeline(friendname));

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
    const { user_id } = req.user;
    const leaderboardData = await User.aggregate(
      getLeaderboardPipeline(user_id)
    );

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
