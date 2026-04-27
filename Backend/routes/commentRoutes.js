const express = require('express');
const router  = express.Router();
const { getComments, addComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:reportId',  protect, getComments);
router.post('/:reportId', protect, addComment);

module.exports = router;
