const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'littlegenius_super_secret_jwt_key_2026_kid_edu',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (Teacher or independent registration)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'teacher', school, age, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'student' ? 'student' : 'teacher',
      school: school || 'LittleGenius Academy',
      age: age || 9,
      avatar: avatar || (role === 'student' ? 'fox' : 'owl'),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        school: user.school,
        points: user.points,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user and include password for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update streak if student
    if (user.role === 'student') {
      const today = new Date().setHours(0, 0, 0, 0);
      const last = user.lastActivityDate ? new Date(user.lastActivityDate).setHours(0, 0, 0, 0) : 0;
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (today - last === oneDayMs) {
        user.streak += 1;
      } else if (today - last > oneDayMs) {
        user.streak = 1;
      }
      user.lastActivityDate = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        school: user.school,
        age: user.age,
        teacher: user.teacher,
        assignedClass: user.assignedClass,
        points: user.points,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('assignedClass', 'name code gradeLevel')
      .populate('teacher', 'name email');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, school, age } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (school && user.role === 'teacher') user.school = school;
    if (age && user.role === 'student') user.age = age;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        school: user.school,
        age: user.age,
        points: user.points,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
