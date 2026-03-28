import React, { useState, useMemo, useEffect } from 'react';
import { LeseverstehenTeil3ExerciseData } from '../../types';
import Spinner from '../Spinner';

interface LeseverstehenTeil3ExerciseProps {
  data: LeseverstehenTeil3ExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const LeseverstehenTeil3Exercise: React.FC<LeseverstehenTeil3ExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    handleReset();
  }, [data]);
  
  if (!data || !Array.isArray(data.loesungen) || !Array.isArray(data.fragen) || !Array.isArray(data.anzeigen) || !data.lernstrategie) {
    return <p className="text-red-500">Fehler: Übungsdaten sind ungültig.</p>;
  }

  const solutionsMap = useMemo(() => {
    return new Map(data.loesungen.map(s => [s.id, s]));
  }, [data.loesungen]);

  const handleAnswerChange = (questionId: number, answerLetter: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: answerLetter }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    data.fragen.forEach(frage => {
      const solution = solutionsMap.get(frage.id);
      if (solution && userAnswers[frage.id] === solution.correctAnswerLetter) {
        correctCount++;
      }
    });
    const finalScore = { correct: correctCount, total: data.fragen.length };
    setScore(finalScore);
    onComplete(finalScore);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };
  
  const getResultClasses = (frageId: number) => {
    if (!isSubmitted) return 'border-slate-300 dark:border-slate-600';
    const solution = solutionsMap.get(frageId);
    if (!solution) return 'border-slate-300 dark:border-slate-600';
    return userAnswers[frageId] === solution.correctAnswerLetter ? 'border-green-500 bg-green-50 dark:bg-green-900/50' : 'border-red-500 bg-red-50 dark:bg-red-900/50';
  };

  return (
    <div className="animate-fade-in">
        <h3 className="text-xl font-semibold mb-2">Teil 3 – Anzeigen und Situationen</h3>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 rounded-r-lg mb-6">
            <h4 className="font-bold text-lg text-blue-800 dark:text-blue-300">Lernstrategie</h4>
            <p className="mt-2"><strong>🎯 {data.lernstrategie.aufgabe}</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>{data.lernstrategie.strategie1}</li>
                <li>{data.lernstrategie.strategie2}</li>
                <li>{data.lernstrategie.strategie3}</li>
            </ul>
            <p className="mt-2 text-sm">💡 <strong>Tipp:</strong> {data.lernstrategie.tippDE} <em className="text-slate-500">({data.lernstrategie.tippFR})</em></p>
        </div>

        {isSubmitted && score && (
            <div className="my-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-center text-blue-800 dark:text-blue-200">
            <h4 className="text-2xl font-bold">Ergebnis: {score.correct} / {score.total} richtig</h4>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2">
                <h4 className="font-semibold text-lg mb-2">Anzeigen</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.anzeigen.map(anzeige => (
                        <div key={anzeige.letter} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm">
                            <p className="font-bold text-base mb-1">Anzeige {anzeige.letter.toUpperCase()}</p>
                            <p className="whitespace-pre-wrap">{anzeige.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-lg mb-4">Fragen und Situationen</h4>
            <div className="space-y-6">
                {data.fragen.map(frage => {
                    const solution = solutionsMap.get(frage.id);
                    const isCorrect = isSubmitted && solution && userAnswers[frage.id] === solution.correctAnswerLetter;
                    
                    let correctAnswerDisplay = '';
                    if (solution) {
                        correctAnswerDisplay = solution.correctAnswerLetter === 'x'
                            ? 'x) Keine Anzeige passt'
                            : solution.correctAnswerLetter.toUpperCase();
                    }

                    return (
                        <div key={frage.id} className={`p-4 border-l-4 rounded-r-lg transition-colors ${getResultClasses(frage.id)}`}>
                            <p className="font-semibold mb-2">{frage.id}. {frage.text}</p>
                            <select
                                value={userAnswers[frage.id] || ''}
                                onChange={e => handleAnswerChange(frage.id, e.target.value)}
                                disabled={isSubmitted}
                                className="w-full md:w-auto p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700"
                                aria-label={`Antwort für Frage ${frage.id}`}
                            >
                                <option value="" disabled>Anzeige auswählen...</option>
                                {data.anzeigen.map(a => <option key={a.letter} value={a.letter}>{a.letter.toUpperCase()}</option>)}
                                <option value="x">x) Keine Anzeige passt</option>
                            </select>
                            {isSubmitted && !isCorrect && solution && (
                                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm">
                                    <p><strong>Richtige Antwort:</strong> {correctAnswerDisplay}</p>
                                    <p className="mt-1"><strong>Erklärung:</strong> {solution.explanationDE} <em className="text-slate-500">({solution.explanationFR})</em></p>
                                </div>
                            )}
                            {isCorrect && solution && (
                                 <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm">
                                    <p><strong>✅ Richtig!</strong> {solution.explanationDE} <em className="text-slate-500">({solution.explanationFR})</em></p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="mt-8 flex items-center space-x-4">
            {!isSubmitted && (
            <button
                onClick={handleSubmit}
                disabled={Object.keys(userAnswers).length < data.fragen.length}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400 flex items-center justify-center transition-colors"
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
                        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400 flex items-center justify-center transition-colors"
                    >
                        {isLoading ? <Spinner /> : 'Neue Übung generieren'}
                    </button>
                </>
            )}
        </div>
    </div>
  );
};

export default LeseverstehenTeil3Exercise;