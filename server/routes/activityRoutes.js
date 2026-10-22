const express = require('express');
const router = express.Router();
const {
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity,
} = require('../controllers/activityController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', teacherOnly, createActivity);
router.route('/:id')
  .get(getActivityById)
  .put(teacherOnly, updateActivity)
  .delete(teacherOnly, deleteActivity);

module.exports = router;
