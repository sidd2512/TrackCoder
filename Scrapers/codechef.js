import { chromium } from 'playwright';

export default async function getCodeChefStats(username) {
    const url = `https://www.codechef.com/users/${username}`;

    try {
        // Launch the browser
        const browser = await chromium.launch();  // Set headless to false for debugging
        const page = await browser.newPage();

        // Navigate to the CodeChef profile page
        await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });

        // Wait for the user profile container to ensure page load
        await page.waitForSelector(".user-profile-container", { timeout: 120000 });

        // Extract rating
        const rating = await page.locator(".rating-number").textContent().then(text => parseInt(text.trim())).catch(() => 0);

        // Extract total solved problems
        const totalSolved = await page.locator(".rating-data-section.problems-solved h3").nth(3).textContent().then(text => {
            const match = text.match(/\d+/);  // Extract number from text
            return match ? parseInt(match[0]) : 0;
        }).catch(() => 0);

        // Extract badges
        const badges = await page.$$eval(".widget.badges .badge .badge__title", badgeElements =>
            badgeElements.map(badge => badge.textContent.trim())
        );
        const contestBadge = badges.length > 0 ? badges.join(', ') : 'No Badge';

        // Initialize list for recent problems and start timer
        const recentProblems = [];
        const startTime = Date.now();
        const maxTime = 60000; // Maximum time to keep loading new pages (60 seconds)

        while ((Date.now() - startTime) < maxTime) {
            // Wait for recent problems table content to load
            await page.waitForSelector(".table-questions.content tbody", { timeout: 120000 });

            // Extract current page problems
            const pageProblems = await page.$$eval(".table-questions.content tbody tr", rows => {
                return Array.from(rows).map(row => {
                    const status = row.querySelector('td:nth-child(3) span')?.title || '';
                    if (status.toLowerCase().includes('accepted')) {
                        const time = row.querySelector('td:nth-child(1) .tooltiptext')?.innerText.trim() || '';
                        const title = row.querySelector('td:nth-child(2) a')?.innerText.trim() || '';
                        const link = row.querySelector('td:nth-child(2) a')?.getAttribute('href');
                        const fullLink = link ? 'https://www.codechef.com' + link : null;

                        return {
                            title,
                            time,
                            link: fullLink
                        };
                    }
                    return null; // Exclude non-accepted solutions
                }).filter(Boolean); // Filter out null entries
            });

            // Add extracted problems to recentProblems
            recentProblems.push(...pageProblems);

            // Check if there is a "Next" button available
            const nextButton = await page.$('a[onclick*="onload_getpage_recent_activity_user(\'next\');"]');
if (!nextButton) break; // Exit if no "Next" button is found

// Click the "Next" button to load the next page
await nextButton.click();
            
            // Wait for the next page to load by waiting for the page number to change
            await page.waitForTimeout(2500); // Small delay to give time for the page content to update
        }

        // Close the browser
        await browser.close();

        // Return structured data
        return {
            username,
            totalSolved,
            rating,
            contestBadge,
            recentProblems
        };
    } catch (error) {
        console.error('Error fetching CodeChef data:', error.message);
        return null;
    }
}

// Usage example
// getCodeChefStats("cc2k22").then(data => console.log(JSON.stringify(data, null, 2)));



// getCodeChefStats("cc2k22").then(data => console.log(JSON.stringify(data, null, 2)));
