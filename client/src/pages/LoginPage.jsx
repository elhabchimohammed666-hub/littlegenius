import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { playPop, playCorrect } = useSound();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    playPop();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      playCorrect();
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    playPop();
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 mx-auto flex items-center justify-center text-2xl shadow-md">
            🦊
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Welcome to LittleGenius
          </h2>
          <p className="text-xs text-slate-500">
            Log in to your teacher or student account
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. teacher@littlegenius.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full kid-button-primary py-3 text-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('teacher@littlegenius.edu', 'Password123!')}
              className="p-2 text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl font-bold text-slate-700 text-center"
            >
              👩‍🏫 Teacher Sarah
            </button>
            <button
              type="button"
              onClick={() => fillDemo('adam@littlegenius.edu', 'Student123!')}
              className="p-2 text-xs bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl font-bold text-slate-700 text-center"
            >
              🎒 Student Adam
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Need a teacher account?{' '}
          <Link to="/register" onClick={playPop} className="font-bold text-orange-600 hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};
