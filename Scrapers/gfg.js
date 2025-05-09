import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function getGFGProfileData(username) {
    console.log('Fetching GFG profile data...');
    
    const profileUrl = `https://auth.geeksforgeeks.org/user/${username}/practice/`;
    
    const profileData = {
        username: username,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        contestBadge: 'No Badge',
        recentProblems: []
    };
     if (!username) {
        return profileData;
      }
    try {
        // Fetch the profile page
        const response = await axios.get(profileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Extract difficulty-wise counts
        const difficultyCounts = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        const difficultyMap = {
            'SCHOOL': 'easy',
            'BASIC': 'easy',
            'EASY': 'easy',
            'MEDIUM': 'medium',
            'HARD': 'hard'
        };

        $('.problemNavbar_head_nav--text__UaGCx').each((i, el) => {
            const text = $(el).text().trim();
            const [difficultyLabel, count] = text.split(/\s*\(\s*|\s*\)/);
            const difficultyKey = difficultyMap[difficultyLabel.toUpperCase()];
            if (difficultyKey && count) {
                difficultyCounts[difficultyKey] += parseInt(count, 10) || 0;
            }
        });

        profileData.easySolved = difficultyCounts.easy;
        profileData.mediumSolved = difficultyCounts.medium;
        profileData.hardSolved = difficultyCounts.hard;
        profileData.totalSolved = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard;

        // Extract recent problems
        const recentProblems = [];
        $('.problemList_head_list_item__RlO_s a').each((i, el) => {
            const title = $(el).text().trim();
            const href = $(el).attr('href') || '';
            const link = href.startsWith('https://')
                ? href
                : `https://practice.geeksforgeeks.org${href}`;

            recentProblems.push({
                title,
                difficulty: 'Easy', // You might need to adjust this based on actual data
                link
            });
        });

        profileData.recentProblems = recentProblems;

    } catch (error) {
        console.error('Error fetching GFG data:', error.message);
        throw error; // Re-throw the error for the caller to handle
    }

    return profileData;
}

// // Usage
// getGFGProfileData('study9wm3')
//     .then((data) => console.log(JSON.stringify(data, null, 2)))
//     .catch(console.error);