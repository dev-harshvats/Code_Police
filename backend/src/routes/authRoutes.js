const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Renamed for clarity if needed, or keep 'auth'

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/profile', authMiddleware, authController.updateProfile);
// New Route
router.put('/goal', authMiddleware, authController.updateGoal);

module.exports = router;