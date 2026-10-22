import React, { useState, useEffect } from 'react';
import { useSound } from '../../context/SoundContext';
import confetti from 'canvas-confetti';
import { Check, RotateCcw, Award, Sparkles, AlertCircle } from 'lucide-react';

export const MatchingPlayer = ({ activity, onComplete }) => {
  const { playCorrect, playWrong, playPop, playFanfare } = useSound();
  const pairs = activity.content?.pairs || [];

  // Shuffle right items once on load
  const [shuffledRights, setShuffledRights] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matches, setMatches] = useState({}); // { leftId: rightText }
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    resetGame();
  }, [activity]);

  const resetGame = () => {
    const rights = pairs.map((p) => p.right);
    // Fisher-Yates shuffle
    const shuffled = [...rights];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledRights(shuffled);
    setMatches({});
    setSelectedLeft(null);
    setSubmitted(false);
    setEvaluation(null);
  };

  const handleSelectLeft = (pair) => {
    if (submitted) return;
    playPop();
    setSelectedLeft(pair);
  };

  const handleSelectRight = (rightText) => {
    if (submitted) return;
    if (!selectedLeft) {
      playPop();
      return;
    }

    playPop();
    // Pair selectedLeft with this right item
    setMatches((prev) => ({
      ...prev,
      [selectedLeft.id || selectedLeft.left]: rightText,
    }));
    setSelectedLeft(null);
  };

  const handleRemoveMatch = (leftId) => {
    if (submitted) return;
    playPop();
    setMatches((prev) => {
      const copy = { ...prev };
      delete copy[leftId];
      return copy;
    });
  };

  const allMatched = pairs.length > 0 && Object.keys(matches).length === pairs.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await onComplete(matches);
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

  // Color mapping for matched pairs
  const pairColors = [
    'border-sky-400 bg-sky-50 text-sky-900',
    'border-purple-400 bg-purple-50 text-purple-900',
    'border-emerald-400 bg-emerald-50 text-emerald-900',
    'border-amber-400 bg-amber-50 text-amber-900',
    'border-pink-400 bg-pink-50 text-pink-900',
    'border-teal-400 bg-teal-50 text-teal-900',
  ];

  const getMatchedIndexForRight = (rightText) => {
    const entry = Object.entries(matches).find(([_, r]) => r === rightText);
    if (!entry) return -1;
    return pairs.findIndex((p) => (p.id || p.left) === entry[0]);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧩</span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display">{activity.title}</h2>
              <p className="text-indigo-100 text-xs mt-0.5">{activity.instructions}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold">
            Matched: {Object.keys(matches).length} / {pairs.length}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {!submitted ? (
          <div>
            <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <p className="text-xs md:text-sm font-semibold text-indigo-900">
                👉 <strong>How to play:</strong> Click a card on the <strong>Left</strong>, then click its partner on the <strong>Right</strong>!
              </p>
              {selectedLeft && (
                <span className="text-xs bg-orange-500 text-white font-bold px-3 py-1 rounded-full animate-pulse">
                  Now pick a match on the right!
                </span>
              )}
            </div>

            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column (Terms / Concepts) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Item / Term (Left)
                </h3>

                {pairs.map((pair, idx) => {
                  const pairKey = pair.id || pair.left;
                  const isSelected = selectedLeft?.id === pair.id || selectedLeft?.left === pair.left;
                  const matchedRight = matches[pairKey];
                  const colorClass = pairColors[idx % pairColors.length];

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectLeft(pair)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        matchedRight
                          ? colorClass
                          : isSelected
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-400 shadow-md scale-[1.02]'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-white/80 border text-slate-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-sm md:text-base">
                          {pair.left}
                        </span>
                      </div>

                      {matchedRight && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMatch(pairKey);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg bg-white/70 border"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column (Definitions / Matches) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Match / Definition (Right)
                </h3>

                {shuffledRights.map((rightText, idx) => {
                  const matchedPairIdx = getMatchedIndexForRight(rightText);
                  const isMatched = matchedPairIdx !== -1;
                  const colorClass = isMatched ? pairColors[matchedPairIdx % pairColors.length] : '';

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectRight(rightText)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isMatched
                          ? `${colorClass} opacity-95`
                          : selectedLeft
                          ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-500 hover:bg-indigo-100 hover:scale-[1.01]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-semibold text-slate-800 text-sm md:text-base">
                        {rightText}
                      </span>

                      {isMatched && (
                        <span className="w-6 h-6 rounded-full bg-white/90 text-emerald-600 flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={resetGame}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Pairs
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allMatched || submitting}
                className="kid-button-primary py-2.5 px-8 text-sm disabled:opacity-40"
              >
                {submitting ? 'Checking...' : 'Check Matches! 🚀'}
              </button>
            </div>
          </div>
        ) : (
          /* Post-submission Review & Explanations */
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-2">
                {evaluation?.percentage >= 80 ? '🌟' : '👏'}
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-800">
                {evaluation?.percentage >= 80 ? 'Super Matching Master!' : 'Good Effort!'}
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                You correctly matched <strong className="text-indigo-600 text-lg">{evaluation?.score} / {evaluation?.maxScore}</strong> pairs ({evaluation?.percentage}%)
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                Earned +{evaluation?.pointsEarned || 0} points!
              </div>
            </div>

            {/* Detailed Pair Feedback */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Explanations & Correct Pairings:
              </h4>

              {pairs.map((p, idx) => {
                const userMatch = matches[p.id || p.left];
                const isCorrect = userMatch === p.right;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 text-sm md:text-base">
                        {p.left}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? 'Correct Match ✓' : 'Incorrect Match ✗'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        Correct Match: <strong className="text-emerald-700">{p.right}</strong>
                      </p>
                      {!isCorrect && (
                        <p>
                          You chose: <span className="text-rose-600 line-through">{userMatch || 'None'}</span>
                        </p>
                      )}
                    </div>

                    {p.explanation && (
                      <p className="mt-2 text-xs text-slate-700 bg-white/70 p-2 rounded-xl border border-slate-200">
                        💡 <strong>Why:</strong> {p.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Try Again */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={resetGame}
                className="kid-button-secondary text-sm mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again for Practice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
