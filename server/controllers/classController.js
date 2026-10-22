const Class = require('../models/Class');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get all classes for current teacher
// @route   GET /api/classes
// @access  Private (Teacher)
const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('students', 'name email avatar points streak age')
      .populate('assignedCourses', 'title subject isPublished')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('students', 'name email avatar points streak age badges')
      .populate('assignedCourses', 'title description subject icon themeColor isPublished');

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Authorization check
    if (
      req.user.role === 'teacher' &&
      classItem.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this class' });
    }

    res.json({
      success: true,
      classItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teacher)
const createClass = async (req, res, next) => {
  try {
    const { name, description, gradeLevel, ageGroup, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a class name' });
    }

    const newClass = await Class.create({
      name,
      description,
      gradeLevel: gradeLevel || 'Grade 4',
      ageGroup: ageGroup || '8-10 years',
      color: color || '#4F46E5',
      teacher: req.user._id,
    });

    res.status(201).json({
      success: true,
      classItem: newClass,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Teacher)
const updateClass = async (req, res, next) => {
  try {
    const classItem = await Class.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found or unauthorized' });
    }

    const { name, description, gradeLevel, ageGroup, color } = req.body;
    if (name) classItem.name = name;
    if (description !== undefined) classItem.description = description;
    if (gradeLevel) classItem.gradeLevel = gradeLevel;
    if (ageGroup) classItem.ageGroup = ageGroup;
    if (color) classItem.color = color;

    await classItem.save();

    res.json({
      success: true,
      classItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher)
const deleteClass = async (req, res, next) => {
  try {
    const classItem = await Class.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found or unauthorized' });
    }

    // Unassign students from this class
    await User.updateMany(
      { assignedClass: classItem._id },
      { $set: { assignedClass: null } }
    );

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Class removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a student directly to class
// @route   POST /api/classes/:id/students
// @access  Private (Teacher)
const addStudent = async (req, res, next) => {
  try {
    const classItem = await Class.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found or unauthorized' });
    }

    const { name, email, password, age, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password for student' });
    }

    // Check if user exists
    let student = await User.findOne({ email: email.toLowerCase() });

    if (student) {
      // If student already exists, associate with class if not already
      if (!classItem.students.includes(student._id)) {
        classItem.students.push(student._id);
        student.assignedClass = classItem._id;
        student.teacher = req.user._id;
        await student.save();
        await classItem.save();
      }
    } else {
      // Create new student account
      student = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'student',
        age: age || 9,
        avatar: avatar || 'bear',
        teacher: req.user._id,
        assignedClass: classItem._id,
        badges: [
          {
            badgeId: 'welcome',
            title: 'Welcome Adventurer!',
            icon: '🌟',
            description: 'Joined the LittleGenius classroom',
          },
        ],
      });

      classItem.students.push(student._id);
      await classItem.save();
    }

    res.status(201).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        age: student.age,
        avatar: student.avatar,
        points: student.points,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Teacher)
const removeStudent = async (req, res, next) => {
  try {
    const classItem = await Class.findOne({ _id: req.params.id, teacher: req.user._id });

    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class not found or unauthorized' });
    }

    classItem.students = classItem.students.filter(
      (sId) => sId.toString() !== req.params.studentId
    );
    await classItem.save();

    await User.findByIdAndUpdate(req.params.studentId, { assignedClass: null });

    res.json({
      success: true,
      message: 'Student removed from class successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign course to class
// @route   POST /api/classes/:id/assign-course
// @access  Private (Teacher)
const assignCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const classItem = await Class.findOne({ _id: req.params.id, teacher: req.user._id });
    const course = await Course.findOne({ _id: courseId, teacher: req.user._id });

    if (!classItem || !course) {
      return res.status(404).json({ success: false, message: 'Class or Course not found or unauthorized' });
    }

    if (!classItem.assignedCourses.includes(course._id)) {
      classItem.assignedCourses.push(course._id);
      await classItem.save();
    }

    if (!course.assignedClasses.includes(classItem._id)) {
      course.assignedClasses.push(classItem._id);
      await course.save();
    }

    res.json({
      success: true,
      message: 'Course assigned to class successfully',
      assignedCourses: classItem.assignedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unassign course from class
// @route   POST /api/classes/:id/unassign-course
// @access  Private (Teacher)
const unassignCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const classItem = await Class.findOne({ _id: req.params.id, teacher: req.user._id });
    const course = await Course.findOne({ _id: courseId, teacher: req.user._id });

    if (!classItem || !course) {
      return res.status(404).json({ success: false, message: 'Class or Course not found or unauthorized' });
    }

    classItem.assignedCourses = classItem.assignedCourses.filter(
      (cId) => cId.toString() !== courseId
    );
    await classItem.save();

    course.assignedClasses = course.assignedClasses.filter(
      (clId) => clId.toString() !== classItem._id.toString()
    );
    await course.save();

    res.json({
      success: true,
      message: 'Course unassigned from class',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  assignCourse,
  unassignCourse,
};
