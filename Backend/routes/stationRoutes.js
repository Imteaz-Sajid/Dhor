const express = require('express');
const router  = express.Router();
const { getAllStations, addStation, updateStation } = require('../controllers/stationController');
const { protect } = require('../middleware/auth');

router.get('/',     getAllStations);          // public
router.post('/',    protect, addStation);     // police only
router.put('/:id',  protect, updateStation);  // police only

module.exports = router;
