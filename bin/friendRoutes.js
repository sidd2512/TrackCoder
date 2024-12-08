// routes/friendRoutes.js
import express from 'express';
import User from '../models/userModel.js';

const router = express.Router();

// Add a friend for a user
router.post('/:userId', async (req, res) => {
    const { friendId } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        user.friends.push(friendId);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all friends of a user
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('friends');
        res.json(user.friends);
    } catch (error) {
        res.status(404).json({ message: 'Friends not found' });
    }
});

export default router;
