Here’s the resolved version that keeps **all features**: it uses the updated `auth` export style and preserves the `assignedOfficer` population in the `/all` feed.

```js
const express = require('express');
const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { checkSimilar } = require('../controllers/aiController');

const router = express.Router();

// POST /api/reports/check-similar  (public – no auth needed for the AI pre-check)
router.post('/check-similar', checkSimilar);

// POST /api/reports  – persist a new crime report (protected)
router.post('/', protect, async (req, res) => {
  const { title, description, crimeType, imageUrl, coordinates, district, thana, isAnonymous } = req.body;

  if (
    !title ||
    !description ||
    !crimeType ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2
  ) {
    return res.status(400).json({
      success: false,
      message: 'title, description, crimeType, and coordinates ([lng, lat]) are required',
    });
  }

  const [lng, lat] = coordinates;

  try {
    const report = await Report.create({
      userId: req.userId,
      title,
      description,
      crimeType,
      imageUrl: imageUrl || null,
      district: district || '',
      thana: thana || '',
      isAnonymous: isAnonymous || false,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    });

    // Notify users in the same district & thana
    if (district && thana) {
      const areaUsers = await User.find({
        _id: { $ne: req.userId },
        district,
        thana,
      }).select('_id');

      if (areaUsers.length > 0) {
        const notifications = areaUsers.map((u) => ({
          userId: u._id,
          postId: report._id,
          message: 'New crime reported in your area. Please verify if you have information.',
          isRead: false,
        }));
        await Notification.insertMany(notifications);
      }
    }

    return res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/reports/all  – community feed (all reports, latest first, protected)
router.get('/all', protect, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name trustScore profilePicture')
      .populate('assignedOfficer', 'name')
      .lean();
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('Fetch all reports error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

// GET /api/reports  – list own reports (protected)
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

module.exports = router;
```
