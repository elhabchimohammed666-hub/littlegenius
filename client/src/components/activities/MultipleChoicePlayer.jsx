import React, { useState } from 'react';
import { useSound } from '../../context/SoundContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, ArrowLeft, RotateCcw, Award } from 'lucide-react';

export const MultipleChoicePlayer = ({ activity, onComplete, initialProgress }) => {
  const { playCorrect, playWrong, playPop, playFanfare } = useSound();
  const questions = activity.content?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQ = questions[currentIndex] || {};
  const currentSelection = selectedAnswers[currentQ.id || currentIndex];

  const handleSelectOption = (idx) => {
    if (submitted) return;
    playPop();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id || currentIndex]: idx,
    }));
  };

  const handleNext = () => {
    playPop();
    setShowHint(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playPop();
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await onComplete(selectedAnswers);
      setEvaluation(result?.evaluation);
      setSubmitted(true);

      if (result?.evaluation?.percentage >= 80) {
        playFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else if (result?.evaluation?.isCompleted) {
        playCorrect();
      } else {
        playWrong();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    playPop();
    setSelectedAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setEvaluation(null);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-xl overflow-hidden max-w-3xl mx-auto">
      {/* Top Header & Progress Bar */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-xl font-bold font-display">{activity.title}</h2>
              <p className="text-amber-100 text-xs">{activity.instructions}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question dots progress */}
        <div className="flex items-center gap-1.5 mt-2">
          {questions.map((_, idx) => {
            const isDone = selectedAnswers[questions[idx].id || idx] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-white'
                    : isDone
                    ? 'bg-amber-200/90'
                    : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 md:p-8">
        {!submitted ? (
          <div>
            {/* Question Text */}
            <div className="mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Difficulty: {activity.difficulty || 'medium'}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-3 font-display leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Hint Box (if available) */}
            {currentQ.hint && (
              <div className="mb-6">
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setShowHint(true);
                    }}
                    className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    Need a clue? Click here!
                  </button>
                ) : (
                  <div className="p-4 bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-2xl flex items-start gap-3 animate-fadeIn">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-xs font-bold text-amber-900 uppercase">Helpful Clue:</p>
                      <p className="text-sm text-amber-800">{currentQ.hint}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 mb-8">
              {currentQ.options?.map((option, idx) => {
                const isSelected = currentSelection === idx;
                const optionLetter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 shadow-md ring-2 ring-orange-400/30'
                        : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-base font-semibold text-slate-800 flex-1">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="kid-button-primary py-2.5 px-6 text-sm"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isAllAnswered || submitting}
                  className="kid-button-primary py-2.5 px-8 text-sm disabled:opacity-50"
                >
                  {submitting ? 'Checking...' : 'Finish & Submit! 🚀'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Post-submission Review & Explanation */
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-2">
                {evaluation?.percentage >= 80 ? '🎉' : evaluation?.percentage >= 60 ? '👍' : '💪'}
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-800">
                {evaluation?.percentage >= 80
                  ? 'Outstanding Work!'
                  : evaluation?.percentage >= 60
                  ? 'Good Job!'
                  : 'Keep Practicing!'}
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                You scored <strong className="text-orange-600 text-lg">{evaluation?.score} / {evaluation?.maxScore}</strong> ({evaluation?.percentage}%)
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                Earned +{evaluation?.pointsEarned || 0} points!
              </div>
            </div>

            {/* Questions Review with detailed explanations */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Detailed Review & Explanations:
              </h4>

              {questions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id || idx];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border-2 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-rose-200 bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-base">
                          {idx + 1}. {q.question}
                        </p>
                        
                        <div className="mt-2 text-sm space-y-1">
                          <p className="text-slate-600">
                            Your answer: <span className={isCorrect ? 'font-bold text-emerald-700' : 'font-bold text-rose-600 line-through'}>{q.options[userChoice] || 'None'}</span>
                          </p>
                          {!isCorrect && (
                            <p className="text-emerald-700 font-bold">
                              Correct answer: {q.options[q.correctIndex]}
                            </p>
                          )}
                        </div>

                        {/* Kid-friendly explanation */}
                        <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-700">
                          <strong className="text-orange-600">Why: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Retry Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleRetry}
                className="kid-button-secondary text-sm mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again for Practice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
