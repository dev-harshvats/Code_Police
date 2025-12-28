const pool = require('../config/db');
const cfService = require('../services/codeforcesService');
const lcService = require('../services/leetcodeService');
const NodeCache = require('node-cache');

// Cache Leaderboard for 5 mins to save resources
const cache = new NodeCache({ stdTTL: 300 });

exports.getStats = async (req, res) => {
  const userId = req.user.id;
  const { platform } = req.params;

  try {
    // 1. Get User Data & Goal Baselines from DB
    const userRes = await pool.query(
        'SELECT codeforces_handle, leetcode_handle, daily_goal, cf_start_count, lc_start_count, cf_solved, lc_solved, cf_rating, lc_rating FROM users WHERE id = $1', 
        [userId]
    );
    
    if (userRes.rows.length === 0) return res.status(404).json({ msg: 'User not found' });
    
    const user = userRes.rows[0];

    // 2. Prepare Parallel Fetches (Fetch BOTH platforms to update Daily Goal)
    const cfPromise = user.codeforces_handle 
        ? cfService.fetchCFStats(user.codeforces_handle) 
        : Promise.resolve(null);

    const lcPromise = user.leetcode_handle 
        ? lcService.fetchLeetcodeStats(user.leetcode_handle) 
        : Promise.resolve(null);

    // 3. Execute Fetches Parallelly
    const [cfResult, lcResult] = await Promise.allSettled([cfPromise, lcPromise]);

    // --- PROCESS CODEFORCES ---
    let cfSolved = user.cf_solved || 0;
    let cfRating = user.cf_rating || 0;

    if (cfResult.status === 'fulfilled' && cfResult.value) {
        const data = cfResult.value;
        // Only update DB if numbers changed
        if (data.totalSolved !== cfSolved || data.rating !== cfRating) {
            await pool.query('UPDATE users SET cf_rating = $1, cf_solved = $2 WHERE id = $3', 
                [data.rating, data.totalSolved, userId]);
            cfSolved = data.totalSolved;
            cfRating = data.rating;
        }
    }

    // --- PROCESS LEETCODE ---
    let lcSolved = user.lc_solved || 0;
    let lcRating = user.lc_rating || 0;

    if (lcResult.status === 'fulfilled' && lcResult.value) {
        const data = lcResult.value;
        if (data.totalSolved !== lcSolved || data.rating !== lcRating) {
            await pool.query('UPDATE users SET lc_solved = $1, lc_rating = $2 WHERE id = $3', 
                [data.totalSolved, data.rating, userId]);
            lcSolved = data.totalSolved;
            lcRating = data.rating;
        }
    }

    // 4. AUTO-INITIALIZE BASELINE (Important for new feature!)
    // If you have never run the midnight script, your start_count is 0.
    // We set it to your CURRENT count so your "Daily Progress" starts fresh from 0 today.
    if (user.cf_start_count === 0 && cfSolved > 0) {
        await pool.query('UPDATE users SET cf_start_count = $1 WHERE id = $2', [cfSolved, userId]);
        user.cf_start_count = cfSolved;
    }
    if (user.lc_start_count === 0 && lcSolved > 0) {
        await pool.query('UPDATE users SET lc_start_count = $1 WHERE id = $2', [lcSolved, userId]);
        user.lc_start_count = lcSolved;
    }

    // 5. Calculate "Today's Progress"
    const cfToday = Math.max(0, cfSolved - (user.cf_start_count || 0));
    const lcToday = Math.max(0, lcSolved - (user.lc_start_count || 0));
    const totalToday = cfToday + lcToday;

    // 6. Calculate Rank
    const rankQuery = await pool.query(
        platform === 'codeforces' 
        ? 'SELECT COUNT(*) FROM users WHERE cf_rating > $1' 
        : 'SELECT COUNT(*) FROM users WHERE lc_solved > $1', 
        [platform === 'codeforces' ? cfRating : lcSolved]
    );
    const websiteRank = parseInt(rankQuery.rows[0].count) + 1;

    // 7. Return Data
    return res.json({
        handle: platform === 'codeforces' ? user.codeforces_handle : user.leetcode_handle,
        rating: platform === 'codeforces' ? cfRating : lcRating,
        solved: platform === 'codeforces' ? cfSolved : lcSolved,
        websiteRank,
        dailyGoal: user.daily_goal || 3, // Default goal
        todaySolved: totalToday          // <--- This is what your dashboard needs
    });

  } catch (err) {
    console.error("Stats Controller Error:", err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLeaderboard = async (req, res) => {
  const { platform } = req.params;
  const cacheKey = `leaderboard_${platform}`;

  try {
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

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

    cache.set(cacheKey, rankedUsers);
    res.json(rankedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};