import axios from 'axios';

async function getLeetCodeUserData(username) {
  const LEETCODE_API = 'https://leetcode.com/graphql';
  
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      recentAcSubmissionList(username: $username, limit: 20) {
        title
        titleSlug
        timestamp
      }
      userContestRanking(username: $username) {
        rating
        badge {
          name
        }
      }
    }
  `;

  try {
    const response = await axios.post(LEETCODE_API, {
      query,
      variables: { username },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (response.data.errors) {
      console.error('Error:', response.data.errors[0].message);
      return null;
    }

    const data = response.data.data;
    if (!data.matchedUser) {
      return {
        username: username || 'N/A',
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        contestBadge: 'No Badge',
        rating: 0,
        recentProblems: []
      };
    }

    // Extract solved counts by difficulty
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    data.matchedUser.submitStats.acSubmissionNum.forEach(stat => {
      if (stat.difficulty === 'All') totalSolved = stat.count;
      else if (stat.difficulty === 'Easy') easySolved = stat.count;
      else if (stat.difficulty === 'Medium') mediumSolved = stat.count;
      else if (stat.difficulty === 'Hard') hardSolved = stat.count;
    });

    // Process recent problems without difficulty
    const recentProblems = data.recentAcSubmissionList.map(sub => ({
      title: sub.title,
      link: `https://leetcode.com/problems/${sub.titleSlug}/`,
      timestamp: sub.timestamp.toString()
    }));

    return {
      username: data.matchedUser.username,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestBadge: data.userContestRanking?.badge?.name || 'No Badge',
      rating: Math.round(data.userContestRanking?.rating || 0),
      recentProblems
    };

  } catch (error) {
    console.error('Request failed:', error.message);
    return {
      username: username || 'N/A',
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      contestBadge: 'No Badge',
      rating: 0,
      recentProblems: []
    };
  }
}

// Example usage
// async function main() {
//   const username = 'siddharthcpn2512';
//   const userData = await getLeetCodeUserData(username);
  
//   console.log(JSON.stringify(userData, null, 2));
// }

// main();