import React, { useState } from 'react';
import { api } from '../../services/api';
import { useSound } from '../../context/SoundContext';
import { X, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export const ManualActivityModal = ({ section, isOpen, onClose, onActivityCreated }) => {
  const { playPop, playCorrect } = useSound();

  const [type, setType] = useState('multiple-choice');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Questions for multiple-choice
  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      hint: '',
    },
  ]);

  // Pairs for matching
  const [pairs, setPairs] = useState([
    { id: 'p1', left: '', right: '', explanation: '' },
    { id: 'p2', left: '', right: '', explanation: '' },
  ]);

  // Items for fill-blank
  const [items, setItems] = useState([
    {
      id: 'f1',
      sentence: 'A fraction has a {blank} on top.',
      blanks: ['numerator'],
      options: ['numerator', 'denominator'],
      explanation: '',
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    playPop();
    setQuestions((prev) => [
      ...prev,
      {
        id: `q${prev.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
        hint: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    playPop();
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddPair = () => {
    playPop();
    setPairs((prev) => [
      ...prev,
      { id: `p${prev.length + 1}`, left: '', right: '', explanation: '' },
    ]);
  };

  const handleRemovePair = (idx) => {
    playPop();
    setPairs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an activity title.');
      return;
    }

    setSaving(true);
    setError('');

    let contentData = {};
    if (type === 'multiple-choice') {
      contentData = { questions };
    } else if (type === 'matching') {
      contentData = { pairs };
    } else {
      contentData = { items };
    }

    try {
      const response = await api.createActivity({
        sectionId: section._id,
        title,
        type,
        difficulty,
        instructions: instructions || 'Complete this exercise carefully!',
        content: contentData,
        isAiGenerated: false,
      });

      playCorrect();
      onActivityCreated(response.activity);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create manual activity.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-display">Create Activity Manually</h3>
            <p className="text-slate-300 text-xs">For section: "{section?.title}"</p>
          </div>
          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Activity Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Halves and Quarters Practice"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Activity Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-orange-500"
              >
                <option value="multiple-choice">Multiple-Choice Quiz</option>
                <option value="matching">Matching Pairs</option>
                <option value="fill-blank">Fill in the Blanks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Instructions
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Select the correct answer"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Type specific forms */}
          {type === 'multiple-choice' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Questions:</h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Enter question text"
                    value={q.question}
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[idx].question = e.target.value;
                      setQuestions(copy);
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm bg-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                        <input
                          type="radio"
                          name={`manual_correct_${idx}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => {
                            const copy = [...questions];
                            copy[idx].correctIndex = optIdx;
                            setQuestions(copy);
                          }}
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...questions];
                            copy[idx].options[optIdx] = e.target.value;
                            setQuestions(copy);
                          }}
                          className="w-full text-xs border-0 p-0 focus:ring-0"
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Explanation for students (Why is it correct?)"
                    value={q.explanation}
                    onChange={(e) => {
                      const copy = [...questions];
                      copy[idx].explanation = e.target.value;
                      setQuestions(copy);
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          )}

          {type === 'matching' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Pairs:</h4>
                <button
                  type="button"
                  onClick={handleAddPair}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Pair
                </button>
              </div>

              {pairs.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Left (e.g. 1/2)"
                    value={p.left}
                    onChange={(e) => {
                      const copy = [...pairs];
                      copy[idx].left = e.target.value;
                      setPairs(copy);
                    }}
                    className="w-1/2 px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <span className="text-slate-400">➔</span>
                  <input
                    type="text"
                    required
                    placeholder="Right (e.g. One Half)"
                    value={p.right}
                    onChange={(e) => {
                      const copy = [...pairs];
                      copy[idx].right = e.target.value;
                      setPairs(copy);
                    }}
                    className="w-1/2 px-3 py-1.5 border rounded-lg text-xs"
                  />
                  {pairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePair(idx)}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit buttons */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                playPop();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="kid-button-primary py-2.5 px-6 text-sm"
            >
              {saving ? 'Saving...' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
