import puppeteer from 'puppeteer';

export default async function getCodeChefStats(username) {
    const url = `https://www.codechef.com/users/${username}`;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to CodeChef profile page
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 200000 });
        await page.waitForSelector(".rating-number", { timeout: 60000 }).catch(() => null);
        await page.waitForSelector("section.rating-data-section p strong", { timeout: 60000 }).catch(() => null);

        const profileData = await page.evaluate(() => {
            // Extract core profile info
            const fullySolvedElement = document.querySelector("section.rating-data-section p strong");
            const ratingElement = document.querySelector(".rating-number");
            const contestElement = document.querySelector("section.rating-data-section article > p > strong:nth-of-type(2)");

            const fullySolved = fullySolvedElement ? parseInt(fullySolvedElement.innerText) : 0;
            const rating = ratingElement ? parseInt(ratingElement.innerText) : 0;
            const contestsGiven = contestElement ? parseInt(contestElement.innerText) : 0;

            // Extract recent problems
            const problems = [];
            const rows = document.querySelectorAll("div.table-questions table.dataTable tbody tr");

            rows.forEach(row => {
                const questionTitle = row.querySelector('td:nth-child(2)')?.innerText.trim() || '';
                const questionLink = row.querySelector('td:nth-child(2) a')?.getAttribute('href');
                const difficulty = row.querySelector('td:nth-child(3) span')?.getAttribute('title') || 'N/A';

                problems.push({
                    title: questionTitle,
                    difficulty: difficulty,
                    link: questionLink ? 'https://www.codechef.com' + questionLink : null
                });
            });

            return {
                fullySolved,
                rating,
                contestsGiven,
                problems
            };
        });

        await browser.close();

        // Format return object to match required structure
        return {
            username,
            totalSolved: profileData.fullySolved,
            contestBadge: profileData.rating ? `Rating: ${profileData.rating}` : 'No Badge',
            recentProblems: profileData.problems.slice(0, 3).map((problem, index) => ({
                title: problem.title,
                difficulty: problem.difficulty,
                link: problem.link,
                id: String(index + 1)  // Assign manual IDs to problems
            }))
        };
    } catch (error) {
        console.error('Error fetching CodeChef data:', error.message);
        return null;
    }
}

// Usage
 getCodeChefStats("cc2k22").then(data => console.log(JSON.stringify(data, null, 2)));
