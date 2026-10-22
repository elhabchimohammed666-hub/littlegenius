const express = require('express');
const router = express.Router();
const { submitActivity, getStudentProgress } = require('../controllers/progressController');
const { protect, studentOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/submit', studentOnly, submitActivity);
router.get('/', getStudentProgress);

module.exports = router;
