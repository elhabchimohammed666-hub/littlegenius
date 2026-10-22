const Section = require('../models/Section');
const Course = require('../models/Course');
const aiService = require('../services/aiService');

// @desc    Generate learning activity using AI service
// @route   POST /api/ai/generate-activity
// @access  Private (Teacher)
const generateActivity = async (req, res, next) => {
  try {
    const {
      sectionId,
      customContent,
      lessonTitle,
      activityType = 'multiple-choice',
      difficulty = 'medium',
      targetAge = 9,
      customInstructions = '',
    } = req.body;

    let titleToUse = lessonTitle || '';
    let contentToUse = customContent || '';

    // If sectionId is provided, pull the actual lesson title & content from the database
    if (sectionId) {
      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json({ success: false, message: 'Section not found' });
      }
      const course = await Course.findOne({ _id: section.course, teacher: req.user._id });
      if (!course) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to section' });
      }
      titleToUse = titleToUse || section.title;
      contentToUse = contentToUse || section.content;
    }

    if (!contentToUse && !titleToUse) {
      return res.status(400).json({
        success: false,
        message: 'Please provide lesson content or select an existing section to generate activities.',
      });
    }

    const generatedResult = await aiService.generateActivity({
      lessonTitle: titleToUse,
      lessonContent: contentToUse,
      activityType,
      difficulty,
      targetAge: Number(targetAge) || 9,
      customInstructions,
    });

    res.json({
      success: true,
      data: generatedResult,
      meta: {
        activityType,
        difficulty,
        targetAge,
        lessonTitle: titleToUse,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateActivity,
};
