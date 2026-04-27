const Comment = require('../models/Comment');
const Report  = require('../models/Report');
const User    = require('../models/User');

// GET /api/comments/:reportId
// Fetch all comments for a report, newest first, with user info populated.
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ reportId: req.params.reportId })
      .populate('userId', 'name trustScore badges profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// POST /api/comments/:reportId
// Add a comment. Only users whose district + thana match the report's location may comment.
exports.addComment = async (req, res) => {
  const { reportId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  try {
    const [report, user] = await Promise.all([
      Report.findById(reportId).select('district thana').lean(),
      User.findById(req.userId).select('district thana').lean(),
    ]);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.district !== report.district || user.thana !== report.thana) {
      return res.status(403).json({
        success: false,
        message: 'Only local residents can comment on this report.',
      });
    }

    const comment = await Comment.create({
      reportId,
      userId: req.userId,
      text: text.trim(),
    });

    const populated = await Comment.findById(comment._id)
      .populate('userId', 'name trustScore badges profilePicture')
      .lean();

    return res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
