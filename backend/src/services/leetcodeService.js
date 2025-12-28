const axios = require('axios');

exports.fetchLeetcodeStats = async (handle) => {
  try {
    console.log(`[LC Service] Fetching for: ${handle}`); 

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `
          query userStats($username: String!) {
            matchedUser(username: $username) {
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
            userContestRanking(username: $username) {
              rating
            }
          }
        `,
        variables: {
          username: handle
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': `https://leetcode.com/${handle}/`,
          'Origin': 'https://leetcode.com',
        },
        timeout: 8000
      }
    );

    const data = response.data;

    if (data.errors) {
      console.error(`[LC Service] API Error:`, data.errors);
      return null;
    }

    if (!data.data || !data.data.matchedUser) {
      console.error(`[LC Service] User not found: ${handle}`);
      return null;
    }

    // 1. Get Solved Count
    const totalSolved = data.data.matchedUser.submitStats.acSubmissionNum.find(
      (item) => item.difficulty === 'All'
    ).count;

    // 2. Get Contest Rating (Round to nearest integer)
    // Note: userContestRanking can be null if user never did a contest
    const contestRating = data.data.userContestRanking 
        ? Math.round(data.data.userContestRanking.rating) 
        : 0; 

    console.log(`[LC Service] Success: ${handle} | Solved: ${totalSolved} | Rating: ${contestRating}`);

    return {
      handle: handle,
      totalSolved: totalSolved,
      rating: contestRating
    };

  } catch (error) {
    console.error(`[LC Service] Error:`, error.message);
    return null;
  }
};