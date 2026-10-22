import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import { Users, Plus, BookOpen, UserPlus, ArrowRight, X, AlertCircle } from 'lucide-react';

export const TeacherClassesPage = () => {
  const { playPop, playCorrect } = useSound();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Class Form state
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 4');
  const [ageGroup, setAgeGroup] = useState('8-10 years');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await api.createClass({
        name,
        gradeLevel,
        ageGroup,
        description,
        color,
      });
      playCorrect();
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchClasses();
    } catch (err) {
      setError(err.message || 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800">
            Class Management 🏫
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize student groups, assign learning modules, and monitor group progress.
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
          Create New Class
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="kid-card p-6 flex flex-col justify-between hover:border-indigo-400 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: cls.color || '#4F46E5' }}
                >
                  {cls.name?.charAt(0)}
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border">
                  {cls.code}
                </span>
              </div>

              <h2 className="text-xl font-bold font-display text-slate-800 group-hover:text-indigo-600 transition-colors">
                {cls.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {cls.gradeLevel} • {cls.ageGroup}
              </p>
              {cls.description && (
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {cls.description}
                </p>
              )}

              {/* Stats badges */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span><strong>{cls.students?.length || 0}</strong> Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span><strong>{cls.assignedCourses?.length || 0}</strong> Courses</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to={`/teacher/classes/${cls._id}`}
                onClick={playPop}
                className="w-full kid-button-secondary py-2 text-xs"
              >
                Manage Class & Students
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}

        {classes.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <span className="text-4xl mb-3 block">🏫</span>
            <h3 className="text-lg font-bold font-display text-slate-800">No classes yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Create your first classroom to add student accounts and assign courses.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="kid-button-primary py-2 px-5 text-xs mx-auto"
            >
              <Plus className="w-4 h-4" /> Create Class
            </button>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold font-display text-slate-800">Create New Class</h3>
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

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 4 - Explorers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g. Grade 4"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Age Group
                  </label>
                  <input
                    type="text"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    placeholder="e.g. 8-10 years"
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short note about the class focus"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  {['#4F46E5', '#059669', '#EA580C', '#D97706', '#DB2777', '#0284C7'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  {creating ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
