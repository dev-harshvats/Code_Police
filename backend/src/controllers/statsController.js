const pool = require('../config/db');
const cfService = require('../services/codeforcesService');
const lcService = require('../services/leetcodeService');
const NodeCache = require('node-cache');

// Initialize Cache (TTL = 300 seconds / 5 minutes)
const cache = new NodeCache({ stdTTL: 300 });

// ... (getStats remains the same, or you can cache individual stats too if you want)

exports.getStats = async (req, res) => {
    // Keep your existing getStats code here...
    // We usually don't cache individual 'getStats' heavily because users want instant feedback when they update profile
    // ... (Paste your existing getStats function here) ...
    const userId = req.user.id;
    const { platform } = req.params;

    try {
        const userRes = await pool.query('SELECT codeforces_handle, leetcode_handle FROM users WHERE id = $1', [userId]);
        
        if (userRes.rows.length === 0) return res.status(404).json({ msg: 'User not found' });
        
        const { codeforces_handle, leetcode_handle } = userRes.rows[0];

        // --- CODEFORCES ---
        if (platform === 'codeforces') {
        if (!codeforces_handle) return res.status(400).json({ msg: 'Codeforces handle not linked' });

        try {
            const data = await cfService.fetchCFStats(codeforces_handle);
            
            // UPDATE both Rating and Solved count
            await pool.query('UPDATE users SET cf_rating = $1, cf_solved = $2 WHERE id = $3', 
                [data.rating, data.totalSolved, userId]
            );
            
            const rankQuery = await pool.query('SELECT COUNT(*) FROM users WHERE cf_rating > $1', [data.rating]);
            const websiteRank = parseInt(rankQuery.rows[0].count) + 1;

            return res.json({
                userId, 
                handle: data.handle, 
                rating: data.rating,       // Primary Metric
                solved: data.totalSolved,  // Secondary Metric
                websiteRank
            });
        } catch (error) {
            return res.status(500).json({ msg: 'Failed to fetch Codeforces data' });
        }

        // --- LEETCODE ---
        } else if (platform === 'leetcode') {
            if (!leetcode_handle) return res.status(400).json({ msg: 'Leetcode handle not linked' });

            const data = await lcService.fetchLeetcodeStats(leetcode_handle); 
            
            if (!data) {
                return res.json({ userId, handle: leetcode_handle, solved: 0, rating: 0, websiteRank: 0 });
            }

            // UPDATE both Solved count and Rating
            await pool.query('UPDATE users SET lc_solved = $1, lc_rating = $2 WHERE id = $3', 
                [data.totalSolved, data.rating, userId]
            );

            const rankQuery = await pool.query('SELECT COUNT(*) FROM users WHERE lc_solved > $1', [data.totalSolved]);
            const websiteRank = parseInt(rankQuery.rows[0].count) + 1;

            return res.json({
                userId,
                handle: data.handle,
                solved: data.totalSolved, // Primary Metric
                rating: data.rating,      // Secondary Metric
                websiteRank
            });
        } else {
            return res.status(400).json({ msg: 'Invalid platform' });
        }
    } catch (err) {
        console.error("Stats Controller Error:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.getLeaderboard = async (req, res) => {
  const { platform } = req.params;
  const cacheKey = `leaderboard_${platform}`;

  try {
    // 1. Check Cache
    if (cache.has(cacheKey)) {
        console.log(`[Cache] Serving ${platform} leaderboard from memory.`);
        return res.json(cache.get(cacheKey));
    }

    // 2. If Miss, Query DB
    let query = '';
    if (platform === 'codeforces') {
      query = 'SELECT codeforces_handle as handle, cf_rating, cf_solved, id FROM users WHERE codeforces_handle IS NOT NULL ORDER BY cf_rating DESC LIMIT 50';
    } else {
      query = 'SELECT leetcode_handle as handle, lc_solved, lc_rating, id FROM users WHERE leetcode_handle IS NOT NULL ORDER BY lc_solved DESC LIMIT 50';
    }

    const result = await pool.query(query);

    const rankedUsers = result.rows.map((user, index) => ({
      handle: user.handle,
      rank: index + 1,
      cf_rating: user.cf_rating || 0,
      cf_solved: user.cf_solved || 0,
      lc_solved: user.lc_solved || 0,
      lc_rating: user.lc_rating || 0
    }));

    // 3. Save to Cache
    cache.set(cacheKey, rankedUsers);
    console.log(`[Cache] Refreshed ${platform} leaderboard.`);

    res.json(rankedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};