const express = require('express');
const router = express.Router();
const { castVote, getVoteStats } = require('../controllers/voteController');
const { protect } = require('../middleware/auth');

router.post('/:reportId', protect, castVote);
router.get('/:reportId/stats', protect, getVoteStats);

module.exports = router;
