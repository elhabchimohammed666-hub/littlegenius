import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import {
  BookOpen,
  Star,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { playPop } = useSound();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentCourses = async () => {
      try {
        const data = await api.getCourses();
        setCourses(data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Playful Student Hero Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center text-9xl select-none pointer-events-none">
          ⭐
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-white/25 backdrop-blur flex items-center justify-center text-3xl shadow-inner border border-white/30">
              {user?.avatar === 'fox' ? '🦊' : user?.avatar === 'owl' ? '🦉' : user?.avatar === 'bear' ? '🐻' : '🦁'}
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-white/20 rounded-full">
                Young Explorer
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-display mt-1">
                Hi, {user?.name}! 🚀
              </h1>
              <p className="text-amber-100 text-sm">
                Ready for today's learning adventure? Complete activities to earn stars and badges!
              </p>
            </div>
          </div>

          {/* Gamification badges */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/20">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-100">Total Points</p>
                <p className="text-xl font-bold font-display">{user?.points || 0}</p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/20">
              <Flame className="w-5 h-5 text-orange-200 fill-orange-300" />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-100">Daily Streak</p>
                <p className="text-xl font-bold font-display">{user?.streak || 1} Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            My Assigned Courses
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {courses.length} Course{courses.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="kid-card overflow-hidden flex flex-col justify-between group hover:border-orange-400"
            >
              <div>
                {/* Banner */}
                <div className={`h-28 bg-gradient-to-r ${course.themeColor || 'from-amber-400 to-orange-500'} p-5 flex items-center justify-between text-white`}>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner">
                    {course.subject === 'Mathematics' ? '🥧' : course.subject === 'Science' ? '🪐' : '📖'}
                  </div>

                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold">
                    {course.subject}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold font-display text-slate-800 group-hover:text-orange-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Course Progress</span>
                      <span className="text-orange-600">{course.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progressPercent || 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-right">
                      {course.completedActivities || 0} of {course.totalActivities || 0} activities finished
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/student/course/${course._id}`}
                  onClick={playPop}
                  className="w-full kid-button-primary py-2.5 text-xs shadow-orange-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}

          {courses.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <span className="text-4xl mb-2 block">🌟</span>
              <h3 className="text-lg font-bold font-display text-slate-800">No courses assigned yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your teacher will publish courses to your classroom soon. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trophies & Badges Cabinet */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          My Trophy Cabinet 🏆
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {user?.badges?.map((badge, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50 text-center space-y-1 hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-1">{badge.icon || '🏆'}</div>
              <p className="font-bold text-slate-800 text-xs font-display">{badge.title}</p>
              <p className="text-[10px] text-slate-500">{badge.description}</p>
            </div>
          ))}

          {(!user?.badges || user.badges.length === 0) && (
            <p className="text-xs text-slate-400 col-span-full py-4 text-center">
              Complete quizzes and exercises to unlock trophies!
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
