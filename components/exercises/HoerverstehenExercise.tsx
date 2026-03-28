import React, { useState, useEffect } from 'react';
import { HoerverstehenExerciseData, Feedback } from '../../types';
import AudioPlayer from '../common/AudioPlayer';
import { getFeedbackForAnswer } from '../../services/geminiService';
import Spinner from '../Spinner';

interface HoerverstehenExerciseProps {
  data: HoerverstehenExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const HoerverstehenExercise: React.FC<HoerverstehenExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<(Feedback | null)[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  useEffect(() => {
    if (data && Array.isArray(data.questions)) {
      setUserAnswers(Array(data.questions.length).fill(''));
      setFeedback([]);
      setIsSubmitted(false);
    }
  }, [data]);


  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!data || !Array.isArray(data.questions)) return;

    setIsLoadingFeedback(true);
    let correctCount = 0;
    const feedbackPromises: Promise<Feedback | null>[] = [];

    data.questions.forEach((q, i) => {
      const isCorrect = userAnswers[i]?.toLowerCase() === q.answer.toLowerCase();
      if (isCorrect) {
        correctCount++;
        feedbackPromises.push(Promise.resolve(null));
      } else {
        const questionText = q.type === 'multiple-choice' ? `${q.question} (${q.options?.join('/')})` : q.question;
        feedbackPromises.push(getFeedbackForAnswer(questionText, userAnswers[i], q.answer));
      }
    });

    const resolvedFeedback = await Promise.all(feedbackPromises);
    setFeedback(resolvedFeedback);
    onComplete({ correct: correctCount, total: data.questions.length });
    setIsSubmitted(true);
    setIsLoadingFeedback(false);
  };

  const getResultClasses = (index: number) => {
    if (!isSubmitted) return '';
    const isCorrect = userAnswers[index]?.toLowerCase() === data.questions[index].answer.toLowerCase();
    return isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/50' : 'border-red-500 bg-red-50 dark:bg-red-900/50';
  };

  if (!data || !Array.isArray(data.questions)) {
    return <p className="text-red-500">Fehler: Übungsdaten konnten nicht geladen werden.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Hörverstehen</h3>
      <AudioPlayer text={data.audioScript} />
      
      <div className="mt-6 space-y-6">
        {data.questions.map((q, index) => (
          <div key={index} className={`p-4 border-l-4 rounded-r-lg ${getResultClasses(index)}`}>
            <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
            {q.type === 'richtig-falsch' ? (
              <div className="flex space-x-4">
                {['Richtig', 'Falsch'].map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={isSubmitted}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.isArray(q.options) && q.options.map(option => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={isSubmitted}
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
            {isSubmitted && feedback[index] && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm">
                <p><strong>Bonne réponse :</strong> {q.answer}</p>
                <p className="mt-1"><strong>Explication :</strong> {feedback[index]?.explanationDE} <em className="text-slate-500">({feedback[index]?.explanationFR})</em></p>
                <p className="mt-1">💡 <strong>Conseil :</strong> {feedback[index]?.tipDE} <em className="text-slate-500">({feedback[index]?.tipFR})</em></p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center space-x-4">
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={isLoadingFeedback || userAnswers.some(a => a === '')}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400"
          >
            {isLoadingFeedback ? <Spinner /> : 'Corriger'}
          </button>
        )}
        {isSubmitted && (
            <button
                onClick={onGenerateNew}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 disabled:bg-slate-400 flex items-center justify-center transition-colors"
            >
                {isLoading ? <Spinner /> : 'Neue Übung generieren'}
            </button>
        )}
      </div>
    </div>
  );
};

export default HoerverstehenExercise;