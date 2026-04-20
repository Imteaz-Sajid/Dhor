const Report = require('../models/Report');

/**
 * Get aggregated crime statistics
 * @route GET /api/stats/overview
 * @access Public
 */
exports.getOverview = async (req, res) => {
  try {
    const { district, thana, days } = req.query;

    // Build match filter
    const match = {};
    if (district) match.district = district;
    if (thana) match.thana = thana;
    if (days) {
      const daysNum = parseInt(days, 10);
      if (!isNaN(daysNum) && daysNum > 0) {
        match.createdAt = {
          $gte: new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000),
        };
      }
    }

    // Run all four aggregations in parallel
    const [crimeTypes, hotspots, trend, districtCounts] = await Promise.all([
      // Query 1: Crime Types distribution
      Report.aggregate([
        { $match: match },
        { $group: { _id: '$crimeType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Query 2: Top 5 most dangerous Thanas
      Report.aggregate([
        { $match: match },
        { $group: { _id: '$thana', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Query 3: Crime trend over time (grouped by month)
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Query 4: Per-district crime counts (for choropleth map)
      Report.aggregate([
        { $match: match },
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Format results
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    res.status(200).json({
      success: true,
      data: {
        crimeTypes: crimeTypes.map((c) => ({
          name: c._id || 'Unknown',
          value: c.count,
        })),
        hotspots: hotspots.map((h) => ({
          thana: h._id || 'Unknown',
          count: h.count,
        })),
        trend: trend.map((t) => ({
          month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
          count: t.count,
        })),
        districtCounts: districtCounts.map((d) => ({
          district: d._id || 'Unknown',
          count: d.count,
        })),
      },
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};
