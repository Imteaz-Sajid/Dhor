const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getMyReports } = require('../controllers/userDashboardController');

// GET /api/user/my-reports — fetch logged-in user's reports with vote counts
router.get('/my-reports', protect, getMyReports);

module.exports = router;
