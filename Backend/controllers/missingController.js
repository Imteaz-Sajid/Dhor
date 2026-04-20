const MissingEntity = require('../models/MissingEntity');
const User          = require('../models/User');

// POST /api/missing
exports.createMissing = async (req, res) => {
  const { entityType, nameOrModel, lastSeenLocation, lastSeenDate, descriptions, images } = req.body;

  if (!entityType || !nameOrModel || !lastSeenLocation || !lastSeenDate || !descriptions) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided' });
  }

  try {
    const entity = await MissingEntity.create({
      userId: req.userId,
      entityType,
      nameOrModel,
      lastSeenLocation,
      lastSeenDate,
      descriptions,
      images: images || [],
    });

    const populated = await MissingEntity.findById(entity._id)
      .populate('userId', 'name trustScore profilePicture')
      .lean();

    return res.status(201).json({ success: true, entity: populated });
  } catch (error) {
    console.error('Create missing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create missing report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/missing  — accepts ?entityType=Person|Vehicle and ?status=Missing|Found
exports.getMissing = async (req, res) => {
  const { entityType, status } = req.query;
  const filter = {};

  if (entityType && ['Person', 'Vehicle'].includes(entityType)) filter.entityType = entityType;
  if (status     && ['Missing', 'Found'].includes(status))      filter.status     = status;

  try {
    const entities = await MissingEntity.find(filter)
      .populate('userId', 'name trustScore profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, entities });
  } catch (error) {
    console.error('Get missing error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch missing reports' });
  }
};

// PUT /api/missing/:id/status  — owner or police only
exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Missing', 'Found'].includes(status)) {
    return res.status(400).json({ success: false, message: "status must be 'Missing' or 'Found'" });
  }

  try {
    const [entity, user] = await Promise.all([
      MissingEntity.findById(req.params.id).lean(),
      User.findById(req.userId).select('role').lean(),
    ]);

    if (!entity) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const isOwner  = entity.userId.toString() === req.userId;
    const isPolice = user && user.role === 'police';

    if (!isOwner && !isPolice) {
      return res.status(403).json({
        success: false,
        message: 'Only the report owner or police can update this status',
      });
    }

    const updated = await MissingEntity.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'name trustScore profilePicture').lean();

    return res.status(200).json({ success: true, entity: updated });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};
