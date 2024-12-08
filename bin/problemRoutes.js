// routes/problemRoutes.js
import express from 'express';
import Problem from './problemModel.js';

const router = express.Router();

// Retrieve all problems (you could add filters if needed)
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find();
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
