const Report = require('../models/Report');
const Notification = require('../models/Notification');

const policeOnly = (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Access denied. Police role required.',
  });
};

/**
 * PATCH /api/police/verify/:reportId
 * Mark report as verified by police.
 */
exports.verifyReport = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'police') {
      return policeOnly(req, res);
    }

    const { reportId } = req.params;
    const report = await Report.findByIdAndUpdate(
      reportId,
      { isPoliceVerified: true },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await Notification.create({
      userId: report.userId,
      reportId: report._id,
      message: `Police have verified your report "${report.title}".`,
    });

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('verifyReport error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify report' });
  }
};

/**
 * PATCH /api/police/not-verified/:reportId
 * Explicitly mark report as not verified by police.
 */
exports.markNotVerified = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'police') {
      return policeOnly(req, res);
    }

    const { reportId } = req.params;
    const report = await Report.findByIdAndUpdate(
      reportId,
      { isPoliceVerified: false },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('markNotVerified error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark not verified' });
  }
};

/**
 * PATCH /api/police/assign/:reportId
 * Assign a case to the current officer.
 */
exports.assignCase = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'police') {
      return policeOnly(req, res);
    }

    const { reportId } = req.params;
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.assignedOfficer) {
      return res.status(400).json({
        success: false,
        message: 'This case is already assigned to an officer.',
      });
    }

    report.assignedOfficer = req.user.id;
    report.policeStatus = 'Assigned';
    await report.save();

    await Notification.create({
      userId: report.userId,
      reportId: report._id,
      message: `Your report "${report.title}" has been assigned to an officer.`,
    });

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('assignCase error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign case' });
  }
};

/**
 * PATCH /api/police/case-status/:reportId
 * Assigned officer can update policeStatus. If Solved, set report.status to Resolved.
 */
exports.updateCaseStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'police') {
      return policeOnly(req, res);
    }

    const { reportId } = req.params;
    const { policeStatus } = req.body;

    const validStatuses = ['Open', 'Assigned', 'Solved'];
    if (!validStatuses.includes(policeStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid policeStatus. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (!report.assignedOfficer || report.assignedOfficer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned officer can update this case.',
      });
    }

    report.policeStatus = policeStatus;
    if (policeStatus === 'Solved') {
      report.status = 'Resolved';
    }

    await report.save();

    await Notification.create({
      userId: report.userId,
      reportId: report._id,
      message: policeStatus === 'Solved'
        ? `Police have marked your report "${report.title}" as solved.`
        : `Police updated the case status of your report "${report.title}" to ${policeStatus}.`,
    });

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('updateCaseStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update case status' });
  }
};

/**
 * GET /api/police/my-cases
 * Return assigned and solved cases for the current officer.
 */
exports.getMyCases = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'police') {
      return policeOnly(req, res);
    }

    const assigned = await Report.find({
      assignedOfficer: req.user.id,
      policeStatus: 'Assigned',
    })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name')
      .lean();

    const solved = await Report.find({
      assignedOfficer: req.user.id,
      policeStatus: 'Solved',
    })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name')
      .lean();

    return res.status(200).json({ success: true, assigned, solved });
  } catch (error) {
    console.error('getMyCases error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cases' });
  }
};
