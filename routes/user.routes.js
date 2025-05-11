import express from "express";
import {
  getUserInfo,
  compareUserWithFriend,
  getLeaderboard,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Define the route for fetching user profile
router.get("/profile", verifyToken, getUserInfo);
router.get("/leaderboard", verifyToken, getLeaderboard);
router.get("/compare/:friendname", verifyToken, compareUserWithFriend);

export default router;
