const mongoose = require('mongoose');

const policeStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      default: '01XXXXXXXXX',
      trim: true,
    },
    email: {
      type: String,
      default: 'abc@gmail.com',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PoliceStation', policeStationSchema);
