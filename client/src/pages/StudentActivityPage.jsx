import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { MultipleChoicePlayer } from '../components/activities/MultipleChoicePlayer';
import { MatchingPlayer } from '../components/activities/MatchingPlayer';
import { FillBlankPlayer } from '../components/activities/FillBlankPlayer';
import { ArrowLeft } from 'lucide-react';

export const StudentActivityPage = () => {
  const { id } = useParams();
  const { refreshUser } = useAuth();
  const { playPop } = useSound();

  const [activity, setActivity] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await api.getActivityById(id);
        setActivity(data.activity);
        setStudentProgress(data.studentProgress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  const handleComplete = async (answers) => {
    const result = await api.submitActivity(id, answers);
    // Refresh student context to update points and badges
    refreshUser();
    return result;
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        Loading interactive activity...
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        Activity not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/student/course/${activity.course?._id || activity.course}`}
          onClick={playPop}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lesson
        </Link>
      </div>

      {/* Render matching player based on activity type */}
      {activity.type === 'multiple-choice' && (
        <MultipleChoicePlayer
          activity={activity}
          onComplete={handleComplete}
          initialProgress={studentProgress}
        />
      )}

      {activity.type === 'matching' && (
        <MatchingPlayer
          activity={activity}
          onComplete={handleComplete}
          initialProgress={studentProgress}
        />
      )}

      {activity.type === 'fill-blank' && (
        <FillBlankPlayer
          activity={activity}
          onComplete={handleComplete}
          initialProgress={studentProgress}
        />
      )}

    </div>
  );
};
