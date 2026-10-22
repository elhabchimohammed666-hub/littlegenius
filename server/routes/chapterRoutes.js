const express = require('express');
const router = express.Router();
const {
  createChapter,
  updateChapter,
  deleteChapter,
} = require('../controllers/chapterController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', teacherOnly, createChapter);
router.route('/:id')
  .put(teacherOnly, updateChapter)
  .delete(teacherOnly, deleteChapter);

module.exports = router;
