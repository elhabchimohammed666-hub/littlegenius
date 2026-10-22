import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import {
  Sparkles,
  BookOpen,
  Users,
  BarChart3,
  LogOut,
  Volume2,
  VolumeX,
  Flame,
  Star,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const { soundEnabled, toggleSound, playPop } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    playPop();
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link
            to={user ? (isTeacher ? '/teacher' : '/student') : '/'}
            onClick={playPop}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🦊
            </div>
            <div>
              <span className="text-xl font-bold font-display bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                LittleGenius
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                AI for Kids
              </span>
            </div>
          </Link>

          {/* Navigation links based on role */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {isTeacher && (
                <>
                  <Link
                    to="/teacher"
                    onClick={playPop}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/teacher')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Overview
                  </Link>

                  <Link
                    to="/teacher/classes"
                    onClick={playPop}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/teacher/classes')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Classes
                  </Link>

                  <Link
                    to="/teacher/courses"
                    onClick={playPop}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/teacher/courses')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Courses & AI
                  </Link>

                  <Link
                    to="/teacher/analytics"
                    onClick={playPop}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/teacher/analytics')
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Progress Analytics
                  </Link>
                </>
              )}

              {isStudent && (
                <>
                  <Link
                    to="/student"
                    onClick={playPop}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors flex items-center gap-2 ${
                      isActive('/student')
                        ? 'bg-amber-100 text-amber-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    My Courses
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right Controls: Sound, Points/Streak (Student), Profile, Auth */}
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Student Gamification Badges */}
                {isStudent && (
                  <div className="flex items-center gap-2">
                    <div
                      title="Your total points"
                      className="flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-bold text-xs"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{user.points || 0} pts</span>
                    </div>

                    <div
                      title="Your learning streak"
                      className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-800 rounded-full font-bold text-xs"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                      <span>{user.streak || 1}d</span>
                    </div>
                  </div>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 overflow-hidden border">
                    {user.avatar === 'fox' ? '🦊' : user.avatar === 'owl' ? '🦉' : user.avatar === 'bear' ? '🐻' : user.avatar === 'lion' ? '🦁' : '🎓'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={playPop}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={playPop}
                  className="kid-button-primary text-sm py-2 px-4"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
