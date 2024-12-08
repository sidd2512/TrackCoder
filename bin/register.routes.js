import express from 'express';
import { registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

// POST /api/register - Register a new user
router.post('/register', registerUser);

export default router;



















// import express from 'express';
// import User from '../models/user.model.js';
// import fetchAndUpdatePlatformData from '../utils/SraperHerper.js'


// const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const { email,name, password, leetcode_id, gfg_id, codechef_id } = req.body;

//     // Create a new user in the User model
  
//   const user = new User({ email, name, password });
//     const savedUser = await user.save();

  

//     // Populate platform data for the user
//   const leetcode_ref=  await fetchAndUpdatePlatformData(leetcode_id, 'LeetCode');
//   const gfg_ref= await fetchAndUpdatePlatformData(gfg_id, 'GFG');
//   const codechef_ref = await fetchAndUpdatePlatformData(codechef_id, 'CodeChef');
    
//   // Update user's platform ID references
//   savedUser.leetcode_id = leetcode_ref;
//   savedUser.gfg_id = gfg_ref;
//   savedUser.codechef_id = codechef_ref;
  
//   // Save the updated user object
//   await savedUser.save(); 
  
//     res.status(201).json({ message: 'User registered successfully', user: savedUser });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to register user' });
//   }
// });

// export default router;