const Activity = require('../models/Activity');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

// @desc    Create activity in a section
// @route   POST /api/activities
// @access  Private (Teacher)
const createActivity = async (req, res, next) => {
  try {
    const {
      sectionId,
      title,
      type,
      difficulty = 'medium',
      instructions,
      content,
      isAiGenerated = false,
      aiPromptUsed = '',
    } = req.body;

    if (!sectionId || !title || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'sectionId, title, type, and structured content are required',
      });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const course = await Course.findOne({ _id: section.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const activityCount = await Activity.countDocuments({ section: sectionId });

    const activity = await Activity.create({
      section: sectionId,
      chapter: section.chapter,
      course: course._id,
      title,
      type,
      difficulty,
      instructions: instructions || 'Complete the interactive activity!',
      content,
      isAiGenerated,
      aiPromptUsed,
      order: activityCount + 1,
    });

    section.activities.push(activity._id);
    await section.save();

    res.status(201).json({
      success: true,
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('section', 'title chapter')
      .populate('course', 'title isPublished teacher');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // For students, fetch existing progress / attempts if any
    let studentProgress = null;
    if (req.user.role === 'student') {
      studentProgress = await Progress.findOne({
        activity: activity._id,
        student: req.user._id,
      });
    }

    res.json({
      success: true,
      activity,
      studentProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Teacher)
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const course = await Course.findOne({ _id: activity.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { title, difficulty, instructions, content, order } = req.body;
    if (title) activity.title = title;
    if (difficulty) activity.difficulty = difficulty;
    if (instructions !== undefined) activity.instructions = instructions;
    if (content) activity.content = content;
    if (order !== undefined) activity.order = order;

    await activity.save();

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Teacher)
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const course = await Course.findOne({ _id: activity.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Cascade delete student progress for this activity
    await Progress.deleteMany({ activity: activity._id });

    // Remove from section
    await Section.findByIdAndUpdate(activity.section, {
      $pull: { activities: activity._id },
    });

    await Activity.findByIdAndDelete(activity._id);

    res.json({
      success: true,
      message: 'Activity removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity,
};
