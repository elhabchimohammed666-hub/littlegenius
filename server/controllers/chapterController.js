const Chapter = require('../models/Chapter');
const Course = require('../models/Course');
const Section = require('../models/Section');
const Activity = require('../models/Activity');
const Progress = require('../models/Progress');

// @desc    Create a chapter in a course
// @route   POST /api/chapters
// @access  Private (Teacher)
const createChapter = async (req, res, next) => {
  try {
    const { courseId, title, description, order } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'courseId and title are required' });
    }

    const course = await Course.findOne({ _id: courseId, teacher: req.user._id });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    const chapterCount = await Chapter.countDocuments({ course: courseId });

    const chapter = await Chapter.create({
      course: courseId,
      title,
      description: description || '',
      order: order !== undefined ? order : chapterCount + 1,
    });

    course.chapters.push(chapter._id);
    await course.save();

    res.status(201).json({
      success: true,
      chapter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a chapter
// @route   PUT /api/chapters/:id
// @access  Private (Teacher)
const updateChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const course = await Course.findOne({ _id: chapter.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { title, description, order } = req.body;
    if (title) chapter.title = title;
    if (description !== undefined) chapter.description = description;
    if (order !== undefined) chapter.order = order;

    await chapter.save();

    res.json({
      success: true,
      chapter,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete chapter and its sections/activities
// @route   DELETE /api/chapters/:id
// @access  Private (Teacher)
const deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const course = await Course.findOne({ _id: chapter.course, teacher: req.user._id });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Cascade delete sections, activities & progress
    const sections = await Section.find({ chapter: chapter._id });
    const sectionIds = sections.map((s) => s._id);

    await Activity.deleteMany({ section: { $in: sectionIds } });
    await Progress.deleteMany({ section: { $in: sectionIds } });
    await Section.deleteMany({ chapter: chapter._id });

    // Remove from course
    course.chapters = course.chapters.filter((cId) => cId.toString() !== chapter._id.toString());
    await course.save();

    await Chapter.findByIdAndDelete(chapter._id);

    res.json({
      success: true,
      message: 'Chapter and contained lessons removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChapter,
  updateChapter,
  deleteChapter,
};
