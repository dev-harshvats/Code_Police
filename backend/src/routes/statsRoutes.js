const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const statsController = require('../controllers/statsController');

// Route: GET /api/stats/codeforces
// Private: Get personal stats (keep auth here)
router.get('/:platform', auth, statsController.getStats);

// Public: Get Leaderboard (REMOVE auth here)
router.get('/leaderboard/:platform', statsController.getLeaderboard);

module.exports = router;