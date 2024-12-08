// routes/userRoutes.js
import express from 'express';
import User from './userModel.js';

const router = express.Router();

// Add a new user
router.post('/', async (req, res) => {
    const user = new User(req.body);
    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
        console.log('saved user');
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try { res.send('this data is about')
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
});

export default router;
