const Vote   = require('../models/Vote');
const Report = require('../models/Report');
const User   = require('../models/User');

// POST /api/votes/:reportId
// Create a new vote or update an existing one.
// Restricted to users whose district + thana match the report's location.
exports.castVote = async (req, res) => {
  const { reportId } = req.params;
  const { voteType } = req.body;

  if (!['Confirm', 'Dispute'].includes(voteType)) {
    return res.status(400).json({
      success: false,
      message: "voteType must be 'Confirm' or 'Dispute'",
    });
  }

  try {
    const [report, voter] = await Promise.all([
      Report.findById(reportId).select('district thana').lean(),
      User.findById(req.userId).select('district thana').lean(),
    ]);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (!voter) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sameArea =
      voter.district === report.district && voter.thana === report.thana;

    if (!sameArea) {
      return res.status(403).json({
        success: false,
        message: `Only residents of ${report.thana}, ${report.district} can vote on this report`,
      });
    }

    const vote = await Vote.findOneAndUpdate(
      { reportId, userId: req.userId },
      { voteType },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, vote });
  } catch (error) {
    console.error('Cast vote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cast vote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/votes/:reportId/stats
// Returns confirm/dispute counts, the current user's vote, and whether
// the current user is eligible to vote (same district + thana as the report).
exports.getVoteStats = async (req, res) => {
  const { reportId } = req.params;

  try {
    const [report, voter, confirmCount, disputeCount, userVoteDoc] = await Promise.all([
      Report.findById(reportId).select('district thana').lean(),
      User.findById(req.userId).select('district thana').lean(),
      Vote.countDocuments({ reportId, voteType: 'Confirm' }),
      Vote.countDocuments({ reportId, voteType: 'Dispute' }),
      Vote.findOne({ reportId, userId: req.userId }).select('voteType').lean(),
    ]);

    const eligible =
      report && voter
        ? voter.district === report.district && voter.thana === report.thana
        : false;

    return res.status(200).json({
      success: true,
      stats: {
        confirmCount,
        disputeCount,
        userVote: userVoteDoc ? userVoteDoc.voteType : null,
        eligible,
      },
    });
  } catch (error) {
    console.error('Get vote stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vote stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
