import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSound } from '../context/SoundContext';
import { AIActivityGeneratorModal } from '../components/teacher/AIActivityGeneratorModal';
import { ManualActivityModal } from '../components/teacher/ManualActivityModal';
import {
  BookOpen,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Layers,
  FileText,
  ArrowLeft,
  X,
  AlertCircle
} from 'lucide-react';

export const TeacherCourseDetailPage = () => {
  const { id } = useParams();
  const { playPop, playCorrect } = useSound();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [activeChapterForSection, setActiveChapterForSection] = useState(null);

  // Activity Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [targetSectionForActivity, setTargetSectionForActivity] = useState(null);

  // New chapter form
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');

  // New section form
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionContent, setSectionContent] = useState('');
  const [sectionKeyPoints, setSectionKeyPoints] = useState('');

  const fetchCourse = async () => {
    try {
      const data = await api.getCourseById(id);
      setCourse(data.course);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleTogglePublish = async () => {
    playPop();
    try {
      await api.togglePublishCourse(id);
      playCorrect();
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    playPop();
    try {
      await api.createChapter({
        courseId: id,
        title: chapterTitle,
        description: chapterDesc,
      });
      playCorrect();
      setIsChapterModalOpen(false);
      setChapterTitle('');
      setChapterDesc('');
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!activeChapterForSection) return;
    playPop();

    const keyPointsArray = sectionKeyPoints
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      await api.createSection({
        chapterId: activeChapterForSection._id,
        title: sectionTitle,
        content: sectionContent,
        keyPoints: keyPointsArray,
      });

      playCorrect();
      setIsSectionModalOpen(false);
      setSectionTitle('');
      setSectionContent('');
      setSectionKeyPoints('');
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Delete this activity?')) return;
    playPop();
    try {
      await api.deleteActivity(activityId);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its activities?')) return;
    playPop();
    try {
      await api.deleteSection(sectionId);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter and all contained sections?')) return;
    playPop();
    try {
      await api.deleteChapter(chapterId);
      fetchCourse();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-sm">Loading course structure...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-slate-500 text-sm">Course not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/teacher/courses"
          onClick={playPop}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <button
          onClick={handleTogglePublish}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
            course.isPublished
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
          }`}
        >
          {course.isPublished ? (
            <>
              <Eye className="w-4 h-4" /> Published to Classes
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" /> Draft Mode (Click to Publish)
            </>
          )}
        </button>
      </div>

      {/* Course Banner */}
      <div className={`bg-gradient-to-r ${course.themeColor || 'from-amber-400 to-orange-500'} rounded-3xl p-6 md:p-8 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 bg-white/20 rounded-full">
              {course.subject} • Target Ages {course.targetAgeMin}–{course.targetAgeMax}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold font-display mt-2">{course.title}</h1>
            <p className="text-white/90 text-sm mt-1 max-w-2xl">{course.description}</p>
          </div>

          <button
            onClick={() => {
              playPop();
              setIsChapterModalOpen(true);
            }}
            className="px-4 py-2.5 bg-white text-slate-800 hover:bg-slate-50 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>
      </div>

      {/* Hierarchy: Chapters List */}
      <div className="space-y-6">
        {course.chapters?.length > 0 ? (
          course.chapters.map((chapter, cIdx) => (
            <div
              key={chapter._id}
              className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Chapter Header */}
              <div className="p-5 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center">
                    C{cIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-display">
                      {chapter.title}
                    </h3>
                    {chapter.description && (
                      <p className="text-xs text-slate-500">{chapter.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playPop();
                      setActiveChapterForSection(chapter);
                      setIsSectionModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>

                  <button
                    onClick={() => handleDeleteChapter(chapter._id)}
                    title="Delete Chapter"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sections within Chapter */}
              <div className="p-5 space-y-6">
                {chapter.sections?.length > 0 ? (
                  chapter.sections.map((section, sIdx) => (
                    <div
                      key={section._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">§{sIdx + 1}</span>
                          <h4 className="font-bold text-slate-800 text-base">
                            {section.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* AI Generator Button */}
                          <button
                            onClick={() => {
                              playPop();
                              setTargetSectionForActivity(section);
                              setIsAIModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate with AI
                          </button>

                          {/* Manual Activity Button */}
                          <button
                            onClick={() => {
                              playPop();
                              setTargetSectionForActivity(section);
                              setIsManualModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Manual
                          </button>

                          <button
                            onClick={() => handleDeleteSection(section._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Educational Content Preview */}
                      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {section.content}
                      </div>

                      {/* Activities in Section */}
                      {section.activities?.length > 0 && (
                        <div className="pt-3 border-t space-y-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Interactive Activities ({section.activities.length}):
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {section.activities.map((act) => (
                              <div
                                key={act._id}
                                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span>
                                      {act.type === 'multiple-choice' ? '🎯' : act.type === 'matching' ? '🧩' : '✏️'}
                                    </span>
                                    <span className="font-bold text-slate-800">{act.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                                      {act.difficulty}
                                    </span>
                                    {act.isAiGenerated && (
                                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                                        ✨ AI
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDeleteActivity(act._id)}
                                  title="Delete activity"
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No sections in this chapter yet. Click "Add Section" to add lesson explanations!
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <span className="text-4xl mb-3 block">📑</span>
            <h3 className="text-lg font-bold font-display text-slate-800">No chapters yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Begin by creating Chapter 1 (e.g. "What is a Fraction?").
            </p>
            <button
              onClick={() => setIsChapterModalOpen(true)}
              className="kid-button-primary py-2 px-5 text-xs mx-auto"
            >
              <Plus className="w-4 h-4" /> Add First Chapter
            </button>
          </div>
        )}
      </div>

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold font-display text-slate-800">Add Chapter</h3>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: Halves and Quarters"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short description of this unit"
                  value={chapterDesc}
                  onChange={(e) => setChapterDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="kid-button-primary py-2 px-5 text-xs">
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-bold font-display text-slate-800">
                Add Section to {activeChapterForSection?.title}
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exploring Halves and Quarters"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Educational Lesson Content (for students & AI)
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="Write clear, engaging explanations with examples for kids aged 6-12..."
                  value={sectionContent}
                  onChange={(e) => setSectionContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Key Points (one per line)
                </label>
                <textarea
                  rows="2"
                  placeholder="2 halves make 1 whole&#10;4 quarters make 1 whole"
                  value={sectionKeyPoints}
                  onChange={(e) => setSectionKeyPoints(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="kid-button-primary py-2 px-5 text-xs">
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Activity Generator Modal */}
      {isAIModalOpen && targetSectionForActivity && (
        <AIActivityGeneratorModal
          section={targetSectionForActivity}
          course={course}
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onActivityCreated={() => {
            fetchCourse();
          }}
        />
      )}

      {/* Manual Activity Modal */}
      {isManualModalOpen && targetSectionForActivity && (
        <ManualActivityModal
          section={targetSectionForActivity}
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onActivityCreated={() => {
            fetchCourse();
          }}
        />
      )}

    </div>
  );
};
