Here’s the resolved schema with the police workflow fields preserved (so no features are lost):

```js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    crimeType: {
      type: String,
      enum: ['Extortion', 'Theft', 'Robbery', 'Harassment', 'Assault', 'Other'],
      required: [true, 'Crime type is required'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Investigating', 'Verified', 'Rejected', 'Resolved'],
      default: 'Pending',
    },
    policeNote: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    thana: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isPoliceVerified: {
      type: Boolean,
      default: false,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    policeStatus: {
      type: String,
      enum: ['Open', 'Assigned', 'Solved'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location-based queries
reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);
```
