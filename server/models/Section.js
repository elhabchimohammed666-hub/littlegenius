const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a section title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    order: {
      type: Number,
      default: 1,
    },
    content: {
      type: String,
      required: [true, 'Please provide lesson content for this section'],
    },
    keyPoints: [
      {
        type: String,
        trim: true,
      },
    ],
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Section', sectionSchema);
