const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    crimeType: {
      type: String,
      enum: ['theft', 'assault', 'vandalism', 'robbery', 'fraud', 'harassment', 'other'],
      default: 'other',
    },
    district: {
      type: String,
      required: true,
    },
    thana: {
      type: String,
      required: true,
    },
    postedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
