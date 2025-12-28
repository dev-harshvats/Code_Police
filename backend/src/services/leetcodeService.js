const axios = require('axios');

exports.fetchLeetcodeStats = async (handle) => {
    try {
        console.log(`[LC Service] Fetching for: ${handle}`);

        const query = `
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
        `;

        const response = await axios.post(
            'https://leetcode.com/graphql',
            {
                query,
                variables: { username: handle }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    // UPDATED HEADERS to look like a real Mac/Chrome user
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': `https://leetcode.com/${handle}/`,
                    'Origin': 'https://leetcode.com'
                },
                timeout: 8000
            }
        );

        const data = response.data.data;

        if (!data || !data.matchedUser) {
            console.error("[LC Service] User not found");
            return null;
        }

        // 1. Solved Count
        const totalSolved = data.matchedUser.submitStats.acSubmissionNum.find(
            (item) => item.difficulty === 'All'
        ).count;

        // 2. Contest Rating
        const rating = data.userContestRanking 
            ? Math.round(data.userContestRanking.rating) 
            : 0;

        console.log(`[LC Service] Success: ${handle} | Solved: ${totalSolved}`);

        return {
            handle: handle,
            totalSolved: totalSolved,
            rating: rating
        };

    } catch (err) {
        console.error("[LC Service] Error:", err.message);
        return null;
    }
};