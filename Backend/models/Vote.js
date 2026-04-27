const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voteType: {
      type: String,
      enum: ['Confirm', 'Dispute'],
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: one vote per user per report
voteSchema.index({ reportId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
