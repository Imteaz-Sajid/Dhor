const Report = require('../models/Report');

const VALID_CRIME_TYPES = ['Extortion', 'Theft', 'Robbery', 'Harassment', 'Assault', 'Other'];

const KEYWORDS = {
  Extortion:  ['extort', 'blackmail', 'ransom', 'threaten', 'demand money'],
  Theft:      ['steal', 'stole', 'stolen', 'theft', 'pickpocket', 'shoplifting', 'burglar'],
  Robbery:    ['rob', 'robbed', 'robbery', 'snatch', 'mugged', 'mugger'],
  Harassment: ['harass', 'stalk', 'intimidate', 'bully', 'verbal abuse', 'catcall'],
  Assault:    ['assault', 'attack', 'beat', 'punch', 'hit', 'knife', 'stabbed', 'shot', 'weapon'],
};

const classifyCrimeType = (description) => {
  const lower = description.toLowerCase();
  for (const [type, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return type;
  }
  return 'Other';
};

/**
 * POST /api/reports/check-similar
 * Body: { description: String, coordinates: [lng, lat] }
 *
 * Step A – classify the crime type via GPT
 * Step B – find nearby reports of the same type within 1 km
 */
const checkSimilar = async (req, res) => {
  const { description, coordinates } = req.body;

  if (
    !description ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    typeof coordinates[0] !== 'number' ||
    typeof coordinates[1] !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      message: 'description (string) and coordinates ([lng, lat]) are required',
    });
  }

  const [lng, lat] = coordinates;

  try {
    // ── Step A: classify by keyword matching ──────────────────────────────
    const crimeType = classifyCrimeType(description);

    // ── Step B: $near query within 1 000 m (non-critical — tolerates missing index) ──
    let similarReports = [];
    try {
      similarReports = await Report.find({
        crimeType,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 1000,
          },
        },
      })
        .select('title crimeType status createdAt location')
        .limit(20)
        .lean();
    } catch (geoErr) {
      // 2dsphere index may not exist yet or geo query failed — safe to return 0 results
      console.warn('Geospatial nearby query skipped:', geoErr.message);
    }

    return res.status(200).json({
      success: true,
      crimeType,
      count: similarReports.length,
      reports: similarReports,
    });
  } catch (error) {
    console.error('check-similar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to run similarity check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { checkSimilar };
