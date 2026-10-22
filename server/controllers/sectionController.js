const Section = require('../models/Section');
const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const Activity = require('../models/Activity');
const Progress = require('../models/Progress');

// @desc    Create a section in a chapter
// @route   POST /api/sections
// @access  Private (Teacher)
const createSection = async (req, res, next) => {
  try {
    const { chapterId, title, content, keyPoints, order } = req.body;

    if (!chapterId || !title || !content) {
      return res.status(400).json({ success: false, message: 'chapterId, title, and lesson content are required' });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const course = await Course.findOne({ _id: chapter.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const sectionCount = await Section.countDocuments({ chapter: chapterId });

    const section = await Section.create({
      chapter: chapterId,
      course: course._id,
      title,
      content,
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      order: order !== undefined ? order : sectionCount + 1,
    });

    chapter.sections.push(section._id);
    await chapter.save();

    res.status(201).json({
      success: true,
      section,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get section by ID with its activities
// @route   GET /api/sections/:id
// @access  Private
const getSectionById = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('activities')
      .populate('chapter', 'title order')
      .populate('course', 'title isPublished teacher');

    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    res.json({
      success: true,
      section,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (Teacher)
const updateSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const course = await Course.findOne({ _id: section.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { title, content, keyPoints, order } = req.body;
    if (title) section.title = title;
    if (content) section.content = content;
    if (keyPoints && Array.isArray(keyPoints)) section.keyPoints = keyPoints;
    if (order !== undefined) section.order = order;

    await section.save();

    res.json({
      success: true,
      section,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private (Teacher)
const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const course = await Course.findOne({ _id: section.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Cascade delete activities and progress
    await Activity.deleteMany({ section: section._id });
    await Progress.deleteMany({ section: section._id });

    // Remove from chapter
    await Chapter.findByIdAndUpdate(section.chapter, {
      $pull: { sections: section._id },
    });

    await Section.findByIdAndDelete(section._id);

    res.json({
      success: true,
      message: 'Section removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSection,
  getSectionById,
  updateSection,
  deleteSection,
};
