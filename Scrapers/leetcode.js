import axios from 'axios';

export default async function getLeetCodeStats(username) {
    try {
        const url = `https://alfa-leetcode-api.onrender.com/userProfile/${username}`;

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
            },
        });

        const data = response.data;
        if (!data) {
            throw new Error('User data not found');
        }

        // Extract and validate the data fields
        const easySolved = data.easySolved || 0;
        const mediumSolved = data.mediumSolved || 0;
        const hardSolved = data.hardSolved || 0; // Corrected the key casing
        const totalSolved = easySolved + mediumSolved + hardSolved;
        const contestBadge = data.contestBadge || 'No Badge';

        // Filter only "Accepted" problems and map to desired format
        const problems =
            data.recentSubmissions
                ?.filter((problem) => problem.statusDisplay === 'Accepted')
                .map((problem) => ({
                    title: problem.title || '',
                    difficulty: problem.difficulty || 'Unknown',
                    link: problem.titleSlug
                        ? `https://leetcode.com/problems/${problem.titleSlug}/`
                        : '',
                    timestamp: problem.timestamp || null,
                })) || [];

        // Return data in the desired format
        return {
            username: username || 'N/A',
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            contestBadge,
            rating: 2000, // Static rating, adjust if dynamic rating logic is added
            recentProblems: problems,
        };
    } catch (error) {
        console.error('Error fetching LeetCode data:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status code:', error.response.status);
        }
        // Return a consistent error fallback structure
        return {
            username: username || 'N/A',
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            contestBadge: 'No Badge',
            rating: 0,
            recentProblems: [],
        };
    }
}

// // Usage
//getLeetCodeStats("vikashchaurasia290302").then((data) => console.log(data));
