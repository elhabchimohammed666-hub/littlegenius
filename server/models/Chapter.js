const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a chapter title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chapter', chapterSchema);
