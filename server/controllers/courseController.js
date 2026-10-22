const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Section = require('../models/Section');
const Activity = require('../models/Activity');
const Progress = require('../models/Progress');
const Class = require('../models/Class');

// @desc    Get courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'teacher') {
      // Teacher sees all their courses (published and drafts)
      query = { teacher: req.user._id };
    } else {
      // Student only sees published courses assigned to their class
      if (!req.user.assignedClass) {
        return res.json({ success: true, count: 0, courses: [] });
      }
      query = {
        isPublished: true,
        assignedClasses: req.user.assignedClass,
      };
    }

    const courses = await Course.find(query)
      .populate('assignedClasses', 'name gradeLevel code color')
      .populate('chapters', 'title order')
      .sort({ createdAt: -1 });

    // If student, calculate course completion progress for each course
    let coursesWithProgress = courses;
    if (req.user.role === 'student') {
      coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
          const totalActivities = await Activity.countDocuments({ course: course._id });
          const completedActivities = await Progress.countDocuments({
            course: course._id,
            student: req.user._id,
            isCompleted: true,
          });

          const progressPercent = totalActivities > 0
            ? Math.round((completedActivities / totalActivities) * 100)
            : 0;

          return {
            ...course.toObject(),
            totalActivities,
            completedActivities,
            progressPercent,
          };
        })
      );
    }

    res.json({
      success: true,
      count: coursesWithProgress.length,
      courses: coursesWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course with chapters, sections, and activities
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('assignedClasses', 'name gradeLevel code')
      .populate({
        path: 'chapters',
        options: { sort: { order: 1 } },
        populate: {
          path: 'sections',
          options: { sort: { order: 1 } },
          populate: {
            path: 'activities',
            options: { sort: { order: 1 } },
          },
        },
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Role verification
    if (req.user.role === 'teacher') {
      if (course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this course' });
      }
    } else {
      // Student verification: must be published and assigned to student's class
      if (!course.isPublished) {
        return res.status(403).json({ success: false, message: 'This course is still a draft and not yet published.' });
      }
      const isAssigned = course.assignedClasses.some(
        (cls) => cls._id.toString() === req.user.assignedClass?.toString()
      );
      if (!isAssigned) {
        return res.status(403).json({ success: false, message: 'This course is not assigned to your class.' });
      }
    }

    // Attach student progress records if student
    let studentProgressMap = {};
    if (req.user.role === 'student') {
      const progresses = await Progress.find({
        course: course._id,
        student: req.user._id,
      });

      progresses.forEach((p) => {
        studentProgressMap[p.activity.toString()] = {
          isCompleted: p.isCompleted,
          bestScore: p.bestScore,
          latestScore: p.latestScore,
          maxScore: p.maxScore,
          bestPercentage: p.bestPercentage,
          attemptsCount: p.attemptsCount,
          struggling: p.struggling,
        };
      });
    }

    res.json({
      success: true,
      course,
      studentProgressMap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Teacher)
const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subject = 'Mathematics',
      targetAgeMin = 6,
      targetAgeMax = 12,
      icon = 'Sparkles',
      themeColor = 'from-amber-400 to-orange-500',
      assignedClasses = [],
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide course title and description' });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      targetAgeMin,
      targetAgeMax,
      icon,
      themeColor,
      teacher: req.user._id,
      isPublished: false, // created as draft initially
      assignedClasses,
    });

    // If classes were assigned, update their assignedCourses array
    if (assignedClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: assignedClasses } },
        { $addToSet: { assignedCourses: course._id } }
      );
    }

    res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Teacher)
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    const {
      title,
      description,
      subject,
      targetAgeMin,
      targetAgeMax,
      icon,
      themeColor,
      assignedClasses,
    } = req.body;

    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (subject) course.subject = subject;
    if (targetAgeMin) course.targetAgeMin = targetAgeMin;
    if (targetAgeMax) course.targetAgeMax = targetAgeMax;
    if (icon) course.icon = icon;
    if (themeColor) course.themeColor = themeColor;

    if (assignedClasses && Array.isArray(assignedClasses)) {
      // Sync classes
      await Class.updateMany(
        { assignedCourses: course._id },
        { $pull: { assignedCourses: course._id } }
      );
      await Class.updateMany(
        { _id: { $in: assignedClasses } },
        { $addToSet: { assignedCourses: course._id } }
      );
      course.assignedClasses = assignedClasses;
    }

    await course.save();

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/courses/:id/publish
// @access  Private (Teacher)
const togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      isPublished: course.isPublished,
      message: course.isPublished ? 'Course published to assigned classes!' : 'Course unpublished and saved as draft.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course and its chapters/sections/activities
// @route   DELETE /api/courses/:id
// @access  Private (Teacher)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
    }

    // Cascade delete chapters, sections, activities, and progress
    await Chapter.deleteMany({ course: course._id });
    await Section.deleteMany({ course: course._id });
    await Activity.deleteMany({ course: course._id });
    await Progress.deleteMany({ course: course._id });

    // Remove from assigned classes
    await Class.updateMany(
      { assignedCourses: course._id },
      { $pull: { assignedCourses: course._id } }
    );

    await Course.findByIdAndDelete(course._id);

    res.json({
      success: true,
      message: 'Course and all child content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  togglePublish,
  deleteCourse,
};
