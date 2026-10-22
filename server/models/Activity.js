const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an activity title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please specify an activity type'],
      enum: ['multiple-choice', 'matching', 'fill-blank'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    instructions: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    aiPromptUsed: {
      type: String,
      default: '',
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
