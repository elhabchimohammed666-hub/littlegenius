const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  attemptNumber: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  answers: {
    type: mongoose.Schema.Types.Mixed,
  },
  wrongItems: [
    {
      itemId: String,
      question: String,
      studentAnswer: mongoose.Schema.Types.Mixed,
      correctAnswer: mongoose.Schema.Types.Mixed,
    },
  ],
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    latestScore: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    bestPercentage: {
      type: Number,
      default: 0,
    },
    attemptsCount: {
      type: Number,
      default: 0,
    },
    struggling: {
      type: Boolean,
      default: false,
    },
    recentMistakes: [
      {
        question: String,
        details: String,
      },
    ],
    attempts: [attemptSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find progress per student & activity
progressSchema.index({ student: 1, activity: 1 }, { unique: true });
progressSchema.index({ class: 1, course: 1 });

module.exports = mongoose.model('Progress', progressSchema);
