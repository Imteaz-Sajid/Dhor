const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { updateReportStatus } = require('../controllers/policeController');

// PATCH /api/police/update-status/:reportId — police update report status
router.patch('/update-status/:reportId', protect, updateReportStatus);

module.exports = router;
