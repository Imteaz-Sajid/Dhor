const mongoose = require('mongoose');

const missingEntitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Person', 'Vehicle'],
      required: true,
    },
    nameOrModel: {
      type: String,
      required: true,
      trim: true,
    },
    lastSeenLocation: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    lastSeenDate: {
      type: Date,
      required: true,
    },
    descriptions: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Missing', 'Found'],
      default: 'Missing',
    },
  },
  { timestamps: true }
);

missingEntitySchema.index({ lastSeenLocation: '2dsphere' });

module.exports = mongoose.model('MissingEntity', missingEntitySchema);
