const PoliceStation = require('../models/PoliceStation');
const User          = require('../models/User');

// Helper – returns 403 if caller is not a police user
const assertPolice = async (userId, res) => {
  const user = await User.findById(userId).select('role').lean();
  if (!user || user.role !== 'police') {
    res.status(403).json({ success: false, message: 'Forbidden: Police access only' });
    return false;
  }
  return true;
};

// GET /api/stations  — public
exports.getAllStations = async (req, res) => {
  try {
    const stations = await PoliceStation.find().sort({ name: 1 });
    return res.status(200).json({ success: true, stations });
  } catch (error) {
    console.error('Get stations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stations' });
  }
};

// POST /api/stations  — police only
exports.addStation = async (req, res) => {
  if (!(await assertPolice(req.userId, res))) return;

  const { name, contactNumber, email } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Station name is required' });
  }

  try {
    const station = await PoliceStation.create({
      name: name.trim(),
      ...(contactNumber && { contactNumber }),
      ...(email && { email }),
    });
    return res.status(201).json({ success: true, station });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A station with this name already exists' });
    }
    console.error('Add station error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add station' });
  }
};

// PUT /api/stations/:id  — police only
exports.updateStation = async (req, res) => {
  if (!(await assertPolice(req.userId, res))) return;

  const { contactNumber, email } = req.body;
  const updates = {};
  if (contactNumber !== undefined) updates.contactNumber = contactNumber;
  if (email !== undefined)         updates.email         = email;

  try {
    const station = await PoliceStation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    return res.status(200).json({ success: true, station });
  } catch (error) {
    console.error('Update station error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update station' });
  }
};
