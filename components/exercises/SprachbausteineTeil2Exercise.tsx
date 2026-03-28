import React, { useState, useMemo, useEffect } from 'react';
import { SprachbausteineTeil2ExerciseData } from '../../types';
import Spinner from '../Spinner';

interface SprachbausteineTeil2ExerciseProps {
  data: SprachbausteineTeil2ExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const SprachbausteineTeil2Exercise: React.FC<SprachbausteineTeil2ExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    handleReset();
  }, [data]);

  if (!data || !Array.isArray(data.solutions) || !Array.isArray(data.wordOptions) || !data.textWithGaps) {
    return <p className="text-red-500">Fehler: Übungsdaten sind ungültig.</p>;
  }

  const solutionsMap = useMemo(() => {
    return new Map(data.solutions.map(s => [s.gapId, s]));
  }, [data.solutions]);

  const handleAnswerChange = (gapId: number, answerLetter: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [gapId]: answerLetter }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    data.solutions.forEach(solution => {
      if (userAnswers[solution.gapId] === solution.correctWordLetter) {
        correctCount++;
      }
    });
    const finalScore = { correct: correctCount, total: data.solutions.length };
    setScore(finalScore);
    onComplete(finalScore);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };
  
  const getSelectClasses = (gapId: number) => {
    if (!isSubmitted) return 'border-slate-400 focus:border-purple-500 focus:ring-purple-500';
    const solution = solutionsMap.get(gapId);
    if (!solution) return 'border-slate-400';
    const isCorrect = userAnswers[gapId] === solution.correctWordLetter;
    return isCorrect ? 'border-green-500 bg-green-100 dark:bg-green-900/50' : 'border-red-500 bg-red-100 dark:bg-red-900/50';
  }

  return (
    <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Sprachbausteine Teil 2</h3>
        <p className="mb-6 text-slate-600 dark:text-slate-400">Lesen Sie den Text und schließen Sie die Lücken 31–40. Benutzen Sie die Wörter a–o. Jedes Wort passt nur einmal.</p>
        
        {isSubmitted && score && (
            <div className="my-6 p-4 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-center text-purple-800 dark:text-purple-200">
              <h4 className="text-2xl font-bold">Ergebnis: {score.correct} / {score.total} richtig</h4>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg">
                <div className="text-lg leading-loose">
                    {data.textWithGaps.split(/(\(\d+\))/g).map((part, index) => {
                        const match = part.match(/\((\d+)\)/);
                        if (match) {
                            const gapId = parseInt(match[1], 10);
                            const solution = solutionsMap.get(gapId);
                            if (!solution) return <span key={index}>{part}</span>;
    
                            return (
                                <div key={`gap-${gapId}`} className="inline-block mx-1">
                                  <span className="font-bold mr-1">{gapId}.</span>
                                  <select
                                    value={userAnswers[gapId] || ''}
                                    onChange={e => handleAnswerChange(gapId, e.target.value)}
                                    disabled={isSubmitted}
                                    className={`rounded border-2 p-1 bg-white dark:bg-slate-800 focus:outline-none transition-colors ${getSelectClasses(gapId)}`}
                                    aria-label={`Antwort für Lücke ${gapId}`}
                                  >
                                    <option value="" disabled>...</option>
                                    {data.wordOptions.map(opt => (
                                      <option key={opt.letter} value={opt.letter}>{opt.word}</option>
                                    ))}
                                  </select>
                                  {isSubmitted && userAnswers[gapId] !== solution.correctWordLetter && (
                                    <span className="text-green-600 font-bold text-sm ml-1">({data.wordOptions.find(w => w.letter === solution.correctWordLetter)?.word})</span>
                                  )}
                                </div>
                            );
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </div>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h4 className="font-semibold mb-2">Wörter a–o:</h4>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                    {data.wordOptions.map(opt => (
                        <li key={opt.letter}>
                            <span className="font-bold">{opt.letter})</span> {opt.word} <em className="text-slate-500 dark:text-slate-400">({opt.translationFR})</em>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="mt-8 flex items-center space-x-4">
            {!isSubmitted && (
                <button 
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length < data.solutions.length}
                  className="px-8 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  Antworten überprüfen
                </button>
            )}
            {isSubmitted && (
                <>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Übung wiederholen
                    </button>
                    <button
                        onClick={onGenerateNew}
                        disabled={isLoading}
                        className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-slate-400 flex items-center justify-center transition-colors"
                    >
                        {isLoading ? <Spinner /> : 'Neue Übung generieren'}
                    </button>
                </>
            )}
        </div>

        {isSubmitted && (
            <div className="mt-8">
                <h4 className="text-lg font-semibold">Feedback:</h4>
                <div className="mt-4 space-y-4 animate-fade-in">
                    {data.solutions.filter(s => userAnswers[s.gapId] !== s.correctWordLetter).length > 0 ? (
                        data.solutions.filter(s => userAnswers[s.gapId] !== s.correctWordLetter).map(s => {
                            const userAnswerLetter = userAnswers[s.gapId];
                            const userAnswerWord = data.wordOptions.find(w => w.letter === userAnswerLetter)?.word || 'Keine Antwort';
                            const correctAnswerWord = data.wordOptions.find(w => w.letter === s.correctWordLetter)?.word;

                            return (
                                <div key={`feedback-${s.gapId}`} className="p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 rounded-r-lg">
                                    <p className="font-bold">Lücke {s.gapId}:</p>
                                    <p className="mt-1"><strong>Ihre Antwort:</strong> {userAnswerLetter ? `${userAnswerLetter}) ${userAnswerWord}` : 'Keine Antwort'}</p>
                                    <p><strong>Richtige Antwort:</strong> {s.correctWordLetter}) {correctAnswerWord}</p>
                                    <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                      <p><strong>Erklärung:</strong> {s.explanationDE} <em className="text-slate-500">({s.explanationFR})</em></p>
                                      <p className="mt-1">💡 <strong>Tipp:</strong> {s.learningTip}</p>
                                    </div>
                                </div>
                            );
                        })
                     ) : (
                         <div className="p-4 bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 rounded-r-lg">
                            <p className="font-bold text-green-800 dark:text-green-200">Perfekt! Alle Antworten sind richtig. Sehr gut gemacht!</p>
                         </div>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};

export default SprachbausteineTeil2Exercise;