import express from 'express';
import { registerUser, loginUser, getUserData, logoutUser, refreshAccessToken, changePassword, changeUserId } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Auth routes
router.post('/register', registerUser); // Register
router.post('/login', loginUser); // Login
router.post('/logout',verifyToken,logoutUser)
router.post('/refresh-accessToken',verifyToken, refreshAccessToken)
router.get('/current-user', verifyToken, getUserData); 
router.post('/change-password',verifyToken,changePassword);
router.post('/change-userId',verifyToken,changeUserId);

export default router;
