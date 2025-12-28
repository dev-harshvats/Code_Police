const cron = require('node-cron');
const pool = require('../config/db');
const cfService = require('./codeforcesService');
const lcService = require('./leetcodeService');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 1. EXISTING: UPDATE STATS (Runs every 2 hours) ---
const updateUserStats = async () => {
    console.log('[Cron] Starting scheduled stats update...');
    try {
        const { rows: users } = await pool.query('SELECT id, codeforces_handle, leetcode_handle FROM users');

        for (const user of users) {
            // Update CF
            if (user.codeforces_handle) {
                try {
                    const data = await cfService.fetchCFStats(user.codeforces_handle);
                    if (data) {
                        await pool.query(
                            'UPDATE users SET cf_rating = $1, cf_solved = $2 WHERE id = $3', 
                            [data.rating, data.totalSolved, user.id]
                        );
                    }
                } catch (err) {}
                await sleep(500); 
            }

            // Update LC
            if (user.leetcode_handle) {
                try {
                    const data = await lcService.fetchLeetcodeStats(user.leetcode_handle);
                    if (data) {
                        await pool.query(
                            'UPDATE users SET lc_solved = $1, lc_rating = $2 WHERE id = $3', 
                            [data.totalSolved, data.rating, user.id]
                        );
                    }
                } catch (err) {}
                await sleep(2000);
            }
        }
        console.log('[Cron] Stats update complete.');
    } catch (err) {
        console.error('[Cron] Error:', err.message);
    }
};

// --- 2. NEW: MIDNIGHT RESET (Runs at 00:00) ---
const resetDailyGoals = async () => {
    console.log('[Cron] Performing Midnight Goal Reset...');
    try {
        // Set the "Start Count" to the "Current Solved Count" for all users
        // This effectively resets "Today's Solved" to 0
        await pool.query(`
            UPDATE users 
            SET cf_start_count = cf_solved, 
                lc_start_count = lc_solved
        `);
        console.log('[Cron] Daily baselines reset successfully.');
    } catch (err) {
        console.error('[Cron] Midnight Reset Failed:', err.message);
    }
};

const startCron = () => {
    // 1. Update Stats every 2 hours
    cron.schedule('0 */2 * * *', updateUserStats);
    
    // 2. Reset Daily Goal Baseline at Midnight (00:00)
    cron.schedule('0 0 * * *', resetDailyGoals);

    console.log('[System] Cron Jobs scheduled (Stats: 2h, Reset: Midnight).');
};

module.exports = { startCron, updateUserStats };