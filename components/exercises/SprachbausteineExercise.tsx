import React, { useState, useEffect } from 'react';
import { SprachbausteineExerciseData } from '../../types';
import Spinner from '../Spinner';

interface SprachbausteineExerciseProps {
  data: SprachbausteineExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const SprachbausteineExercise: React.FC<SprachbausteineExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    handleReset();
  }, [data]);
  
  const handleAnswerChange = (questionId: number, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!data || !Array.isArray(data.questions)) return;
    let correctCount = 0;
    data.questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });
    const finalScore = { correct: correctCount, total: data.questions.length };
    setScore(finalScore);
    onComplete(finalScore);
    setIsSubmitted(true);
  };

  const handleReset = () => {
      setUserAnswers({});
      setIsSubmitted(false);
      setScore(null);
  }
  
  const getSelectClasses = (questionId: number) => {
    if (!isSubmitted) return 'border-slate-400 focus:border-purple-500 focus:ring-purple-500';
    const question = data.questions.find(q => q.id === questionId);
    if (!question) return 'border-slate-400';
    const isCorrect = userAnswers[questionId] === question.answer;
    return isCorrect ? 'border-green-500 bg-green-100 dark:bg-green-900/50' : 'border-red-500 bg-red-100 dark:bg-red-900/50';
  }

  if (!data || !Array.isArray(data.questions) || !data.textWithGaps) {
    return <p className="text-red-500">Fehler: Übungsdaten sind ungültig.</p>;
  }

  return (
    <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Sprachbausteine Teil 1</h3>
        <p className="mb-6 text-slate-600 dark:text-slate-400">Lesen Sie den folgenden Text und entscheiden Sie, welches Wort (a, b oder c) in die jeweilige Lücke passt.</p>
        
        {isSubmitted && score && (
            <div className="my-6 p-4 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-center text-purple-800 dark:text-purple-200">
              <h4 className="text-2xl font-bold">Ergebnis: {score.correct} / {score.total} richtig</h4>
            </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg">
            <div className="text-lg leading-loose">
                {data.textWithGaps.split(/(\(\d+\))/g).map((part, index) => {
                    const match = part.match(/\((\d+)\)/);
                    if (match) {
                        const questionId = parseInt(match[1], 10);
                        const question = data.questions.find(q => q.id === questionId);
                        if (!question) return <span key={index}>{part}</span>;

                        return (
                            <div key={`gap-${questionId}`} className="inline-block mx-1">
                              <span className="font-bold mr-1">{question.id}.</span>
                              <select
                                value={userAnswers[question.id] || ''}
                                onChange={e => handleAnswerChange(question.id, e.target.value)}
                                disabled={isSubmitted}
                                className={`rounded border-2 p-1 bg-white dark:bg-slate-800 focus:outline-none transition-colors ${getSelectClasses(question.id)}`}
                                aria-label={`Antwort für Lücke ${question.id}`}
                              >
                                <option value="" disabled>...</option>
                                {Object.entries(question.options).map(([key, value]) => (
                                  <option key={key} value={key}>{key}) {value}</option>
                                ))}
                              </select>
                              {isSubmitted && userAnswers[question.id] !== question.answer && (
                                <span className="text-green-600 font-bold text-sm ml-1">({question.options[question.answer as 'a'|'b'|'c']})</span>
                              )}
                            </div>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </div>
        </div>

        <div className="mt-8 flex items-center space-x-4">
            {!isSubmitted && (
                <button 
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length < data.questions.length}
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
                    {data.questions.filter(q => userAnswers[q.id] !== q.answer).length > 0 ? (
                        data.questions.filter(q => userAnswers[q.id] !== q.answer).map(q => (
                            <div key={`feedback-${q.id}`} className="p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 rounded-r-lg">
                                <p className="font-bold">Lücke {q.id}:</p>
                                <p className="mt-1"><strong>Ihre Antwort:</strong> {userAnswers[q.id] ? `${userAnswers[q.id]}) ${q.options[userAnswers[q.id] as 'a'|'b'|'c']}` : 'Keine Antwort'}</p>
                                <p><strong>Richtige Antwort:</strong> {q.answer}) {q.options[q.answer as 'a'|'b'|'c']}</p>
                                <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                                  <p><strong>Erklärung:</strong> {q.explanationDE} <em className="text-slate-500">({q.explanationFR})</em></p>
                                  <p className="mt-1">💡 <strong>Tipp:</strong> {q.learningTip}</p>
                                </div>
                            </div>
                        ))
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

export default SprachbausteineExercise;