import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import {
  Sparkles,
  BookOpen,
  Users,
  Brain,
  Award,
  CheckCircle2,
  ArrowRight,
  Play
} from 'lucide-react';

export const HomePage = () => {
  const { login, user } = useAuth();
  const { playPop, playCorrect } = useSound();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password, redirectPath) => {
    playPop();
    try {
      await login(email, password);
      playCorrect();
      navigate(redirectPath);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="space-y-16 py-8 md:py-16">
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Next-Generation AI Learning Platform for Kids (Ages 6 to 12)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-display text-slate-900 tracking-tight leading-tight">
          Inspiring Young Minds with <br />
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
            AI-Powered Education
          </span> 🦊
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium">
          LittleGenius empowers primary school teachers to create courses and transform lessons into interactive quizzes, matching pairs, and fill-in-the-blank adventures in seconds with AI.
        </p>

        {/* Quick Demo Logins Box */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              🚀 One-Click Demo Access (Seed Scenario Ready)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('teacher@littlegenius.edu', 'Password123!', '/teacher')
                }
                className="p-3.5 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-100 text-left transition-all flex items-center gap-3 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">👩‍🏫</span>
                <div>
                  <p className="text-xs font-bold text-indigo-950">Teacher Sarah</p>
                  <p className="text-[11px] text-indigo-600">Grade 4 • Course Builder & AI</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('adam@littlegenius.edu', 'Student123!', '/student')
                }
                className="p-3.5 rounded-2xl border-2 border-orange-200 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-100 text-left transition-all flex items-center gap-3 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🎒</span>
                <div>
                  <p className="text-xs font-bold text-orange-950">Student Adam (Age 9)</p>
                  <p className="text-[11px] text-orange-600">Try Fractions Quiz & Practice</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="kid-card p-6 md:p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shadow-xs">
              ✨
            </div>
            <h3 className="text-xl font-bold font-display text-slate-800">
              AI Activity Generation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teachers simply write or paste their lesson notes, and the AI produces curriculum-aligned multiple-choice questions, matching pairs, and fill-in-the-blanks with age-appropriate explanations.
            </p>
          </div>

          <div className="kid-card p-6 md:p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl shadow-xs">
              🧩
            </div>
            <h3 className="text-xl font-bold font-display text-slate-800">
              Interactive Kids Learning
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Children aged 6 to 12 learn with clear visual feedback, tactile matching cards, instant explanations for mistakes, celebratory confetti, and retry options.
            </p>
          </div>

          <div className="kid-card p-6 md:p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shadow-xs">
              📊
            </div>
            <h3 className="text-xl font-bold font-display text-slate-800">
              Progress & Diagnostics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time analytics show completion rates and automatically detect when students struggle with specific concepts (like quarters in fractions), guiding targeted teaching.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
