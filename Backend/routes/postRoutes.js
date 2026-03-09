const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController');
const protect = require('../middleware/auth');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);

module.exports = router;
