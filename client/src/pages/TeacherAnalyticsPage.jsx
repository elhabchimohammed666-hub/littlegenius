import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight
} from 'lucide-react';

export const TeacherAnalyticsPage = () => {
  const [searchParams] = useSearchParams();
  const { playPop } = useSound();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get('classId') || '');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch teacher's classes first
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await api.getClasses();
        const list = data.classes || [];
        setClasses(list);
        if (list.length > 0 && !selectedClassId) {
          setSelectedClassId(list[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch class analytics when selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }
    const fetchClassAnalytics = async () => {
      setLoading(true);
      try {
        const data = await api.getClassAnalytics(selectedClassId);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassAnalytics();
  }, [selectedClassId]);

  const metrics = analytics?.metrics || {};
  const studentPerformance = analytics?.studentPerformance || [];
  const strugglingTopics = analytics?.strugglingTopics || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Class Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-800 flex items-center gap-2">
            Class Progress & Diagnostics 📊
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor course completion rates, spot recurring learning bottlenecks, and support individual students.
          </p>
        </div>

        {/* Dropdown to switch class */}
        {classes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Selected Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => {
                playPop();
                setSelectedClassId(e.target.value);
              }}
              className="px-4 py-2 rounded-2xl border-2 border-slate-200 bg-white font-bold text-slate-800 text-sm focus:ring-2 focus:ring-orange-500"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.gradeLevel})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading classroom analytics...</div>
      ) : !analytics ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm">Please select a class to inspect progress data.</p>
        </div>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Completion</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display">
                  {metrics.overallCompletionRate || 0}%
                </p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${metrics.overallCompletionRate || 0}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
                {metrics.averageScore || 0}%
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Class overall performance
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
                {metrics.activeStudentsCount || 0}
              </p>
              <span className="text-[11px] text-slate-500">Active learners</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                metrics.strugglingStudentsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {metrics.strugglingStudentsCount > 0 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Attention</p>
              <p className="text-2xl md:text-3xl font-bold text-slate-800 font-display mt-1">
                {metrics.strugglingStudentsCount || 0}
              </p>
              <span className="text-[11px] text-amber-700 font-semibold">
                {metrics.strugglingStudentsCount > 0 ? 'Students below 70%' : 'All students on track'}
              </span>
            </div>

          </div>

          {/* Topics Presenting Recurring Difficulties (PDF Section 3.2 C) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Topics Presenting Recurring Difficulties
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Identified from real student answer submissions and error patterns.
                </p>
              </div>
            </div>

            {strugglingTopics.length > 0 ? (
              <div className="space-y-4 pt-2">
                {strugglingTopics.map((topicItem, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                          {topicItem.strugglingCount} student(s) struggling
                        </span>
                        <h3 className="font-bold text-slate-800 text-base">
                          {topicItem.topic}
                        </h3>
                      </div>

                      <Link
                        to="/teacher/courses"
                        onClick={playPop}
                        className="kid-button-primary py-1.5 px-3 text-xs inline-flex items-center gap-1 w-fit"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Create AI Practice Activity
                      </Link>
                    </div>

                    {/* Common mistakes */}
                    {topicItem.mistakes?.length > 0 && (
                      <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5">
                        <p className="font-bold text-slate-700">Observed Misconceptions:</p>
                        {topicItem.mistakes.slice(0, 3).map((m, mIdx) => (
                          <div key={mIdx} className="text-slate-600 pl-2 border-l-2 border-amber-400">
                            <strong>Question:</strong> {m.question} <br />
                            <span className="text-rose-600">{m.details}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-emerald-900 text-sm">No Recurring Difficulties Detected!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Students are passing their assigned activities with high confidence.
                </p>
              </div>
            )}
          </div>

          {/* Student Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Individual Student Performance & Progress
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Completed Activities</th>
                    <th className="py-3 px-4">Completion %</th>
                    <th className="py-3 px-4">Average Score</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentPerformance.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                            {student.avatar === 'fox' ? '🦊' : student.avatar === 'owl' ? '🦉' : student.avatar === 'bear' ? '🐻' : '🦁'}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">{student.name}</p>
                            <p className="text-[11px] text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {student.activitiesCompleted} / {student.totalActivities}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${student.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{student.completionRate}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {student.averageScore}%
                      </td>

                      <td className="py-3.5 px-4">
                        {student.needsHelp ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
