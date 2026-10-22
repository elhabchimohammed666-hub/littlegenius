import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import {
  BookOpen,
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  X,
  AlertCircle
} from 'lucide-react';

export const TeacherCoursesPage = () => {
  const { playPop, playCorrect } = useSound();
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New course form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [targetAgeMin, setTargetAgeMin] = useState(8);
  const [targetAgeMax, setTargetAgeMax] = useState(11);
  const [themeColor, setThemeColor] = useState('from-amber-400 to-orange-500');
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchCoursesAndClasses = async () => {
    try {
      const [coursesData, classesData] = await Promise.all([
        api.getCourses(),
        api.getClasses(),
      ]);
      setCourses(coursesData.courses || []);
      setClasses(classesData.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndClasses();
  }, []);

  const handleTogglePublish = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();
    playPop();
    try {
      await api.togglePublishCourse(courseId);
      playCorrect();
      fetchCoursesAndClasses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await api.createCourse({
        title,
        description,
        subject,
        targetAgeMin,
        targetAgeMax,
        themeColor,
        assignedClasses,
      });

      playCorrect();
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchCoursesAndClasses();
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleCheckboxChange = (classId) => {
    setAssignedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800">
            Course Curriculum & Lessons 📚
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build structured courses (Course &gt; Chapters &gt; Sections) and generate interactive activities with AI.
          </p>
        </div>

        <button
          onClick={() => {
            playPop();
            setIsModalOpen(true);
          }}
          className="kid-button-primary py-2.5 px-5 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="kid-card overflow-hidden flex flex-col justify-between group"
          >
            <div>
              {/* Banner */}
              <div className={`h-24 bg-gradient-to-r ${course.themeColor || 'from-amber-400 to-orange-500'} p-5 flex items-center justify-between text-white`}>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-inner">
                  {course.subject === 'Mathematics' ? '🥧' : course.subject === 'Science' ? '🪐' : '📖'}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleTogglePublish(course._id, e)}
                  title={course.isPublished ? 'Click to unpublish (draft)' : 'Click to publish to assigned classes'}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                    course.isPublished
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-white/90 text-slate-700 hover:bg-white'
                  }`}
                >
                  {course.isPublished ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Draft
                    </>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                  {course.subject}
                </span>

                <h3 className="text-xl font-bold font-display text-slate-800 mt-2 group-hover:text-orange-600 transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-slate-500">
                  <span>👶 Ages {course.targetAgeMin}–{course.targetAgeMax}</span>
                  <span>📑 {course.chapters?.length || 0} Chapters</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                to={`/teacher/courses/${course._id}`}
                onClick={playPop}
                className="w-full kid-button-secondary py-2 text-xs"
              >
                Open Course Builder & AI
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold font-display text-slate-800">Create Educational Course</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Fractions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="What will children learn in this course?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Language Arts">Language Arts</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Theme Color
                  </label>
                  <select
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                  >
                    <option value="from-amber-400 to-orange-500">Amber / Orange (Math)</option>
                    <option value="from-blue-500 to-indigo-600">Blue / Indigo (Science)</option>
                    <option value="from-emerald-400 to-teal-600">Emerald / Teal (Language)</option>
                    <option value="from-purple-500 to-pink-500">Purple / Pink (Creative)</option>
                  </select>
                </div>
              </div>

              {/* Assign to classes checkbox list */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign to Classes
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border p-2 rounded-xl">
                  {classes.map((cls) => (
                    <label key={cls._id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedClasses.includes(cls._id)}
                        onChange={() => handleCheckboxChange(cls._id)}
                        className="rounded text-orange-500"
                      />
                      <span>{cls.name} ({cls.gradeLevel})</span>
                    </label>
                  ))}
                  {classes.length === 0 && (
                    <p className="text-xs text-slate-400">No classes found. You can assign later.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="kid-button-primary py-2 px-5 text-xs"
                >
                  {creating ? 'Creating...' : 'Create Course (Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
