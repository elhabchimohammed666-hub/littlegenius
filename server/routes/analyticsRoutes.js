const express = require('express');
const router = express.Router();
const { getClassAnalytics, getTeacherDashboardStats } = require('../controllers/analyticsController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect, teacherOnly);

router.get('/dashboard', getTeacherDashboardStats);
router.get('/class/:classId', getClassAnalytics);

module.exports = router;
