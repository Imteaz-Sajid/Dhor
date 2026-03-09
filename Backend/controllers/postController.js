const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Create a new crime report post
 * @route  POST /api/posts
 * @access Private
 */
exports.createPost = async (req, res) => {
  try {
    const { title, description, crimeType } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const poster = await User.findById(req.userId).select('-password');
    if (!poster) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const post = new Post({
      userId: req.userId,
      title,
      description,
      crimeType: crimeType || 'other',
      district: poster.district,
      thana: poster.thana,
      postedBy: poster.name,
    });

    await post.save();

    // Find all users in the same district AND thana, excluding the poster
    const areaUsers = await User.find({
      _id: { $ne: req.userId },
      district: poster.district,
      thana: poster.thana,
    }).select('_id');

    // Create a notification for every area user
    if (areaUsers.length > 0) {
      const notifications = areaUsers.map((user) => ({
        userId: user._id,
        postId: post._id,
        message: `Crime reported in ${poster.thana}, ${poster.district}: "${title}"`,
        isRead: false,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get all posts (latest first)
 * @route  GET /api/posts
 * @access Private
 */
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
