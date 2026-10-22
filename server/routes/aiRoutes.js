const express = require('express');
const router = express.Router();
const { generateActivity } = require('../controllers/aiController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate-activity', teacherOnly, generateActivity);

module.exports = router;
