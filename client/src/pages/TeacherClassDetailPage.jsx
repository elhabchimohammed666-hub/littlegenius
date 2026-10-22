import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import {
  Users,
  UserPlus,
  BookOpen,
  BarChart3,
  Trash2,
  X,
  AlertCircle,
  Plus,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

export const TeacherClassDetailPage = () => {
  const { id } = useParams();
  const { playPop, playCorrect } = useSound();

  const [classItem, setClassItem] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add student modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('Student123!');
  const [studentAge, setStudentAge] = useState(9);
  const [studentAvatar, setStudentAvatar] = useState('fox');
  const [addingStudent, setAddingStudent] = useState(false);
  const [error, setError] = useState('');

  // Course assignment state
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState('');

  const fetchClassDetails = async () => {
    try {
      const data = await api.getClassById(id);
      setClassItem(data.classItem);
      const coursesData = await api.getCourses();
      setAllCourses(coursesData.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddingStudent(true);
    setError('');

    try {
      await api.addStudentToClass(id, {
        name: studentName,
        email: studentEmail,
        password: studentPassword,
        age: studentAge,
        avatar: studentAvatar,
      });

      playCorrect();
      setIsStudentModalOpen(false);
      setStudentName('');
      setStudentEmail('');
      fetchClassDetails();
    } catch (err) {
      setError(err.message || 'Failed to add student');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the class?')) return;
    playPop();
    try {
      await api.removeStudentFromClass(id, studentId);
      fetchClassDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourseToAssign) return;
    playPop();
    try {
      await api.assignCourseToClass(id, selectedCourseToAssign);
      playCorrect();
      setSelectedCourseToAssign('');
      fetchClassDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassignCourse = async (courseId) => {
    if (!window.confirm('Unassign this course from the class?')) return;
    playPop();
    try {
      await api.unassignCourseFromClass(id, courseId);
      fetchClassDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-sm">Loading classroom details...</div>;
  }

  if (!classItem) {
    return <div className="text-center py-20 text-slate-500 text-sm">Class not found.</div>;
  }

  const assignedCourseIds = (classItem.assignedCourses || []).map((c) => c._id || c);
  const unassignedCourses = allCourses.filter((c) => !assignedCourseIds.includes(c._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/teacher/classes"
          onClick={playPop}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Classes
        </Link>

        <Link
          to={`/teacher/analytics?classId=${classItem._id}`}
          onClick={playPop}
          className="kid-button-primary py-2 px-4 text-xs"
        >
          <BarChart3 className="w-4 h-4" />
          View Class Analytics
        </Link>
      </div>

      {/* Class Banner */}
      <div
        className="rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ backgroundColor: classItem.color || '#4F46E5' }}
      >
        <div>
          <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-white/20 rounded-full">
            {classItem.gradeLevel} • {classItem.ageGroup}
          </span>
          <h1 className="text-3xl font-bold font-display mt-2">{classItem.name}</h1>
          <p className="text-white/80 text-sm mt-1">{classItem.description || 'Dedicated learning environment.'}</p>
        </div>

        <div className="bg-white/20 backdrop-blur px-5 py-3 rounded-2xl text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-white/70">Class Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest">{classItem.code}</p>
        </div>
      </div>

      {/* Grid: Students & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Students List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold font-display text-slate-800">
                Enrolled Students ({classItem.students?.length || 0})
              </h2>
            </div>

            <button
              onClick={() => {
                playPop();
                setIsStudentModalOpen(true);
              }}
              className="kid-button-primary py-2 px-4 text-xs"
            >
              <UserPlus className="w-4 h-4" />
              Add Student
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {classItem.students?.length > 0 ? (
              classItem.students.map((student) => (
                <div key={student._id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shadow-xs">
                      {student.avatar === 'fox' ? '🦊' : student.avatar === 'owl' ? '🦉' : student.avatar === 'bear' ? '🐻' : '🦁'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                      <p className="text-xs text-slate-500">
                        {student.email} • Age: {student.age || 9}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        ⭐ {student.points || 0} pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      title="Remove student from class"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No students added to this class yet.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Assigned Courses */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold font-display text-slate-800">
              Assigned Courses
            </h2>
          </div>

          {/* Assign new course dropdown */}
          {unassignedCourses.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <select
                value={selectedCourseToAssign}
                onChange={(e) => setSelectedCourseToAssign(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border rounded-xl"
              >
                <option value="">Select course to assign...</option>
                {unassignedCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.subject})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignCourse}
                disabled={!selectedCourseToAssign}
                className="kid-button-primary py-2 px-3 text-xs disabled:opacity-40"
              >
                Assign
              </button>
            </div>
          )}

          <div className="space-y-3">
            {classItem.assignedCourses?.length > 0 ? (
              classItem.assignedCourses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{course.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {course.subject} • {course.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleUnassignCourse(course._id)}
                    title="Unassign course"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No courses assigned to this class yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Add Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold font-display text-slate-800">Add Student to Class</h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
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

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leo Parker"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Login Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. leo@littlegenius.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="14"
                    value={studentAge}
                    onChange={(e) => setStudentAge(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Mascot Avatar
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'fox', icon: '🦊' },
                    { id: 'owl', icon: '🦉' },
                    { id: 'bear', icon: '🐻' },
                    { id: 'lion', icon: '🦁' },
                  ].map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setStudentAvatar(av.id)}
                      className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                        studentAvatar === av.id ? 'border-orange-500 bg-orange-50 scale-105' : 'border-slate-200'
                      }`}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="kid-button-primary py-2 px-5 text-xs"
                >
                  {addingStudent ? 'Creating...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
