import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import {
  Users,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle,
  Clock
} from 'lucide-react';

export const TeacherDashboardPage = () => {
  const { user } = useAuth();
  const { playPop } = useSound();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getTeacherDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = dashboardData?.stats || {};
  const recentClasses = dashboardData?.recentClasses || [];
  const recentCourses = dashboardData?.recentCourses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-white/20 rounded-full">
            Teacher Control Center
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-display mt-2">
            Welcome back, {user?.name}! 👩‍🏫
          </h1>
          <p className="text-orange-100 text-sm mt-1 max-w-xl">
            {user?.school} • Manage your classes, prepare courses, and use AI to craft engaging interactive activities for young minds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/teacher/classes"
            onClick={playPop}
            className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            My Classes
          </Link>
          <Link
            to="/teacher/courses"
            onClick={playPop}
            className="px-4 py-2.5 bg-orange-700/60 hover:bg-orange-700/80 text-white rounded-2xl font-bold text-sm backdrop-blur transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Course
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Classes</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
            {stats.totalClasses || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courses Created</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
            {stats.totalCourses || 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {stats.publishedCourses || 0} published
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Student Score</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
            {stats.averageScore || 0}%
          </p>
          <span className="text-[11px] text-slate-500">Across {stats.totalSubmissions || 0} attempts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Activities</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
            {stats.totalActivities || 0}
          </p>
          <span className="text-[11px] text-purple-600 font-semibold">Quizzes & games</span>
        </div>
      </div>

      {/* Attention / Struggling Students Notification (Scenario Highlight) */}
      {stats.strugglingCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base font-display">
                Pedagogical Alert: Students experiencing difficulties detected
              </h3>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                {stats.strugglingCount} recent activity attempts fell below 60% (e.g. Quarters in Fractions). Review student progress to reinforce the topic.
              </p>
            </div>
          </div>

          <Link
            to="/teacher/analytics"
            onClick={playPop}
            className="kid-button-primary py-2 px-5 text-xs whitespace-nowrap"
          >
            Open Progress Analytics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Classes Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Active Classes
            </h2>
            <Link
              to="/teacher/classes"
              onClick={playPop}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentClasses.length > 0 ? (
              recentClasses.map((cls) => (
                <Link
                  key={cls._id}
                  to={`/teacher/classes/${cls._id}`}
                  onClick={playPop}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: cls.color || '#4F46E5' }}
                    >
                      {cls.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {cls.gradeLevel} • Code: <span className="font-mono font-bold text-slate-700">{cls.code}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700">
                    Manage ➔
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No classes yet. Create one!</p>
            )}
          </div>
        </div>

        {/* Courses Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              Educational Courses & Units
            </h2>
            <Link
              to="/teacher/courses"
              onClick={playPop}
              className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <Link
                  key={course._id}
                  to={`/teacher/courses/${course._id}`}
                  onClick={playPop}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white text-lg">
                      📖
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">
                          {course.title}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            course.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {course.subject} • Ages {course.targetAgeMin}-{course.targetAgeMax}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700">
                    Edit ➔
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No courses created yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
