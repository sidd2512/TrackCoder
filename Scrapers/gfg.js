import { chromium } from 'playwright';

export default async function getGFGProfileData(username) {
    console.log('gfg fatching started');
    
    const mainUrl = `https://auth.geeksforgeeks.org/user/${username}/practice/`;
    const profileUrl = `https://www.geeksforgeeks.org/user/${username}`;

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const profileData = {
        username: username,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        rating: '0',
        contestBadge: 'No Badge',
        recentProblems: []
    };

    try {
        // Extract coding scores and badges from profile URL
        await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.scoreCards_head__G_uNQ', { timeout: 60000 });

        // Use broader selectors to handle potential structure changes
        // Use broader selectors to handle potential structure changes
        const codingStats = await page.evaluate(() => {
            const result = {
                totalSolved: 0,
                contestBadge: 'No Badge',
                rating: 'Unrated'
            };

            document.querySelectorAll('.scoreCard_head__nxXR8').forEach((card) => {
                const label = card.querySelector('.scoreCard_head_left--text__KZ2S1')?.textContent.trim();
                const value = card.querySelector('.scoreCard_head_left--score__oSi_x')?.textContent.trim();

                if (label === 'Problem Solved') result.totalSolved = parseInt(value) || 0;
                if (label === 'Contest Badge') result.contestBadge = value || 'No Badge';
                if (label === 'Contest Rating') result.rating = value || 'Unrated';
            });

            return result;
        });

        profileData.totalSolved = codingStats.totalSolved;
        profileData.contestBadge = codingStats.contestBadge;
        profileData.rating = codingStats.rating;

        // Extract question data from practice URL
        await page.goto(mainUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.basic_details_data', { timeout: 60000 });

        const { questions, difficultySolved } = await page.evaluate(() => {
            const difficulties = {
                school: 'Easy',
                basic: 'Easy',
                easy: 'Easy',
                medium: 'Medium',
                hard: 'Hard'
            };

            const questions = [];
            const difficultySolved = { easy: 0, medium: 0, hard: 0 };

            Object.keys(difficulties).forEach((difficultyKey) => {
                const difficultyName = difficulties[difficultyKey];
                const elements = document.querySelectorAll(`#${difficultyKey} a`);

                elements.forEach((el) => {
                    const title = el.textContent.trim();
                    const href = el.getAttribute('href') || '';
                    const link = href.startsWith('https://')
                        ? href
                        : `https://practice.geeksforgeeks.org${href}`;

                    questions.push({
                        title,
                        difficulty: difficultyName,
                        link,
                        // id: `${questions.length + 1}`
                    });

                    difficultySolved[difficultyKey]++;
                });
            });

            return { questions, difficultySolved };
        });

        // Assign all fetched questions to recentProblems
        profileData.recentProblems = questions;

        // Map the solved counts by difficulty
        profileData.easySolved = difficultySolved.easy || 0;
        profileData.mediumSolved = difficultySolved.medium || 0;
        profileData.hardSolved = difficultySolved.hard || 0;

    } catch (error) {
        console.error('Error fetching GFG data:', error.message);
    } finally {
        await browser.close();
    }

    return profileData;
}

// Usage
// getGFGProfileData("study9wm3")
//     .then((data) => console.log(JSON.stringify(data, null, 2)))
//     .catch(console.error);
