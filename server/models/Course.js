const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      enum: ['Mathematics', 'Science', 'Language Arts', 'Social Studies', 'Art & Music', 'General Knowledge'],
      default: 'Mathematics',
    },
    targetAgeMin: {
      type: Number,
      default: 6,
      min: 6,
      max: 12,
    },
    targetAgeMax: {
      type: Number,
      default: 12,
      min: 6,
      max: 12,
    },
    icon: {
      type: String,
      default: 'Sparkles',
    },
    themeColor: {
      type: String,
      default: 'from-amber-400 to-orange-500',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
