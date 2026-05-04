/**
 * Seed script — Sample Crime Reports for Testing
 * Run once: node Backend/seed/seedReports.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');

const seedReports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'dhor',
    });

    console.log('Connected to MongoDB');

    // Check if reports already exist
    const existingCount = await Report.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} reports already exist. Skipping seed.`);
      process.exit(0);
    }

    // Create a test user first
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        phone: '01234567890',
        nid: '1234567890123',
        district: 'Dhaka',
        thana: 'Mirpur',
        role: 'user',
      });
      await testUser.save();
      console.log('Test user created');
    }

    // Sample crime reports with Bangladesh districts
    const sampleReports = [
      {
        userId: testUser._id,
        title: 'Bike Theft',
        description: 'Motorcycle stolen from main road',
        crimeType: 'Theft',
        district: 'Dhaka',
        thana: 'Mirpur',
        location: { type: 'Point', coordinates: [90.3656, 23.8103] },
      },
      {
        userId: testUser._id,
        title: 'Robbery',
        description: 'Street robbery near market',
        crimeType: 'Robbery',
        district: 'Chattogram',
        thana: 'Kotwali',
        location: { type: 'Point', coordinates: [91.8336, 22.3384] },
      },
      {
        userId: testUser._id,
        title: 'Harassment',
        description: 'Street harassment incident',
        crimeType: 'Harassment',
        district: 'Sylhet',
        thana: 'Sylhet Sadar',
        location: { type: 'Point', coordinates: [91.8733, 24.8949] },
      },
      {
        userId: testUser._id,
        title: 'Assault',
        description: 'Physical assault at public place',
        crimeType: 'Assault',
        district: 'Khulna',
        thana: 'Khulna Sadar',
        location: { type: 'Point', coordinates: [89.5642, 22.8456] },
      },
      {
        userId: testUser._id,
        title: 'Extortion',
        description: 'Money extortion by unknown person',
        crimeType: 'Extortion',
        district: 'Rajshahi',
        thana: 'Rajshahi Sadar',
        location: { type: 'Point', coordinates: [88.5975, 24.3745] },
      },
      {
        userId: testUser._id,
        title: 'Shop Theft',
        description: 'Items stolen from shop',
        crimeType: 'Theft',
        district: 'Dhaka',
        thana: 'Gulshan',
        location: { type: 'Point', coordinates: [90.4167, 23.7910] },
      },
      {
        userId: testUser._id,
        title: 'Snatch',
        description: 'Bag snatching on street',
        crimeType: 'Robbery',
        district: 'Cumilla',
        thana: 'Comilla Sadar',
        location: { type: 'Point', coordinates: [91.1788, 23.4682] },
      },
      {
        userId: testUser._id,
        title: 'Harassment Report',
        description: 'Verbal harassment and intimidation',
        crimeType: 'Harassment',
        district: 'Narayanganj',
        thana: 'Narayanganj Sadar',
        location: { type: 'Point', coordinates: [90.4965, 23.6337] },
      },
      {
        userId: testUser._id,
        title: 'Violence',
        description: 'Physical altercation',
        crimeType: 'Assault',
        district: 'Bogura',
        thana: 'Bogura Sadar',
        location: { type: 'Point', coordinates: [89.3778, 24.8465] },
      },
      {
        userId: testUser._id,
        title: 'Bike Robbery',
        description: 'Motorcycle robbery by multiple persons',
        crimeType: 'Robbery',
        district: 'Gazipur',
        thana: 'Gazipur Sadar',
        location: { type: 'Point', coordinates: [90.4264, 24.0023] },
      },
    ];

    // Insert sample reports
    await Report.insertMany(sampleReports);
    console.log(`✓ ${sampleReports.length} sample reports inserted successfully`);

    // Count by district for verification
    const counts = await Report.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    console.log('\nCrime counts by district:');
    counts.forEach((c) => {
      console.log(`  ${c._id}: ${c.count} reports`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding reports:', error);
    process.exit(1);
  }
};

seedReports();
