const Report = require('../models/Report');
const Notification = require('../models/Notification');

/**
 * PATCH /api/police/update-status/:reportId
 * Police-only route to update a report's status and optionally add a note.
 */
exports.updateReportStatus = async (req, res) => {
  try {
    // Auth check: must be police role
    if (!req.user || req.user.role !== 'police') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Police role required.',
      });
    }

    const { reportId } = req.params;
    const { status, policeNote } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Investigating', 'Verified', 'Rejected', 'Resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Build update object
    const update = {};
    if (status) update.status = status;
    if (policeNote !== undefined) update.policeNote = policeNote;

    const report = await Report.findByIdAndUpdate(reportId, update, {
      new: true,
      runValidators: true,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Trigger notification to the user who filed the report
    if (status) {
      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        message: `Police have updated the status of your report "${report.title}" to ${status}.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: report,
    });
  } catch (error) {
    console.error('updateReportStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
};
