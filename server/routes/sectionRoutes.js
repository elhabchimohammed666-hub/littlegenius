const express = require('express');
const router = express.Router();
const {
  createSection,
  getSectionById,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', teacherOnly, createSection);
router.route('/:id')
  .get(getSectionById)
  .put(teacherOnly, updateSection)
  .delete(teacherOnly, deleteSection);

module.exports = router;
