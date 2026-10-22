const Progress = require('../models/Progress');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Submit student answers for an activity, evaluate automatically and save progress
// @route   POST /api/progress/submit
// @access  Private (Student)
const submitActivity = async (req, res, next) => {
  try {
    const { activityId, answers } = req.body;

    if (!activityId || !answers) {
      return res.status(400).json({ success: false, message: 'activityId and answers are required' });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Evaluate answers based on activity type
    let score = 0;
    let maxScore = 0;
    const itemFeedback = [];
    const wrongItems = [];

    if (activity.type === 'multiple-choice') {
      const questions = activity.content?.questions || [];
      maxScore = questions.length;

      questions.forEach((q, idx) => {
        const studentChoice = answers[q.id] !== undefined ? answers[q.id] : answers[idx];
        const isCorrect = Number(studentChoice) === Number(q.correctIndex);

        if (isCorrect) {
          score += 1;
        } else {
          wrongItems.push({
            itemId: q.id || `q_${idx}`,
            question: q.question,
            studentAnswer: q.options[studentChoice] !== undefined ? q.options[studentChoice] : 'None selected',
            correctAnswer: q.options[q.correctIndex],
          });
        }

        itemFeedback.push({
          id: q.id || `q_${idx}`,
          question: q.question,
          isCorrect,
          selectedChoice: studentChoice,
          correctChoice: q.correctIndex,
          correctAnswerText: q.options[q.correctIndex],
          explanation: q.explanation || 'Review the lesson notes to master this topic!',
        });
      });
    } else if (activity.type === 'matching') {
      const pairs = activity.content?.pairs || [];
      maxScore = pairs.length;

      pairs.forEach((p, idx) => {
        const studentMatch = answers[p.id] !== undefined ? answers[p.id] : answers[p.left];
        const isCorrect = studentMatch === p.right;

        if (isCorrect) {
          score += 1;
        } else {
          wrongItems.push({
            itemId: p.id || `p_${idx}`,
            question: `Match for: ${p.left}`,
            studentAnswer: studentMatch || 'None',
            correctAnswer: p.right,
          });
        }

        itemFeedback.push({
          id: p.id || `p_${idx}`,
          left: p.left,
          studentMatch,
          correctMatch: p.right,
          isCorrect,
          explanation: p.explanation || `${p.left} matches with ${p.right}`,
        });
      });
    } else if (activity.type === 'fill-blank') {
      const items = activity.content?.items || [];
      maxScore = 0;

      items.forEach((item, idx) => {
        const studentBlanks = answers[item.id] || answers[idx] || [];
        const correctBlanks = item.blanks || [];
        maxScore += correctBlanks.length;

        let itemCorrectCount = 0;
        correctBlanks.forEach((target, bIdx) => {
          const given = (studentBlanks[bIdx] || '').trim().toLowerCase();
          const targetNorm = target.trim().toLowerCase();

          if (given === targetNorm) {
            score += 1;
            itemCorrectCount += 1;
          } else {
            wrongItems.push({
              itemId: item.id || `f_${idx}_${bIdx}`,
              question: item.sentence,
              studentAnswer: given || '(empty)',
              correctAnswer: target,
            });
          }
        });

        itemFeedback.push({
          id: item.id || `f_${idx}`,
          sentence: item.sentence,
          allCorrect: itemCorrectCount === correctBlanks.length,
          explanation: item.explanation || 'Great job practicing sentences!',
        });
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
    const isCompleted = percentage >= 60; // 60% passing grade
    const isStruggling = percentage < 70;

    // Retrieve or create progress record
    let progress = await Progress.findOne({
      student: student._id,
      activity: activity._id,
    });

    const isRetry = Boolean(progress && progress.attemptsCount > 0);
    const attemptNumber = (progress?.attemptsCount || 0) + 1;

    const newAttempt = {
      attemptNumber,
      score,
      maxScore,
      percentage,
      answers,
      wrongItems,
      completedAt: new Date(),
    };

    if (!progress) {
      progress = new Progress({
        student: student._id,
        course: activity.course,
        section: activity.section,
        activity: activity._id,
        class: student.assignedClass,
        isCompleted,
        bestScore: score,
        latestScore: score,
        maxScore,
        bestPercentage: percentage,
        attemptsCount: 1,
        struggling: isStruggling,
        recentMistakes: wrongItems.map((w) => ({
          question: w.question,
          details: `Answered "${w.studentAnswer}", correct was "${w.correctAnswer}"`,
        })),
        attempts: [newAttempt],
      });
    } else {
      progress.attemptsCount += 1;
      progress.latestScore = score;
      if (score > progress.bestScore) {
        progress.bestScore = score;
      }
      if (percentage > progress.bestPercentage) {
        progress.bestPercentage = percentage;
      }
      if (isCompleted) {
        progress.isCompleted = true;
      }
      progress.struggling = isStruggling;
      progress.recentMistakes = wrongItems.map((w) => ({
        question: w.question,
        details: `Answered "${w.studentAnswer}", correct was "${w.correctAnswer}"`,
      }));
      progress.attempts.push(newAttempt);
    }

    await progress.save();

    // Gamification points & badges
    let pointsEarned = 0;
    if (!isRetry) {
      pointsEarned = score * 10 + (percentage === 100 ? 50 : 20);
    } else {
      pointsEarned = Math.max(10, Math.round(score * 5));
    }
    student.points += pointsEarned;

    // Check for new badges
    const newBadgesEarned = [];
    const hasBadge = (badgeId) => student.badges.some((b) => b.badgeId === badgeId);

    if (!hasBadge('first_quiz') && progress.attemptsCount === 1) {
      const badge = {
        badgeId: 'first_quiz',
        title: 'Curious Learner',
        icon: '🚀',
        description: 'Completed your very first activity!',
        earnedAt: new Date(),
      };
      student.badges.push(badge);
      newBadgesEarned.push(badge);
    }

    if (percentage === 100 && !hasBadge('perfect_score')) {
      const badge = {
        badgeId: 'perfect_score',
        title: 'Star Genius',
        icon: '⭐',
        description: 'Achieved a perfect 100% score on an activity!',
        earnedAt: new Date(),
      };
      student.badges.push(badge);
      newBadgesEarned.push(badge);
    }

    if (isRetry && percentage >= 80 && !hasBadge('retry_master')) {
      const badge = {
        badgeId: 'retry_master',
        title: 'Never Give Up',
        icon: '💪',
        description: 'Retried an activity and achieved great results!',
        earnedAt: new Date(),
      };
      student.badges.push(badge);
      newBadgesEarned.push(badge);
    }

    await student.save();

    res.json({
      success: true,
      evaluation: {
        score,
        maxScore,
        percentage,
        isCompleted,
        isStruggling,
        isRetry,
        attemptNumber,
        pointsEarned,
        newBadgesEarned,
        itemFeedback,
      },
      progress: {
        bestScore: progress.bestScore,
        bestPercentage: progress.bestPercentage,
        attemptsCount: progress.attemptsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress records for student
// @route   GET /api/progress
// @access  Private
const getStudentProgress = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const progresses = await Progress.find({ student: studentId })
      .populate('activity', 'title type difficulty order')
      .populate('section', 'title chapter')
      .populate('course', 'title subject');

    res.json({
      success: true,
      count: progresses.length,
      progresses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitActivity,
  getStudentProgress,
};
