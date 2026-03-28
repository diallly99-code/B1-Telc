import React, { useState, useEffect } from 'react';
import { LeseverstehenExerciseData, Feedback } from '../../types';
import { getFeedbackForLeseverstehen } from '../../services/geminiService';
import Spinner from '../Spinner';

interface LeseverstehenExerciseProps {
  data: LeseverstehenExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const LeseverstehenExercise: React.FC<LeseverstehenExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, Feedback | null>>({});
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    handleReset();
  }, [data]);

  const handleAnswerChange = (textId: number, headingLetter: string) => {
    setUserAnswers(prev => ({ ...prev, [textId]: headingLetter }));
  };
  
  const handleReset = () => {
      setUserAnswers({});
      setIsSubmitted(false);
      setFeedback({});
      setScore(null);
  }

  const handleSubmit = async () => {
    if (!data || !Array.isArray(data.texts) || !data.answers) return;
    
    setIsLoadingFeedback(true);
    let correctCount = 0;
    const feedbackPromises: Promise<void>[] = [];
    const newFeedback: Record<string, Feedback | null> = {};

    data.texts.forEach(text => {
      const textIdStr = text.id.toString();
      const isCorrect = userAnswers[textIdStr] === data.answers[textIdStr];
      if (isCorrect) {
        correctCount++;
        newFeedback[textIdStr] = null;
      } else {
        const userHeading = data.headings.find(h => h.letter === userAnswers[textIdStr])?.title || "Aucune réponse";
        const correctHeading = data.headings.find(h => h.letter === data.answers[textIdStr])?.title || "";

        feedbackPromises.push(
          getFeedbackForLeseverstehen(text.content, userHeading, correctHeading)
            .then(fb => {
              newFeedback[textIdStr] = fb;
            })
            .catch(err => {
              console.error(`Failed to get feedback for text ${text.id}`, err);
              newFeedback[textIdStr] = { 
                  explanationDE: "Fehler beim Laden des Feedbacks.", 
                  explanationFR: "Erreur lors du chargement du feedback.",
                  tipDE: "Bitte versuchen Sie es später noch einmal.",
                  tipFR: "Veuillez réessayer plus tard." 
              };
            })
        );
      }
    });

    await Promise.all(feedbackPromises);
    
    setFeedback(newFeedback);
    const finalScore = { correct: correctCount, total: data.texts.length };
    setScore(finalScore);
    onComplete(finalScore);
    setIsSubmitted(true);
    setIsLoadingFeedback(false);
  };

  const getResultClasses = (textId: number) => {
    if (!isSubmitted) return 'border-slate-300 dark:border-slate-600';
    const textIdStr = textId.toString();
    return userAnswers[textIdStr] === data.answers[textIdStr] ? 'border-green-500 bg-green-50 dark:bg-green-900/50' : 'border-red-500 bg-red-50 dark:bg-red-900/50';
  };

  if (!data || !Array.isArray(data.texts) || !Array.isArray(data.headings) || !data.answers) {
    return <p className="text-red-500">Fehler: Übungsdaten sind ungültig.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Teil 1 – Globalverstehen</h3>
      <p className="mb-6 text-slate-600 dark:text-slate-400">Lesen Sie die Überschriften a–j und die Texte 1–5. Finden Sie für jeden Text die passende Überschrift. Sie können jede Überschrift nur einmal benutzen. Markieren Sie Ihre Lösungen, indem Sie die passende Überschrift unter jedem Text auswählen.</p>

      {isSubmitted && score && (
        <div className="my-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-center text-blue-800 dark:text-blue-200">
          <h4 className="text-2xl font-bold">Ergebnis: {score.correct} / {score.total} richtig</h4>
        </div>
      )}

      <div className="space-y-8">
        {data.texts.map(text => {
          const textIdStr = text.id.toString();
          return (
            <div key={text.id} className={`p-4 border-l-4 rounded-r-lg ${getResultClasses(text.id)} transition-colors duration-300`}>
                <h5 className="font-bold mb-2">Text {text.id}</h5>
                <p className="text-slate-700 dark:text-slate-300 mb-4">{text.content}</p>
                
                <div className="w-full">
                  <label htmlFor={`select-${text.id}`} className="font-semibold block mb-2 text-slate-800 dark:text-slate-200">Passende Überschrift auswählen:</label>
                  <select
                    id={`select-${text.id}`}
                    value={userAnswers[textIdStr] || ''}
                    onChange={(e) => handleAnswerChange(text.id, e.target.value)}
                    disabled={isSubmitted}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700"
                    aria-label={`Überschrift für Text ${text.id}`}
                  >
                    <option value="" disabled>Wählen...</option>
                    {data.headings.map(h => (
                      <option key={h.letter} value={h.letter}>
                        {h.letter}) {h.title}
                      </option>
                    ))}
                  </select>
                </div>
              
              {isSubmitted && userAnswers[textIdStr] !== data.answers[textIdStr] && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm">
                  <p><strong>Bonne réponse :</strong> {data.answers[textIdStr]}) {data.headings.find(h => h.letter === data.answers[textIdStr])?.title}</p>
                  {feedback[textIdStr] ? (
                    <>
                      <p className="mt-2"><strong>Explication :</strong> {feedback[textIdStr]?.explanationDE} <em className="text-slate-500">({feedback[textIdStr]?.explanationFR})</em></p>
                      <p className="mt-2">💡 <strong>Conseil :</strong> {feedback[textIdStr]?.tipDE} <em className="text-slate-500">({feedback[textIdStr]?.tipFR})</em></p>
                    </>
                  ) : <div className="flex items-center mt-2 text-slate-700 dark:text-slate-300"><Spinner /> <span className="ml-2">Feedback wird geladen...</span></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center space-x-4">
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={isLoadingFeedback || Object.keys(userAnswers).length < data.texts.length}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400 flex items-center justify-center transition-colors"
          >
            {isLoadingFeedback ? <Spinner /> : 'Antworten überprüfen'}
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

export default LeseverstehenExercise;