const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cfService = require('../services/codeforcesService');
const lcService = require('../services/leetcodeService');

exports.signup = async (req, res) => {
    let { email, password, cfHandle, leetcodeHandle } = req.body;
    
    if (!cfHandle || cfHandle.trim() === '') cfHandle = null;
    if (!leetcodeHandle || leetcodeHandle.trim() === '') leetcodeHandle = null;

    try {
        if (!cfHandle && !leetcodeHandle) {
            return res.status(400).json({ msg: 'Please provide at least one platform handle.' });
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert User
        const newUser = await pool.query(
            'INSERT INTO users (email, password, codeforces_handle, leetcode_handle) VALUES ($1, $2, $3, $4) RETURNING *',
            [email, hashedPassword, cfHandle, leetcodeHandle]
        );

        const userId = newUser.rows[0].id;

        // --- FETCH INITIAL STATS & SET BASELINE ---
        // We set cf_start_count = totalSolved immediately so "Today's Progress" starts at 0
        if (cfHandle) {
            cfService.fetchCFStats(cfHandle).then(data => {
                if (data) {
                    pool.query(
                        'UPDATE users SET cf_rating = $1, cf_solved = $2, cf_start_count = $2 WHERE id = $3', 
                        [data.rating, data.totalSolved, userId]
                    );
                }
            });
        }

        if (leetcodeHandle) {
            lcService.fetchLeetcodeStats(leetcodeHandle).then(data => {
                if (data) {
                    pool.query(
                        'UPDATE users SET lc_solved = $1, lc_rating = $2, lc_start_count = $1 WHERE id = $3', 
                        [data.totalSolved, data.rating, userId]
                    );
                }
            });
        }

        const payload = { user: { id: userId } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.rows[0].id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    let { codeforces_handle, leetcode_handle } = req.body;
    const userId = req.user.id;

    if (!codeforces_handle || codeforces_handle.trim() === '') codeforces_handle = null;
    if (!leetcode_handle || leetcode_handle.trim() === '') leetcode_handle = null;

    try {
        const result = await pool.query(
            'UPDATE users SET codeforces_handle = $1, leetcode_handle = $2 WHERE id = $3 RETURNING codeforces_handle, leetcode_handle',
            [codeforces_handle, leetcode_handle, userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- NEW: Update Daily Goal ---
exports.updateGoal = async (req, res) => {
    const { daily_goal } = req.body;
    const userId = req.user.id;
    try {
        await pool.query('UPDATE users SET daily_goal = $1 WHERE id = $2', [daily_goal, userId]);
        res.json({ msg: 'Goal updated' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};