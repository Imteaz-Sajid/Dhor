const express = require('express');
const router = express.Router();
const { protect, isPolice } = require('../middleware/auth');
const { updateReportStatus } = require('../controllers/policeController');
const {
  verifyReport,
  markNotVerified,
  assignCase,
  updateCaseStatus,
  getMyCases,
} = require('../controllers/policeActionController');

// PATCH /api/police/update-status/:reportId — police-only route to update report status
router.patch('/update-status/:reportId', protect, isPolice, updateReportStatus);

// PATCH /api/police/verify/:reportId — police-only verification
router.patch('/verify/:reportId', protect, isPolice, verifyReport);

// PATCH /api/police/not-verified/:reportId — explicitly not verified
router.patch('/not-verified/:reportId', protect, isPolice, markNotVerified);

// PATCH /api/police/assign/:reportId — assign case to current officer
router.patch('/assign/:reportId', protect, isPolice, assignCase);

// PATCH /api/police/case-status/:reportId — update case status (assigned officer only)
router.patch('/case-status/:reportId', protect, isPolice, updateCaseStatus);

// GET /api/police/my-cases — assigned + solved cases for current officer
router.get('/my-cases', protect, isPolice, getMyCases);

module.exports = router;
