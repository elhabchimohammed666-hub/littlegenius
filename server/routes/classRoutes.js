const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  assignCourse,
  unassignCourse,
} = require('../controllers/classController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getClasses)
  .post(teacherOnly, createClass);

router.route('/:id')
  .get(getClassById)
  .put(teacherOnly, updateClass)
  .delete(teacherOnly, deleteClass);

router.post('/:id/students', teacherOnly, addStudent);
router.delete('/:id/students/:studentId', teacherOnly, removeStudent);
router.post('/:id/assign-course', teacherOnly, assignCourse);
router.post('/:id/unassign-course', teacherOnly, unassignCourse);

module.exports = router;
