import express from 'express';
import { addFriend,removeFriend } from '../controllers/friend.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
const router = express.Router();

// POST /api/friends - Add a new friend
router.post('/add',verifyToken, addFriend);
router.delete('/remove/:name', verifyToken, removeFriend);

export default router;






























// import express from 'express';
// import User from '../models/user.model.js';
// import fetchAndUpdatePlatformData from '../utils/SraperHerper.js';

// const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const { userId, name, leetcodeId, gfgId, codechefId } = req.body;

//     // Find the user who is adding the friend
//     const user = await User.findOne({user_id:userId});
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Fetch platform data references for the friend
//     const leetcodeRef = await fetchAndUpdatePlatformData(leetcodeId, 'LeetCode');
//     const gfgRef = await fetchAndUpdatePlatformData(gfgId, 'GFG');
//     const codechefRef = await fetchAndUpdatePlatformData(codechefId, 'CodeChef');

//     // Create a friend object
//     const newFriend = {
//       name,
//       leetcode_id: leetcodeRef,
//       gfg_id: gfgRef,
//       codechef_id: codechefRef,
//     };

//     // Add the new friend to the user's friends array
//     user.friends.push(newFriend);
//     await user.save();

//     res.status(201).json({ message: 'Friend added successfully', friend: newFriend });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to add friend' });
//   }
// });

// export default router;


