import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import fetchAndUpdatePlatformData from '../utils/SraperHerper.js';
import { generateAccessAndRefereshTokens } from '../utils/generateAccessAndRefereshTokens.js';
import dotenv from 'dotenv';
dotenv.config();



// Register User
export const registerUser = async (req, res) => {
  try {
    const { email, name, password, leetcode_id, gfg_id, codechef_id } = req.body;

    // Generate user_id from email
    const user_id = email.split('@')[0];

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the User model
    const user = new User({ email, name, password: hashedPassword, user_id });
    const savedUser = await user.save();

    // Populate platform data for the user
    let leetcode_ref, gfg_ref, codechef_ref;

     if (leetcode_id) leetcode_ref = await fetchAndUpdatePlatformData(leetcode_id, 'LeetCode');
     if (gfg_id) gfg_ref = await fetchAndUpdatePlatformData(gfg_id, 'GFG');
     if (codechef_id) codechef_ref = await fetchAndUpdatePlatformData(codechef_id, 'CodeChef');


    // Update user's platform ID references
    savedUser.leetcode_id = leetcode_ref;
    savedUser.gfg_id = gfg_ref;
    savedUser.codechef_id = codechef_ref;


    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(savedUser._id);
    savedUser.refreshToken = refreshToken;


    // Save the updated user object

    await savedUser.save();
     const createdUser= await User.findById(savedUser._id).select('-password -refreshToken');
    console.log('resister done');
    
    res.status(201).json({ message: 'User registered successfully', user: createdUser });
  } catch (error) {
    console.error(error);
    if (req.body.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        await User.deleteOne({ email: req.body.email });
      }
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login User

export const loginUser = async (req, res) => {
  try { console.log('login route hit');
  
    const { email, password } = req.body;
     console.log(email);
     console.log(password);
     
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    // Remove sensitive data before sending user details
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    // Set refresh token in secure cookie
    const options = {
      httpOnly: true,
      secure: true, // Ensure this is true in production
      
    };
    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)

    // Respond with access token and user details
    console.log('loggin successfull');
    return res.status(200).json({
      message: 'User logged in successfully',
      user: loggedInUser,
      accessToken,
      refreshToken,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};



//refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { _id: user._id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// logout
export const logoutUser = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(400).json({ error: 'Refresh token is required to log out' });
    }

    // Verify and decode refresh token
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user and remove the refresh token
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    user.refreshToken = null; // Clear refresh token
    await user.save();

    // Clear cookies
    res
      .clearCookie('refreshToken', { httpOnly: true, secure: true })
      .status(200)
      .json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Logout failed' });
  }
};


// Get Logged-In User Data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user; // From JWT payload
    const user = await User.findOne({ user_id: userId }).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};


//password change 
export const changePassword = async (req, res) => {
  const userId = req.user._id; // User ID from token
  const { currentPassword, newPassword } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};


//userid change
export const changeUserId = async (req, res) => {
  const userId = req.user._id; // User ID from token
  const { newUserId } = req.body;

  try {
    // Check if the new user ID is already taken
    const existingUser = await User.findOne({ user_id: newUserId });
    if (existingUser) {
      return res.status(400).json({ message: 'The new user ID is already taken' });
    }

    // Update the user's user_id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.user_id = newUserId;
    await user.save();

    res.status(200).json({ message: 'User ID updated successfully', user_id: user.user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user ID', error: error.message });
  }
};


//update user profile
export const updateUserProfile = async (req, res) => {
  const userId = req.user._id; // User ID from token
  const { name, user_id, leetcode_id, gfg_id, codechef_id } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    // Update user_id if provided and unique
    if (user_id) {
      const existingUser = await User.findOne({ user_id });
      if (existingUser) {
        return res.status(400).json({ message: 'User ID already taken' });
      }
      user.user_id = user_id;
    }

    // Validate and update LeetCode ID if provided
    if (leetcode_id) {
      const leetCodeExists = await LeetCode.findById(leetcode_id);
      if (!leetCodeExists) {
        return res.status(400).json({ message: 'Invalid LeetCode ID' });
      }
      user.leetcode_id = leetcode_id;
    }

    // Validate and update GFG ID if provided
    if (gfg_id) {
      const gfgExists = await GFG.findById(gfg_id);
      if (!gfgExists) {
        return res.status(400).json({ message: 'Invalid GFG ID' });
      }
      user.gfg_id = gfg_id;
    }

    // Validate and update CodeChef ID if provided
    if (codechef_id) {
      const codeChefExists = await CodeChef.findById(codechef_id);
      if (!codeChefExists) {
        return res.status(400).json({ message: 'Invalid CodeChef ID' });
      }
      user.codechef_id = codechef_id;
    }

    // Save updated user data
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        user_id: user.user_id,
        leetcode_id: user.leetcode_id,
        gfg_id: user.gfg_id,
        codechef_id: user.codechef_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

