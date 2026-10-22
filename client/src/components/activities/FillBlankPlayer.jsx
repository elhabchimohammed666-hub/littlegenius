import React, { useState } from 'react';
import { useSound } from '../../context/SoundContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, RotateCcw, Award, Sparkles } from 'lucide-react';

export const FillBlankPlayer = ({ activity, onComplete }) => {
  const { playCorrect, playWrong, playPop, playFanfare } = useSound();
  const items = activity.content?.items || [];

  const [answers, setAnswers] = useState({}); // { [itemId]: [word1, word2] }
  const [activeBlank, setActiveBlank] = useState({ itemId: items[0]?.id || 0, blankIndex: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectWord = (word) => {
    if (submitted || !activeBlank) return;
    playPop();

    const { itemId, blankIndex } = activeBlank;
    setAnswers((prev) => {
      const currentList = prev[itemId] ? [...prev[itemId]] : [];
      currentList[blankIndex] = word;
      return {
        ...prev,
        [itemId]: currentList,
      };
    });

    // Automatically advance to next blank if available
    const item = items.find((it, idx) => (it.id || idx) === itemId);
    const blanksCount = item?.blanks?.length || 1;
    if (blankIndex + 1 < blanksCount) {
      setActiveBlank({ itemId, blankIndex: blankIndex + 1 });
    }
  };

  const handleClearBlank = (itemId, blankIndex) => {
    if (submitted) return;
    playPop();
    setAnswers((prev) => {
      const currentList = prev[itemId] ? [...prev[itemId]] : [];
      currentList[blankIndex] = '';
      return {
        ...prev,
        [itemId]: currentList,
      };
    });
    setActiveBlank({ itemId, blankIndex });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await onComplete(answers);
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
    setAnswers({});
    setActiveBlank({ itemId: items[0]?.id || 0, blankIndex: 0 });
    setSubmitted(false);
    setEvaluation(null);
  };

  // Collect all unique options across items for word bank chips
  const allBankWords = Array.from(
    new Set(
      items.flatMap((item) => item.options || item.blanks || [])
    )
  );

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-xl overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✏️</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display">{activity.title}</h2>
              <p className="text-emerald-100 text-xs mt-0.5">{activity.instructions}</p>
            </div>
          </div>
          <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
            {items.length} Sentences
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {!submitted ? (
          <div>
            {/* Instruction Tip */}
            <p className="text-xs md:text-sm font-semibold text-slate-600 mb-6 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Click an empty <strong>[ blank ]</strong>, then click a word from the <strong>Word Bank</strong> below!
            </p>

            {/* Sentences list */}
            <div className="space-y-6 mb-8">
              {items.map((item, itemIdx) => {
                const itemId = item.id || itemIdx;
                const sentenceParts = item.sentence.split('{blank}');
                const itemAnswers = answers[itemId] || [];

                return (
                  <div
                    key={itemIdx}
                    className="p-5 rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {itemIdx + 1}
                      </span>

                      <div className="text-base md:text-lg font-semibold text-slate-800 leading-loose flex-1 flex-wrap">
                        {sentenceParts.map((part, pIdx) => {
                          const isLast = pIdx === sentenceParts.length - 1;
                          const currentWord = itemAnswers[pIdx] || '';
                          const isActive =
                            activeBlank?.itemId === itemId && activeBlank?.blankIndex === pIdx;

                          return (
                            <React.Fragment key={pIdx}>
                              <span>{part}</span>
                              {!isLast && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    playPop();
                                    setActiveBlank({ itemId, blankIndex: pIdx });
                                  }}
                                  className={`inline-flex items-center justify-center min-w-[100px] px-3 py-1 mx-1.5 rounded-xl border-2 font-bold text-sm transition-all ${
                                    currentWord
                                      ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-xs'
                                      : isActive
                                      ? 'border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-300 animate-pulse'
                                      : 'border-dashed border-slate-400 bg-white text-slate-400 hover:border-emerald-400'
                                  }`}
                                >
                                  {currentWord || 'Click here'}
                                  {currentWord && (
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearBlank(itemId, pIdx);
                                      }}
                                      className="ml-1.5 text-xs text-rose-500 hover:text-rose-700 font-bold"
                                      title="Remove word"
                                    >
                                      ✕
                                    </span>
                                  )}
                                </button>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Word Bank Chips */}
            <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <span>🔤</span> Word Bank (Click to fill active blank):
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {allBankWords.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    onClick={() => handleSelectWord(word)}
                    className="px-4 py-2 bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-400 rounded-xl font-bold text-slate-700 hover:text-emerald-800 text-sm shadow-xs transition-all active:scale-95"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="kid-button-primary py-2.5 px-8 text-sm inline-flex items-center gap-2"
              >
                {submitting ? 'Checking...' : 'Submit Answers! 🚀'}
              </button>
            </div>
          </div>
        ) : (
          /* Post-submission Review & Explanation */
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-2">
                {evaluation?.percentage >= 80 ? '🌟' : '👍'}
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-800">
                {evaluation?.percentage >= 80 ? 'Sentence Champion!' : 'Good Effort!'}
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                You scored <strong className="text-emerald-600 text-lg">{evaluation?.score} / {evaluation?.maxScore}</strong> blanks ({evaluation?.percentage}%)
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                Earned +{evaluation?.pointsEarned || 0} points!
              </div>
            </div>

            {/* Detailed Explanations */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Explanations:
              </h4>

              {items.map((item, idx) => {
                const itemId = item.id || idx;
                const userWords = answers[itemId] || [];
                const correctWords = item.blanks || [];
                const isItemAllCorrect = correctWords.every(
                  (target, bIdx) => (userWords[bIdx] || '').trim().toLowerCase() === target.trim().toLowerCase()
                );

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border-2 ${
                      isItemAllCorrect
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isItemAllCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-base">
                          {item.sentence.replace(/{blank}/g, `[ ${correctWords.join(' / ')} ]`)}
                        </p>

                        <div className="mt-2 text-xs text-slate-600 space-y-1">
                          <p>
                            Your answers: <span className="font-bold">{userWords.join(', ') || '(empty)'}</span>
                          </p>
                          <p>
                            Correct answers: <span className="font-bold text-emerald-700">{correctWords.join(', ')}</span>
                          </p>
                        </div>

                        {item.explanation && (
                          <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-700">
                            <strong className="text-emerald-700">Explanation: </strong>
                            {item.explanation}
                          </div>
                        )}
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
                Practice Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
