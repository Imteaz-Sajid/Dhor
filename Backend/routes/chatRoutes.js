const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getMessages,
} = require('../controllers/chatController');

const { protect } = require('../middleware/auth');

router.get('/', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;