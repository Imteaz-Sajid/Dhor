const express = require('express');
const router  = express.Router();
const { createMissing, getMissing, updateStatus } = require('../controllers/missingController');
const protect = require('../middleware/auth');

router.get('/',              protect, getMissing);
router.post('/',             protect, createMissing);
router.put('/:id/status',    protect, updateStatus);

module.exports = router;
