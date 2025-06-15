import express from "express";
import { addFriend, removeFriend } from "../controllers/friend.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

// POST /api/friends - Add a new friend
router.post("/add", verifyToken, addFriend);
router.delete("/remove/:name", verifyToken, removeFriend);

export default router;
