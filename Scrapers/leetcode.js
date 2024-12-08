

import axios from 'axios';

export default async function getLeetCodeStats(username) {
    try {
        const url = `https://leetcode.com/graphql`;

        // Combined GraphQL query for both user profile and problem list
        const query = `
        query getUserProfileAndProblems($username: String!, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
            matchedUser(username: $username) {
                username
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
                contestBadge {
                    name
                }
            }
            problemsetQuestionList: questionList(
                categorySlug: ""
                limit: $limit
                skip: $skip
                filters: $filters
            ) {
                total: totalNum
                questions: data {
                    title
                    titleSlug
                    difficulty
                    status
                    questionFrontendId
                }
            }
        }`;

        const variables = {
            username,
            limit: 20, // Number of problems to fetch
            skip: 0,   // Pagination offset
            filters: {} // No status filter applied to fetch all questions
        };

        const response = await axios.post(
            url,
            { query, variables },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );

        const data = response.data.data;
        if (!data || !data.matchedUser) {
            throw new Error('User data not found');
        }

        // Extract user profile data
        const matchedUser = data.matchedUser;
        const acSubmissionNum = matchedUser.submitStats.acSubmissionNum || [];
        
        const easySolved = acSubmissionNum.find((item) => item.difficulty === 'Easy')?.count || 0;
        const mediumSolved = acSubmissionNum.find((item) => item.difficulty === 'Medium')?.count || 0;
        const hardSolved = acSubmissionNum.find((item) => item.difficulty === 'Hard')?.count || 0;
        const totalSolved = easySolved+mediumSolved+hardSolved;
        const contestBadge = matchedUser.contestBadge?.name || 'No Badge';

        // Extract problem list data
        const problems = data.problemsetQuestionList.questions.map((problem) => ({
            title: problem.title,
            difficulty: problem.difficulty,
            link: `https://leetcode.com/problems/${problem.titleSlug}/`,
            id: problem.questionFrontendId
        }));

        return {
            username,
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            contestBadge,
            rating:2000,
            recentProblems: problems
        };
    } catch (error) {
        console.error('Error fetching LeetCode data:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status code:', error.response.status);
        }
        return {
            error: 'Failed to fetch data. Please ensure the username is correct or try again later.'
        };
    }
}

// // Usage
//getLeetCodeStats("vikashchaurasia290302").then(data => console.log(data));
