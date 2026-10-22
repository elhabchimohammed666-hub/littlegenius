import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import {
  BookOpen,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Award,
  AlertCircle
} from 'lucide-react';

export const StudentCoursePage = () => {
  const { id } = useParams();
  const { playPop } = useSound();

  const [course, setCourse] = useState(null);
  const [studentProgressMap, setStudentProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.getCourseById(id);
        setCourse(data.course);
        setStudentProgressMap(data.studentProgressMap || {});

        // Auto-select first section
        const firstSection = data.course?.chapters?.[0]?.sections?.[0];
        if (firstSection) {
          setActiveSectionId(firstSection._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-sm">Loading course lessons...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-slate-500 text-sm">Course not found.</div>;
  }

  // Find currently active section object
  let activeSection = null;
  course.chapters?.forEach((ch) => {
    ch.sections?.forEach((sec) => {
      if (sec._id === activeSectionId) activeSection = sec;
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top back button */}
      <div>
        <Link
          to="/student"
          onClick={playPop}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>
      </div>

      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${course.themeColor || 'from-amber-400 to-orange-500'} rounded-3xl p-6 md:p-8 text-white shadow-xl`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner">
            {course.subject === 'Mathematics' ? '🥧' : course.subject === 'Science' ? '🪐' : '📖'}
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-white/20 rounded-full">
              {course.subject}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-display mt-1">
              {course.title}
            </h1>
            <p className="text-white/90 text-xs md:text-sm mt-1 max-w-xl">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Navigation Sidebar & Lesson Content View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 1 Col: Chapters & Sections Outline */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4">
          <h2 className="text-base font-bold font-display text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            Course Curriculum
          </h2>

          <div className="space-y-4">
            {course.chapters?.map((chapter, cIdx) => (
              <div key={chapter._id} className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  {chapter.title}
                </p>

                <div className="space-y-1">
                  {chapter.sections?.map((section) => {
                    const isSelected = activeSectionId === section._id;
                    const activitiesCount = section.activities?.length || 0;
                    const completedInSec = section.activities?.filter(
                      (act) => studentProgressMap[act._id]?.isCompleted
                    ).length || 0;
                    const isSectionDone = activitiesCount > 0 && completedInSec === activitiesCount;

                    return (
                      <button
                        key={section._id}
                        type="button"
                        onClick={() => {
                          playPop();
                          setActiveSectionId(section._id);
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between text-xs font-bold ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isSectionDone ? (
                            <CheckCircle className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                          ) : (
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400'}`} />
                          )}
                          <span className="truncate">{section.title}</span>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {completedInSec}/{activitiesCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Lesson Content Reader & Activities Launcher */}
        <div className="lg:col-span-2 space-y-6">
          {activeSection ? (
            <>
              {/* Educational Explanation Box */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-6">
                <div className="border-b pb-4">
                  <span className="text-xs uppercase font-bold text-orange-600 tracking-wider">
                    Lesson Explanation
                  </span>
                  <h2 className="text-2xl font-bold font-display text-slate-800 mt-1">
                    {activeSection.title}
                  </h2>
                </div>

                {/* Lesson text formatted for readability */}
                <div className="text-slate-700 leading-relaxed space-y-4 text-base whitespace-pre-line font-sans">
                  {activeSection.content}
                </div>

                {/* Key Points */}
                {activeSection.keyPoints?.length > 0 && (
                  <div className="p-5 bg-amber-50/60 border-2 border-amber-200 rounded-2xl space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Key Facts to Remember:
                    </p>
                    <ul className="space-y-1.5 text-xs md:text-sm text-amber-900 pl-4 list-disc font-medium">
                      {activeSection.keyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Interactive Activities Launcher for this Section */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-4">
                <h3 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  Interactive Activities ({activeSection.activities?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Complete these activities to test your understanding and earn points!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {activeSection.activities?.map((activity) => {
                    const prog = studentProgressMap[activity._id];
                    const isDone = prog?.isCompleted;
                    const hasAttempted = prog && prog.attemptsCount > 0;

                    return (
                      <div
                        key={activity._id}
                        className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                          isDone
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : hasAttempted
                            ? 'border-amber-200 bg-amber-50/30'
                            : 'border-slate-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl">
                              {activity.type === 'multiple-choice' ? '🎯' : activity.type === 'matching' ? '🧩' : '✏️'}
                            </span>

                            {isDone ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                <CheckCircle className="w-3.5 h-3.5" /> Passed ({prog.bestPercentage}%)
                              </span>
                            ) : hasAttempted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                Practice ({prog.bestPercentage}%)
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                Not Started
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-800 text-base font-display">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {activity.instructions}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t flex items-center justify-between">
                          <span className="text-[11px] uppercase font-bold text-slate-400">
                            {activity.difficulty}
                          </span>

                          <Link
                            to={`/student/activity/${activity._id}`}
                            onClick={playPop}
                            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isDone
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'kid-button-primary'
                            }`}
                          >
                            {isDone ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" /> Replay
                              </>
                            ) : hasAttempted ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" /> Try Again
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" /> Start
                              </>
                            )}
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {(!activeSection.activities || activeSection.activities.length === 0) && (
                    <p className="text-xs text-slate-400 col-span-full py-4 text-center">
                      No activities added for this section yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border p-8">
              <p className="text-slate-500 text-sm">Select a section from the curriculum to view lesson notes.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
