const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a class name'],
      trim: true,
      maxlength: [80, 'Class name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    gradeLevel: {
      type: String,
      default: 'Grade 4',
    },
    ageGroup: {
      type: String,
      default: '8-10 years',
    },
    code: {
      type: String,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: '#4F46E5', // indigo default
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save to auto-generate class code if not provided
classSchema.pre('save', function (next) {
  if (!this.code) {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.code = `LG-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);
