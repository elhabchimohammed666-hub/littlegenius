const Class = require('../models/Class');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get comprehensive analytics for a teacher's class
// @route   GET /api/analytics/class/:classId
// @access  Private (Teacher)
const getClassAnalytics = async (req, res, next) => {
  try {
    const classItem = await Class.findOne({ _id: req.params.classId, teacher: req.user._id })
      .populate('students', 'name email avatar points streak age')
      .populate('assignedCourses', 'title subject isPublished');

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found or unauthorized' });
    }

    const studentIds = classItem.students.map((s) => s._id);
    const assignedCourseIds = classItem.assignedCourses.map((c) => c._id);

    // Fetch all progress records for students in this class
    const progressRecords = await Progress.find({
      student: { $in: studentIds },
      course: { $in: assignedCourseIds },
    })
      .populate('activity', 'title type difficulty section')
      .populate('section', 'title chapter')
      .populate('course', 'title');

    // Total activities across all assigned courses
    const totalActivitiesCount = await Activity.countDocuments({
      course: { $in: assignedCourseIds },
    });

    // 1. Overall stats
    let totalScoreSum = 0;
    let completedCount = 0;
    const strugglingStudentIds = new Set();
    const strugglingTopicsMap = {};

    progressRecords.forEach((p) => {
      totalScoreSum += p.bestPercentage;
      if (p.isCompleted) completedCount += 1;
      if (p.struggling) {
        strugglingStudentIds.add(p.student.toString());

        // Track topic difficulties
        const topicKey = p.section?.title || p.activity?.title || 'General Activity';
        if (!strugglingTopicsMap[topicKey]) {
          strugglingTopicsMap[topicKey] = {
            topic: topicKey,
            courseTitle: p.course?.title || '',
            strugglingCount: 0,
            mistakes: [],
          };
        }
        strugglingTopicsMap[topicKey].strugglingCount += 1;
        if (p.recentMistakes && p.recentMistakes.length > 0) {
          strugglingTopicsMap[topicKey].mistakes.push(...p.recentMistakes);
        }
      }
    });

    const averageScore = progressRecords.length > 0
      ? Math.round(totalScoreSum / progressRecords.length)
      : 0;

    const expectedTotalCompletions = studentIds.length * totalActivitiesCount;
    const overallCompletionRate = expectedTotalCompletions > 0
      ? Math.round((completedCount / expectedTotalCompletions) * 100)
      : 0;

    // 2. Student-by-student breakdown
    const studentPerformance = classItem.students.map((student) => {
      const studentRecords = progressRecords.filter(
        (p) => p.student.toString() === student._id.toString()
      );
      const studentCompleted = studentRecords.filter((p) => p.isCompleted).length;
      const studentAvgScore = studentRecords.length > 0
        ? Math.round(studentRecords.reduce((acc, curr) => acc + curr.bestPercentage, 0) / studentRecords.length)
        : 0;

      const completionRate = totalActivitiesCount > 0
        ? Math.round((studentCompleted / totalActivitiesCount) * 100)
        : 0;

      const hasStruggles = studentRecords.some((p) => p.struggling);

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        points: student.points,
        streak: student.streak,
        activitiesCompleted: studentCompleted,
        totalActivities: totalActivitiesCount,
        completionRate,
        averageScore: studentAvgScore,
        needsHelp: hasStruggles,
      };
    });

    // 3. Topics with recurring difficulties list
    const strugglingTopics = Object.values(strugglingTopicsMap).sort(
      (a, b) => b.strugglingCount - a.strugglingCount
    );

    res.json({
      success: true,
      classInfo: {
        id: classItem._id,
        name: classItem.name,
        gradeLevel: classItem.gradeLevel,
        code: classItem.code,
        studentsCount: classItem.students.length,
        coursesCount: classItem.assignedCourses.length,
      },
      metrics: {
        overallCompletionRate,
        averageScore,
        activeStudentsCount: studentIds.length,
        strugglingStudentsCount: strugglingStudentIds.size,
      },
      strugglingTopics,
      studentPerformance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall teacher dashboard overview stats
// @route   GET /api/analytics/dashboard
// @access  Private (Teacher)
const getTeacherDashboardStats = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user._id });
    const courses = await Course.find({ teacher: req.user._id });
    const totalStudents = await User.countDocuments({ teacher: req.user._id });
    const totalActivities = await Activity.countDocuments({
      course: { $in: courses.map((c) => c._id) },
    });

    const progressRecords = await Progress.find({
      course: { $in: courses.map((c) => c._id) },
    });

    const averageScore = progressRecords.length > 0
      ? Math.round(progressRecords.reduce((acc, p) => acc + p.bestPercentage, 0) / progressRecords.length)
      : 0;

    const strugglingCount = progressRecords.filter((p) => p.struggling).length;

    res.json({
      success: true,
      stats: {
        totalClasses: classes.length,
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.isPublished).length,
        totalStudents,
        totalActivities,
        totalSubmissions: progressRecords.length,
        averageScore,
        strugglingCount,
      },
      recentClasses: classes.slice(0, 5),
      recentCourses: courses.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClassAnalytics,
  getTeacherDashboardStats,
};
