const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  togglePublish,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(teacherOnly, createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(teacherOnly, updateCourse)
  .delete(teacherOnly, deleteCourse);

router.patch('/:id/publish', teacherOnly, togglePublish);

module.exports = router;
