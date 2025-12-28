const cron = require('node-cron');
const pool = require('../config/db');
const cfService = require('./codeforcesService');
const lcService = require('./leetcodeService');

// Helper for delay (to avoid rate limits)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateUserStats = async () => {
    console.log('[Cron] Starting scheduled update of all users...');
    
    try {
        // 1. Get all users
        const { rows: users } = await pool.query('SELECT id, codeforces_handle, leetcode_handle FROM users');
        console.log(`[Cron] Found ${users.length} users to update.`);

        for (const user of users) {
            // --- Update Codeforces ---
            if (user.codeforces_handle) {
                try {
                    const data = await cfService.fetchCFStats(user.codeforces_handle);
                    if (data) {
                        await pool.query(
                            'UPDATE users SET cf_rating = $1, cf_solved = $2 WHERE id = $3', 
                            [data.rating, data.totalSolved, user.id]
                        );
                        console.log(`[Cron] Updated CF for ${user.codeforces_handle}`);
                    }
                } catch (err) {
                    console.error(`[Cron] Failed CF update for ${user.codeforces_handle}: ${err.message}`);
                }
                // Wait 500ms between CF requests
                await sleep(500); 
            }

            // --- Update LeetCode ---
            if (user.leetcode_handle) {
                try {
                    const data = await lcService.fetchLeetcodeStats(user.leetcode_handle);
                    if (data) {
                        await pool.query(
                            'UPDATE users SET lc_solved = $1, lc_rating = $2 WHERE id = $3', 
                            [data.totalSolved, data.rating, user.id]
                        );
                        console.log(`[Cron] Updated LC for ${user.leetcode_handle}`);
                    }
                } catch (err) {
                    console.error(`[Cron] Failed LC update for ${user.leetcode_handle}: ${err.message}`);
                }
                // Wait 2 seconds between LC requests (Strict Rate Limits!)
                await sleep(2000);
            }
        }
        console.log('[Cron] Update cycle complete.');
        
    } catch (err) {
        console.error('[Cron] Critical Error:', err.message);
    }
};

const startCron = () => {
    // Schedule task to run every 2 hours: '0 */2 * * *'
    // For testing, you can change this to '* * * * *' (every minute)
    cron.schedule('0 */2 * * *', () => {
        updateUserStats();
    });
    
    console.log('[System] Cron Job scheduled (Every 2 Hours).');
};

module.exports = { startCron, updateUserStats };