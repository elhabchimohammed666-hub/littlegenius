import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { playPop, playCorrect } = useSound();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    playPop();
    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        password,
        role: 'teacher',
        school: school || 'LittleGenius Elementary',
      });
      playCorrect();
      navigate('/teacher');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 mx-auto flex items-center justify-center text-2xl shadow-md">
            👩‍🏫
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            Teacher Registration
          </h2>
          <p className="text-xs text-slate-500">
            Create your teacher account to start managing classes and AI learning activities
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ms. Claire Laurent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. claire@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              School / Institution Name
            </label>
            <input
              type="text"
              placeholder="e.g. Oakridge Primary School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full kid-button-primary py-3 text-sm disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Create Teacher Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" onClick={playPop} className="font-bold text-orange-600 hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};
