const Report = require('../models/Report');
const Vote = require('../models/Vote');

/**
 * GET /api/user/my-reports
 * Fetch all reports submitted by the logged-in user,
 * along with vote counts for each report.
 */
exports.getMyReports = async (req, res) => {
  try {
    // Fetch the user's reports, newest first
    const reports = await Report.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('assignedOfficer', 'name')
      .lean();

    // Get vote counts for all report IDs in a single aggregation
    const reportIds = reports.map((r) => r._id);

    const voteCounts = await Vote.aggregate([
      { $match: { reportId: { $in: reportIds } } },
      {
        $group: {
          _id: { reportId: '$reportId', voteType: '$voteType' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a lookup: reportId -> { confirm, dispute }
    const voteMap = {};
    voteCounts.forEach((v) => {
      const rid = v._id.reportId.toString();
      if (!voteMap[rid]) voteMap[rid] = { confirm: 0, dispute: 0 };
      if (v._id.voteType === 'Confirm') voteMap[rid].confirm = v.count;
      if (v._id.voteType === 'Dispute') voteMap[rid].dispute = v.count;
    });

    // Attach vote counts to each report
    const enrichedReports = reports.map((r) => ({
      ...r,
      votes: voteMap[r._id.toString()] || { confirm: 0, dispute: 0 },
    }));

    // Compute summary stats
    const total = reports.length;
    const investigating = reports.filter((r) => r.status === 'Investigating').length;
    const resolved = reports.filter((r) => r.status === 'Resolved').length;

    res.status(200).json({
      success: true,
      data: {
        reports: enrichedReports,
        stats: { total, investigating, resolved },
      },
    });
  } catch (error) {
    console.error('getMyReports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};
