import React, { useState } from 'react';
import { api } from '../../services/api';
import { useSound } from '../../context/SoundContext';
import {
  Sparkles,
  RefreshCw,
  CheckCircle,
  X,
  Edit3,
  AlertCircle,
  Brain,
  Sliders,
  HelpCircle,
} from 'lucide-react';

export const AIActivityGeneratorModal = ({
  section,
  course,
  isOpen,
  onClose,
  onActivityCreated,
}) => {
  const { playPop, playCorrect } = useSound();

  // Generation parameters
  const [activityType, setActivityType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [targetAge, setTargetAge] = useState(course?.targetAgeMin || 9);
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generated state for review & edit
  const [generatedData, setGeneratedData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    playPop();
    setLoading(true);
    setError('');

    try {
      const response = await api.generateAIActivity({
        sectionId: section?._id,
        lessonTitle: section?.title,
        customContent: section?.content,
        activityType,
        difficulty,
        targetAge,
        customInstructions,
      });

      setGeneratedData(response.data);
      playCorrect();
    } catch (err) {
      setError(err.message || 'Failed to generate activity with AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndApprove = async () => {
    if (!generatedData) return;
    playPop();
    setSaving(true);
    setError('');

    try {
      const newActivity = await api.createActivity({
        sectionId: section._id,
        title: generatedData.title || `${activityType} Activity`,
        type: activityType,
        difficulty,
        instructions: generatedData.instructions || '',
        content: generatedData.content,
        isAiGenerated: true,
        aiPromptUsed: customInstructions || `Generated for ${section.title}`,
      });

      playCorrect();
      onActivityCreated(newActivity.activity);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save approved activity.');
    } finally {
      setSaving(false);
    }
  };

  // Editing helpers for Multiple Choice questions
  const handleUpdateQuestion = (qIdx, field, val) => {
    setGeneratedData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.content.questions[qIdx][field] = val;
      return copy;
    });
  };

  const handleUpdateOption = (qIdx, optIdx, val) => {
    setGeneratedData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.content.questions[qIdx].options[optIdx] = val;
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h3 className="text-xl font-bold font-display flex items-center gap-2">
                AI Activity Generator
                <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  Teacher Copilot
                </span>
              </h3>
              <p className="text-orange-100 text-xs">
                Generating interactive learning exercises for: <strong>"{section?.title}"</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!generatedData ? (
            /* Parameters Form */
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Source Lesson Content:
                </p>
                <p className="text-sm text-slate-700 line-clamp-3 italic">
                  "{section?.content}"
                </p>
              </div>

              {/* Activity Type Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  1. Select Activity Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { type: 'multiple-choice', title: 'Multiple-Choice Quiz', icon: '🎯', desc: 'Questions with 4 options & feedback' },
                    { type: 'matching', title: 'Matching Cards', icon: '🧩', desc: 'Connect terms with definitions' },
                    { type: 'fill-blank', title: 'Fill in the Blanks', icon: '✏️', desc: 'Missing word sentences' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        playPop();
                        setActivityType(item.type);
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        activityType === item.type
                          ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{item.icon}</span>
                      <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    2. Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="easy">Easy (3 questions / simpler hints)</option>
                    <option value="medium">Medium (Standard 4th grade curriculum)</option>
                    <option value="hard">Hard (Challenging / synthesis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    3. Target Student Age
                  </label>
                  <select
                    value={targetAge}
                    onChange={(e) => setTargetAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((age) => (
                      <option key={age} value={age}>
                        {age} years old
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special instructions */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>4. Teacher Guidance / Special Instructions (Optional)</span>
                  <span className="text-xs text-slate-400 font-normal">e.g., focus on quarters</span>
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on quarters and comparing them to halves"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full kid-button-primary py-3.5 text-base shadow-orange-500/30"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Educational Activity with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Activity with AI
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Review & Edit Step (Teacher in the Loop) */
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Activity Generated Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Review and modify questions below before approving. AI content requires your validation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Title & Instructions preview/edit */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Activity Title:
                  </label>
                  <input
                    type="text"
                    value={generatedData.title || ''}
                    onChange={(e) =>
                      setGeneratedData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Instructions for Students:
                  </label>
                  <input
                    type="text"
                    value={generatedData.instructions || ''}
                    onChange={(e) =>
                      setGeneratedData((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Content items review */}
              {activityType === 'multiple-choice' && (
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Questions & Answers ({generatedData.content?.questions?.length}):
                  </h5>

                  {generatedData.content?.questions?.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
                          Question {qIdx + 1}
                        </span>
                        <span className="text-xs text-slate-500">
                          Correct: Option {String.fromCharCode(65 + q.correctIndex)}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-sm bg-white"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              optIdx === q.correctIndex
                                ? 'border-emerald-400 bg-emerald-50/60'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={optIdx === q.correctIndex}
                              onChange={() => handleUpdateQuestion(qIdx, 'correctIndex', optIdx)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              className="text-xs font-medium text-slate-800 flex-1 bg-transparent border-0 p-0 focus:ring-0"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        <strong className="text-orange-600">Explanation: </strong>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                          className="w-full mt-1 px-2 py-1 border rounded text-xs bg-slate-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activityType === 'matching' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Generated Pairs ({generatedData.content?.pairs?.length}):
                  </h5>
                  {generatedData.content?.pairs?.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">{p.left}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="font-semibold text-indigo-700">{p.right}</span>
                    </div>
                  ))}
                </div>
              )}

              {activityType === 'fill-blank' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    Generated Sentences ({generatedData.content?.items?.length}):
                  </h5>
                  {generatedData.content?.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                    >
                      <p className="font-bold text-slate-800">{item.sentence}</p>
                      <p className="text-emerald-700 font-semibold">
                        Blanks: {item.blanks?.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setGeneratedData(null)}
                  className="px-4 py-2 font-bold text-xs text-slate-600 hover:text-slate-900"
                >
                  Back to Parameters
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndApprove}
                  disabled={saving}
                  className="kid-button-primary py-2.5 px-6 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Approve & Save Activity'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
