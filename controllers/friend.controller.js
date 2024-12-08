import User from '../models/user.model.js';
import fetchAndUpdatePlatformData from '../utils/SraperHerper.js';

//Add friend 
export const addFriend = async (req, res) => {
  try {
    const { name, leetcodeId, gfgId, codechefId } = req.body;
    const userId = req.user._id;
    // Find the user who is adding the friend
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch platform data references for the friend
    let leetcodeRef, gfgRef, codechefRef;


    if(leetcodeId){
      leetcodeRef = await fetchAndUpdatePlatformData(leetcodeId, 'LeetCode');
    }
    if(gfgId) gfgRef = await fetchAndUpdatePlatformData(gfgId, 'GFG');
    if(codechefId) codechefRef = await fetchAndUpdatePlatformData(codechefId, 'CodeChef');

    // Create a friend object
    const newFriend = {
      name,
      leetcode_id: leetcodeRef,
      gfg_id: gfgRef,
      codechef_id: codechefRef,
    };

    // Add the new friend to the user's friends array
    user.friends.push(newFriend);
    await user.save();

    res.status(201).json({ message: 'Friend added successfully', friend: newFriend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
};


//Remove friend
export const removeFriend = async (req, res) => {
  const userId = req.user._id; // User ID from token
  const { name } = req.params; // Name of the friend to be removed

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the friend exists in the user's friend list -- it js findIndex,Splice 
    const friendIndex = user.friends.findIndex((friend) => friend.name === name);
    if (friendIndex === -1) {
      return res.status(404).json({ message: 'Friend not found in your friend list' });
    }

    // Remove the friend from the list
    user.friends.splice(friendIndex, 1);
    // or user.friends = user.friends.filter((friend) => friend.name !== name);
    await user.save();

    res.status(200).json({
      message: 'Friend removed successfully',
      friends: user.friends, // Return updated friend list
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove friend', error: error.message });
  }
};
