import React, { useState, useEffect, useCallback } from 'react';
import { MuendlicherAusdruckTeil3Data, MuendlicherAusdruckTeil3Feedback, MuendlicherAusdruckTeil3ShortHelp } from '../../types';
import { generateTextForReformulation, generateReformulationHelp, getFeedbackForReformulation, generateShortReformulationAndTips } from '../../services/geminiService';
import Spinner from '../Spinner';

const initialExercise: MuendlicherAusdruckTeil3Data = {
  theme: 'Gruppenreisen',
  authorName: 'Sabine Klostermann, 33 Jahre, Bürokauffrau',
  text: `Ich verreise gern in einer Gruppe. 
Allein reisen macht mir keinen Spaß. 
Bei Gruppenreisen kann man neue 
Leute kennen lernen und hat immer 
Gesellschaft. Außerdem ist ein Reiseführer dabei, der einem die Sehenswürdigkeiten zeigt.`
};

const MuendlicherAusdruckTeil3: React.FC = () => {
    const [exercise, setExercise] = useState<MuendlicherAusdruckTeil3Data | null>(initialExercise);
    const [userText, setUserText] = useState('');
    const [helpSentences, setHelpSentences] = useState<string[]>([]);
    const [shortHelp, setShortHelp] = useState<MuendlicherAusdruckTeil3ShortHelp | null>(null);
    const [feedback, setFeedback] = useState<MuendlicherAusdruckTeil3Feedback | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isGettingHelp, setIsGettingHelp] = useState(false);
    const [isGettingShortHelp, setIsGettingShortHelp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNewText = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setExercise(null);
        setUserText('');
        setHelpSentences([]);
        setShortHelp(null);
        setFeedback(null);
        try {
            const data = await generateTextForReformulation();
            setExercise(data);
        } catch (err) {
            setError('Fehler beim Laden des Textes. Bitte versuchen Sie es erneut.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleCheck = async () => {
        if (!exercise || !userText.trim()) return;
        setIsChecking(true);
        setFeedback(null);
        try {
            const result = await getFeedbackForReformulation(exercise.authorName, exercise.text, userText);
            setFeedback(result);
        } catch (err) {
            setError('Fehler beim Abrufen des Feedbacks.');
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleGetHelp = async () => {
        if (!exercise) return;
        setIsGettingHelp(true);
        setShortHelp(null);
        try {
            const sentences = await generateReformulationHelp(exercise.authorName, exercise.text);
            setHelpSentences(sentences);
        } catch (err) {
            setError('Fehler beim Laden der Hilfe.');
            console.error(err);
        } finally {
            setIsGettingHelp(false);
        }
    };

    const handleGetShortHelp = async () => {
        if (!exercise) return;
        setIsGettingShortHelp(true);
        setHelpSentences([]);
        try {
            const helpData = await generateShortReformulationAndTips(exercise.authorName, exercise.text);
            setShortHelp(helpData);
        } catch (err) {
            setError('Fehler beim Laden der kurzen Hilfe.');
            console.error(err);
        } finally {
            setIsGettingShortHelp(false);
        }
    };

    const handleRetry = () => {
        setUserText('');
        setFeedback(null);
        setHelpSentences([]);
        setShortHelp(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Spinner /><span className="ml-3">Neuer Text wird geladen...</span></div>;
    }
    
    if (error) {
        return <div className="text-center p-8"><p className="text-red-500 mb-4">{error}</p><button onClick={loadNewText} className="px-4 py-2 bg-red-500 text-white rounded">Erneut versuchen</button></div>;
    }

    if (!exercise) {
        return <div className="text-center p-8"><p>Kein Übungstext verfügbar.</p></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Übung: Text wiedergeben (Reformuler un texte)</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Formulieren Sie den Text mit eigenen Worten in der 3. Person (er/sie). / Reformulez le texte avec vos propres mots à la 3ᵉ personne (« il/elle »).</p>
            </div>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Thème: {exercise.theme}</p>
                <h3 className="font-semibold text-lg mt-1">Originaltext von {exercise.authorName}</h3>
                <p className="mt-2 italic text-slate-800 dark:text-slate-200 whitespace-pre-wrap">"{exercise.text}"</p>
            </div>

            <div>
                <label htmlFor="reformulation-input" className="font-semibold block mb-2">Ihre Reformulierung:</label>
                <textarea
                    id="reformulation-input"
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    rows={5}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="Beginnen Sie zu schreiben..."
                />
            </div>

            {feedback && (
                <div className={`p-4 rounded-lg animate-fade-in ${feedback.isCorrect ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : 'bg-red-100 dark:bg-red-900/50 border-red-500'} border-l-4`}>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                        {feedback.isCorrect ? '✅ Richtig' : '❌ Falsch'}
                    </h4>
                    <p className="mt-1">{feedback.feedbackDE}</p>
                    <p className="text-sm text-slate-500"><em>({feedback.feedbackFR})</em></p>
                </div>
            )}

            <div>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handleGetHelp} disabled={isGettingHelp} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400">
                        {isGettingHelp ? <Spinner /> : '💡'} Hilfe zeigen
                    </button>
                    <button onClick={handleGetShortHelp} disabled={isGettingShortHelp} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 disabled:bg-slate-400">
                        {isGettingShortHelp ? <Spinner /> : '✍️'} Version réformulé courte
                    </button>
                </div>

                {helpSentences.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-2 animate-fade-in">
                        <p className="text-sm font-semibold">Klicken Sie auf einen Satz, um ihn hinzuzufügen:</p>
                        {helpSentences.map((s, i) => (
                             <button key={i} onClick={() => setUserText(prev => `${prev}${prev ? ' ' : ''}${s}`)} className="block w-full text-left p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md text-sm transition-colors">
                                "{s}"
                            </button>
                        ))}
                    </div>
                )}
                {shortHelp && (
                    <div className="mt-3 p-4 bg-teal-50 dark:bg-teal-900/50 rounded-lg space-y-3 animate-fade-in border-l-4 border-teal-400">
                        <div>
                            <h5 className="font-bold text-teal-800 dark:text-teal-200">Exemple de reformulation courte :</h5>
                            <p className="mt-1 italic">"{shortHelp.example}"</p>
                        </div>
                        <div>
                            <h5 className="font-bold text-teal-800 dark:text-teal-200">Comment faire :</h5>
                            <p className="mt-1">{shortHelp.explanationDE}</p>
                            <p className="text-sm text-slate-500"><em>({shortHelp.explanationFR})</em></p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
                <button
                    onClick={handleCheck}
                    disabled={isChecking || !userText.trim()}
                    className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:bg-slate-400 flex items-center justify-center"
                >
                    {isChecking ? <Spinner /> : 'Überprüfen'}
                </button>
                <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 flex items-center justify-center"
                >
                    Wiederholen
                </button>
                <button
                    onClick={loadNewText}
                    className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 flex items-center justify-center"
                >
                    Neuen Text generieren
                </button>
            </div>
        </div>
    );
};

export default MuendlicherAusdruckTeil3;