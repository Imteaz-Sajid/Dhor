const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/statController');

// @route   GET /api/stats/overview
// @desc    Get aggregated crime statistics
// @access  Public
router.get('/overview', getOverview);

module.exports = router;
