import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const generateAccessAndRefereshTokens = async (userId) => {
  try {
    // Fetch user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate access token (expires in 30 days)
    const accessToken = jwt.sign(
      { _id: user._id, user_id: user.user_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" } // 30 days expiration
    );

    // Generate refresh token (expires in 30 days)
    const refreshToken = jwt.sign(
      { _id: user._id, user_id: user.user_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" } // 30 days expiration
    );

    // Save refresh token to the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Error generating tokens: " + error.message);
  }
};
