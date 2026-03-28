import React, { useState, useCallback, useEffect } from 'react';
import { GRAMMATIK_PUNKTE } from '../../constants';
import { STATIC_GRAMMAR_DATA } from './grammatikData';
import { GrammatikPunkt, GrammatikExerciseData, GrammatikExerciseContent, Score } from '../../types';
import { generateGrammarExercise } from '../../services/geminiService';
import Spinner from '../Spinner';

interface GrammatikExerciseProps {
    addScore: (score: Score) => void;
}

const ActiveExerciseView: React.FC<{
    punkt: GrammatikPunkt,
    initialExercise: GrammatikExerciseData,
    onClose: () => void,
    addScore: (score: Score) => void;
}> = ({ punkt, initialExercise, onClose, addScore }) => {
    const [exercise, setExercise] = useState<GrammatikExerciseData>(initialExercise);
    const [isLoadingNew, setIsLoadingNew] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});
    const [showRule, setShowRule] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    useEffect(() => {
        // Reset state when a new exercise set is loaded
        setExercise(initialExercise);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setIsSubmitted({});
        setIsFinished(false);
    }, [initialExercise]);

    const currentQuestion = exercise.content[currentQuestionIndex];
    const isQCM = exercise.exercise_type === 'QCM';
    const isFillIn = exercise.exercise_type === 'Texte à trous';
    const isReformulation = exercise.exercise_type === 'Reformulation';

    const handleAnswerSubmit = () => {
        setIsSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < exercise.content.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of exercise set
            const correctCount = exercise.content.reduce((count, q, index) => {
                 const isCorrect = userAnswers[index]?.trim().toLowerCase() === q.answer.trim().toLowerCase();
                 return isCorrect ? count + 1 : count;
            }, 0);
            addScore({ correct: correctCount, total: exercise.content.length, date: new Date().toISOString() });
            setIsFinished(true);
        }
    };

    const handleRegenerate = async () => {
        setIsLoadingNew(true);
        try {
            const newExercise = await generateGrammarExercise(punkt);
            setExercise(newExercise);
            setCurrentQuestionIndex(0);
            setUserAnswers({});
            setIsSubmitted({});
            setIsFinished(false);
        } catch (error) {
            console.error("Failed to generate new exercise", error);
        } finally {
            setIsLoadingNew(false);
        }
    };

    const getFeedbackUI = (content: GrammatikExerciseContent, index: number) => {
        if (!isSubmitted[index]) return null;
        const isCorrect = userAnswers[index]?.trim().toLowerCase() === content.answer.trim().toLowerCase();
        
        return (
            <div className={`mt-3 p-3 rounded-lg animate-fade-in border-l-4 ${isCorrect ? 'bg-green-50 dark:bg-green-900/40 border-green-500' : 'bg-red-50 dark:bg-red-900/40 border-red-500'}`}>
                <h4 className="font-bold">{isCorrect ? '✅ Richtig!' : '❌ Falsch.'}</h4>
                {!isCorrect && <p className="text-sm"><strong>Richtige Antwort:</strong> {content.answer}</p>}
                <p className="text-sm mt-1">{content.explanation}</p>
            </div>
        );
    }

    return (
        <div className="mt-4 p-4 border-2 border-yellow-400 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">{punkt.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exercise.objective}</p>
                </div>
                <button onClick={onClose} className="text-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Fermer">&times;</button>
            </div>

            {isFinished ? (
                 <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-inner text-center">
                    <h4 className="text-xl font-bold mb-2">🎉 Übung abgeschlossen!</h4>
                    <p>Vous avez terminé cette série de 10 questions.</p>
                    <button onClick={handleRegenerate} disabled={isLoadingNew} className="mt-4 px-5 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-slate-400 flex items-center justify-center mx-auto gap-2">
                        {isLoadingNew ? <Spinner/> : '🆕'} Encore des exercices
                    </button>
                 </div>
            ) : (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                        <p className="font-semibold text-slate-600 dark:text-slate-400">Frage {currentQuestionIndex + 1} / {exercise.content.length}</p>
                        <button onClick={() => setShowRule(!showRule)} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">
                        {showRule ? 'Cacher' : 'Afficher'} la règle
                        </button>
                    </div>

                    {showRule && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/40 rounded-md text-sm animate-fade-in">
                            <h4 className='font-bold text-base mb-2'>💡 Règle de grammaire</h4>
                            <p className="whitespace-pre-wrap">{punkt.explanation}</p>
                        </div>
                    )}
                    
                    <p className="mb-4 text-lg">{currentQuestion.question.replace('___', '______')}</p>

                    {isQCM && currentQuestion.options && (
                        <div className="space-y-2">
                            {currentQuestion.options.map((option, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setUserAnswers(prev => ({...prev, [currentQuestionIndex]: option}))}
                                    disabled={isSubmitted[currentQuestionIndex]}
                                    className={`w-full text-left p-3 border rounded-md transition-colors ${userAnswers[currentQuestionIndex] === option ? 'bg-yellow-200 dark:bg-yellow-800 ring-2 ring-yellow-500' : 'bg-white dark:bg-slate-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/50'}`}
                                >
                                    {String.fromCharCode(97 + i)}) {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {(isFillIn || isReformulation) && (
                        <input
                            type="text"
                            value={userAnswers[currentQuestionIndex] || ''}
                            onChange={e => setUserAnswers(prev => ({...prev, [currentQuestionIndex]: e.target.value}))}
                            disabled={isSubmitted[currentQuestionIndex]}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                            placeholder="Ihre Antwort..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && userAnswers[currentQuestionIndex] && !isSubmitted[currentQuestionIndex]) {
                                    handleAnswerSubmit();
                                }
                            }}
                        />
                    )}
                    
                    {getFeedbackUI(currentQuestion, currentQuestionIndex)}

                    <div className="flex justify-end gap-3 mt-4">
                        {!isSubmitted[currentQuestionIndex] ? (
                            <button onClick={handleAnswerSubmit} disabled={!userAnswers[currentQuestionIndex]} className="px-5 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-slate-400">
                                Überprüfen
                            </button>
                        ) : (
                            <button onClick={handleNext} className="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600">
                                Weiter ➡️
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const GrammatikExercise: React.FC<GrammatikExerciseProps> = ({ addScore }) => {
    const [activePunkt, setActivePunkt] = useState<GrammatikPunkt | null>(null);

    const handleSelectPunkt = useCallback((punkt: GrammatikPunkt) => {
        setActivePunkt(punkt);
    }, []);

    const handleCloseExercise = () => {
        setActivePunkt(null);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">A Selbsttest A2 – Grammaire</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">Choisissez un point grammatical, entraînez-vous avec 10 exercices interactifs, et générez-en plus si vous le souhaitez.</p>

            {activePunkt ? (
                 <ActiveExerciseView 
                    punkt={activePunkt}
                    initialExercise={STATIC_GRAMMAR_DATA[activePunkt.id]}
                    onClose={handleCloseExercise}
                    addScore={addScore}
                 />
            ) : (
                <div className="space-y-2">
                    {GRAMMATIK_PUNKTE.map(punkt => (
                        <div key={punkt.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-300">
                                    {punkt.id}. {punkt.title}
                                </h3>
                                <button
                                    onClick={() => handleSelectPunkt(punkt)}
                                    className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 text-sm"
                                >
                                    Übung starten
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GrammatikExercise;
