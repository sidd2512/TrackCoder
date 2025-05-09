import fetchAndUpdatePlatformData from "./SraperHerper.js";

export default async function UpdateFriendData(friends) {
  for (const friend of friends) {
    const updatePromises = [];

    const { leetcode_id, gfg_id, codechef_id } = friend;

    if (leetcode_id) {
      updatePromises.push(
        fetchAndUpdatePlatformData(leetcode_id, "LeetCode", true)
      );
    }
    if (gfg_id) {
      updatePromises.push(fetchAndUpdatePlatformData(gfg_id, "GFG", true));
    }
    if (codechef_id) {
      updatePromises.push(
        fetchAndUpdatePlatformData(codechef_id, "CodeChef", true)
      );
    }

    try {
      await Promise.all(updatePromises);
      console.log(`✅ Updated platforms for ${friend.name}`);
    } catch (err) {
      console.error(`❌ Error updating ${friend.name}:`, err);
    }
  }
}
