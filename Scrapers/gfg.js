
import { chromium } from 'playwright';

export default async function getGFGProfileData(username) {
    console.log('Fetching GFG profile data...');
    
    const profileUrl = `https://auth.geeksforgeeks.org/user/${username}/practice/`;
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const profileData = {
        username: username,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        contestBadge: 'No Badge',
        recentProblems: []
    };

    try {
        // Navigate to the profile page
        await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.solvedProblemSection_head__VEUg4', { timeout: 60000 });

        // Extract difficulty-wise counts
        const difficultyCounts = await page.evaluate(() => {
            const counts = {
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

            document.querySelectorAll('.problemNavbar_head_nav--text__UaGCx').forEach((el) => {
                const [difficultyLabel, count] = el.textContent.trim().split(/\s*\(\s*|\s*\)/);
                const difficultyKey = difficultyMap[difficultyLabel.toUpperCase()];
                if (difficultyKey && count) {
                    counts[difficultyKey] += parseInt(count, 10) || 0;
                }
            });

            return counts;
        });

        profileData.easySolved = difficultyCounts.easy;
        profileData.mediumSolved = difficultyCounts.medium;
        profileData.hardSolved = difficultyCounts.hard;
        profileData.totalSolved = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard;

        // Extract recent problems
        const recentProblems = await page.evaluate(() => {
            const problems = [];

            document.querySelectorAll('.problemList_head_list_item__RlO_s a').forEach((el) => {
                const title = el.textContent.trim();
                const href = el.getAttribute('href') || '';
                const link = href.startsWith('https://')
                    ? href
                    : `https://practice.geeksforgeeks.org${href}`;

                problems.push({
                    title,
                    difficulty: 'Easy', // Difficulty can be mapped if needed
                    link
                });
            });

            return problems;
        });

        profileData.recentProblems = recentProblems;
    } catch (error) {
        console.error('Error fetching GFG data:', error.message);
    } finally {
        await browser.close();
    }

    return profileData;
}

// Usage
// getGFGProfileData('study9wm3')
//     .then((data) => console.log(JSON.stringify(data, null, 2)))
//     .catch(console.error);
