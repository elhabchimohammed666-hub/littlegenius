const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      default: 'teacher',
      required: true,
    },
    avatar: {
      type: String,
      default: 'fox', // fox, owl, lion, bear, astronaut, robot, star
    },
    // Teacher specific fields
    school: {
      type: String,
      default: 'LittleGenius Elementary',
    },
    // Student specific fields
    age: {
      type: Number,
      min: [5, 'Age must be at least 5'],
      max: [14, 'Age must be at most 14'],
      default: 9,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    points: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 1,
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    badges: [
      {
        badgeId: { type: String, required: true },
        title: { type: String, required: true },
        icon: { type: String, default: '🏆' },
        description: { type: String },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
