import React, { useState, useEffect } from 'react';
import { LeseverstehenTeil2ExerciseData } from '../../types';
import Spinner from '../Spinner';

interface LeseverstehenTeil2ExerciseProps {
  data: LeseverstehenTeil2ExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const LeseverstehenTeil2Exercise: React.FC<LeseverstehenTeil2ExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  const isCompleted = data && Array.isArray(data.questions) ? Object.keys(userAnswers).length === data.questions.length : false;
  const totalQuestions = data && Array.isArray(data.questions) ? data.questions.length : 0;


  useEffect(() => {
    // When a new exercise is loaded, reset the state
    setUserAnswers({});
  }, [data]);

  useEffect(() => {
    if (isCompleted && totalQuestions > 0) {
      let correctCount = 0;
      data.questions.forEach(q => {
        if (userAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      onComplete({ correct: correctCount, total: totalQuestions });
    }
  }, [isCompleted, data, userAnswers, totalQuestions, onComplete]);


  const handleAnswerChange = (questionId: number, answer: string) => {
    if (userAnswers[questionId]) return; // Prevent changing answer
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const handleReset = () => {
      setUserAnswers({});
  }

  if (!data || !Array.isArray(data.questions) || !data.text) {
    return <p className="text-red-500">Fehler: Übungsdaten sind ungültig.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Teil 2 – Detailverstehen</h3>
      <p className="mb-4 text-slate-600 dark:text-slate-400">Lesen Sie den Text und die Aufgaben {data.questions[0]?.id}–{data.questions[totalQuestions-1]?.id}. Welche Lösung (a, b oder c) ist jeweils richtig?</p>

      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6">
        <h4 className="font-bold text-lg mb-2">Text</h4>
        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: data.text }}></div>
      </div>

      <div className="space-y-6">
        {data.questions.map(q => {
          const selectedAnswer = userAnswers[q.id];
          const isAnswered = !!selectedAnswer;
          const isCorrect = isAnswered && selectedAnswer === q.correctAnswer;
          
          return (
            <div key={q.id} className="p-4 border-l-4 rounded-r-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <p className="font-semibold mb-3">{q.id}. {q.question}</p>
              <div className="space-y-2">
                {Object.entries(q.options).map(([key, value]) => {
                  let optionClasses = 'border-slate-300 dark:border-slate-600';
                  if (isAnswered) {
                    if (key === q.correctAnswer) {
                      optionClasses = 'border-green-500 bg-green-50 dark:bg-green-900/50 ring-2 ring-green-500/50';
                    } else if (key === selectedAnswer) {
                      optionClasses = 'border-red-500 bg-red-50 dark:bg-red-900/50 ring-2 ring-red-500/50';
                    } else {
                      optionClasses = 'opacity-60';
                    }
                  }
                  return (
                    <label key={key} className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${optionClasses} ${isAnswered ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={key}
                        checked={selectedAnswer === key}
                        onChange={() => handleAnswerChange(q.id, key)}
                        disabled={isAnswered}
                        className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                        aria-label={`Option ${key}`}
                      />
                      <span><strong>{key})</strong> {value}</span>
                    </label>
                  )
                })}
              </div>
              {isAnswered && (
                <div className={`mt-3 p-3 rounded-lg text-sm animate-fade-in ${isCorrect ? 'bg-green-100 dark:bg-green-800/30' : 'bg-red-100 dark:bg-red-800/30'}`}>
                  {isCorrect ? (
                    <p><strong>✅ Richtig!</strong> {q.explanationDE} <em className="text-slate-500">({q.explanationFR})</em></p>
                  ) : (
                    <div>
                        <p><strong>❌ Falsch.</strong> Die richtige Antwort ist <strong>({q.correctAnswer})</strong>.</p>
                        <p className="mt-1">{q.explanationDE} <em className="text-slate-500">({q.explanationFR})</em></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center space-x-4">
        <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
        >
            Erneut versuchen / Recommencer
        </button>
        <button
            onClick={onGenerateNew}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400 flex items-center justify-center transition-colors"
        >
            {isLoading ? <Spinner /> : 'Neues Beispiel generieren / Générer un nouvel exercice'}
        </button>
      </div>
    </div>
  );
};

export default LeseverstehenTeil2Exercise;