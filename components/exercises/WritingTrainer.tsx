import React, { useState } from 'react';
import { MicroExerciseType, MicroExerciseData, DetailedCorrection, MicroCorrection } from '../../types';
import { generateWritingMicroExercise, getDetailedWritingCorrection, getMicroCorrection } from '../../services/geminiService';
import Spinner from '../Spinner';

interface WritingTrainerProps {
    onBack: () => void;
}

const TRAINER_SECTIONS = [
    { 
        id: 'INFO', 
        title: 'I. Informations de base',
        content: () => (
            <div className="space-y-4 text-sm p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                 <div>
                    <h4 className="font-bold">E-Mail vs. Brief (Lettre)</h4>
                    <p>Une <strong>E-Mail</strong> est rapide et souvent moins formelle. Un <strong>Brief</strong> est plus traditionnel et souvent utilisé pour des communications officielles (contrats, administrations).</p>
                </div>
                 <div>
                    <h4 className="font-bold">Formell / Halbformell / Informell</h4>
                    <p>Le choix entre <strong>"Sie"</strong> (formel/halbformell) et <strong>"du"</strong> (informel) est crucial. "Halbformell" est poli mais plus chaleureux que "formell" (ex: "Liebe Frau Schmidt," au lieu de "Sehr geehrte Frau Schmidt,").</p>
                </div>
                 <div>
                    <h4 className="font-bold">Les 4 Points Directeurs (4 Leitpunkte)</h4>
                    <p>Dans l'examen telc B1, vous <strong>DEVEZ</strong> écrire quelque chose sur chacun des 4 points donnés dans la consigne pour obtenir tous les points de contenu.</p>
                </div>
            </div>
        )
    },
    { 
        id: 'EINSTIEG', 
        title: 'II. Einstieg zum Schreiben (Entrée en matière)',
        exercises: [
            { label: 'A. Brief oder E-Mail', type: MicroExerciseType.BRIEF_ODER_EMAIL },
            { label: 'B. Anrede und Gruß', type: MicroExerciseType.ANREDE_UND_GRUSS },
            { label: 'C. Welches Thema passt', type: MicroExerciseType.WELCHES_THEMA_PASST },
            { label: 'D. Kurze Mitteilungen', type: MicroExerciseType.KURZE_MITTEILUNGEN },
            { label: 'E. Was wollen die Schreibenden erreichen (Quel est l\'objectif)', type: MicroExerciseType.INTENTION_ERKENNEN },
            { label: 'F. Auf eine Anzeige antworten', type: MicroExerciseType.AUF_ANZEIGE_ANTWORTEN },
        ]
    },
    { 
        id: 'UEBUNGEN', 
        title: 'III. Übungen zum Schreiben (Exercices pratiques)',
        exercises: [
            { label: 'A. Persönliche E-Mails schreiben', type: MicroExerciseType.PERSOENLICHE_EMAIL },
            { label: 'B. Persönliche oder halbformelle E-Mails', type: MicroExerciseType.HALBFORMELLE_EMAIL },
            { label: 'C. Die Meinung sagen', type: MicroExerciseType.MEINUNG_SAGEN },
            { label: 'D. Zustimmen oder widersprechen', type: MicroExerciseType.ZUSTIMMEN_ODER_WIDERSPRECHEN },
            { label: 'E. Anrede und Schlussformel', type: MicroExerciseType.ANREDE_SCHLUSSFORMEL_VARIEREN },
            { label: 'F. Etwas begründen', type: MicroExerciseType.ETWAS_BEGRUENDEN },
            { label: 'G. Eine Ablehnung schreiben', type: MicroExerciseType.ABLEHNUNG_SCHREIBEN },
            { label: 'H. Eine Einladung schreiben', type: MicroExerciseType.EINLADUNG_SCHREIBEN },
        ]
    },
    { 
        id: 'TRAINING', 
        title: 'IV. Training zur Prüfung Schreiben',
        exercises: [
            { label: 'A. Training zu Aufgabe 1 (informell)', type: MicroExerciseType.TRAINING_AUFGABE_1 },
            { label: 'B. Training zu Aufgabe 2 (halbformell)', type: MicroExerciseType.TRAINING_AUFGABE_2 },
            { label: 'C. Training zu Aufgabe 3 (formell)', type: MicroExerciseType.TRAINING_AUFGABE_3 },
        ]
    }
];

const MICRO_CORRECTION_TYPES = [
    // Section II
    MicroExerciseType.KURZE_MITTEILUNGEN,
    MicroExerciseType.AUF_ANZEIGE_ANTWORTEN,
    // Section III
    MicroExerciseType.PERSOENLICHE_EMAIL,
    MicroExerciseType.HALBFORMELLE_EMAIL,
    MicroExerciseType.MEINUNG_SAGEN,
    MicroExerciseType.ZUSTIMMEN_ODER_WIDERSPRECHEN,
    MicroExerciseType.ANREDE_SCHLUSSFORMEL_VARIEREN,
    MicroExerciseType.ETWAS_BEGRUENDEN,
    MicroExerciseType.ABLEHNUNG_SCHREIBEN,
    MicroExerciseType.EINLADUNG_SCHREIBEN,
];


const WritingTrainer: React.FC<WritingTrainerProps> = ({ onBack }) => {
    const [activeExercise, setActiveExercise] = useState<{ type: MicroExerciseType, data: MicroExerciseData } | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [showSolution, setShowSolution] = useState(false);
    const [correction, setCorrection] = useState<DetailedCorrection | null>(null);
    const [microCorrection, setMicroCorrection] = useState<MicroCorrection | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingMicro, setIsCheckingMicro] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userChoice, setUserChoice] = useState<string | null>(null);
    const [isChoiceSubmitted, setIsChoiceSubmitted] = useState(false);

    const loadExercise = async (type: MicroExerciseType) => {
        setIsLoading(true);
        setError(null);
        setActiveExercise(null);
        setUserResponse('');
        setShowSolution(false);
        setCorrection(null);
        setMicroCorrection(null);
        setUserChoice(null);
        setIsChoiceSubmitted(false);
        try {
            const data = await generateWritingMicroExercise(type);
            setActiveExercise({ type, data });
        } catch (err) {
            setError("Fehler beim Laden der Übung. Bitte versuchen Sie es erneut.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCorrection = async () => {
        if (!activeExercise || !activeExercise.data.fullPrompt) return;
        setIsLoading(true);
        setError(null);
        setCorrection(null);
        try {
            const result = await getDetailedWritingCorrection(activeExercise.data.fullPrompt, userResponse);
            setCorrection(result);
        } catch(err) {
             setError("Fehler bei der Korrektur. Bitte versuchen Sie es erneut.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicroCorrection = async () => {
        if (!activeExercise || !userResponse.trim()) return;
        setIsCheckingMicro(true);
        setError(null);
        setMicroCorrection(null);
        try {
            const result = await getMicroCorrection(activeExercise.data.taskDE, userResponse);
            setMicroCorrection(result);
        } catch (err) {
            setError("Fehler bei der Korrektur. Bitte versuchen Sie es erneut.");
            console.error(err);
        } finally {
            setIsCheckingMicro(false);
        }
    };

    const isExamTask = activeExercise?.type.startsWith('TRAINING_') ?? false;
    const isQuiz = activeExercise && [
        MicroExerciseType.BRIEF_ODER_EMAIL,
        MicroExerciseType.WELCHES_THEMA_PASST,
        MicroExerciseType.INTENTION_ERKENNEN,
        MicroExerciseType.ANREDE_UND_GRUSS,
    ].includes(activeExercise.type);

    const isMicroCorrectionAvailable = activeExercise && MICRO_CORRECTION_TYPES.includes(activeExercise.type);

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="mb-4 text-sm px-3 py-1 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                ⬅️ Zurück zur Modus-Auswahl
            </button>
            <h2 className="text-2xl font-bold mb-4">✍️ Entraînement à l’écriture</h2>
            
            <div className="space-y-2">
                {TRAINER_SECTIONS.map(section => (
                    <details key={section.id} className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm" open={section.id === 'INFO'}>
                        <summary className="font-bold text-lg cursor-pointer text-orange-700 dark:text-orange-400">{section.title}</summary>
                        <div className="p-2">
                            {section.content && section.content()}
                            {section.exercises && (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                    {section.exercises.map(ex => (
                                        <li key={ex.type}>
                                            <button 
                                                onClick={() => loadExercise(ex.type)}
                                                className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-md transition-colors text-sm"
                                            >
                                                {ex.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </details>
                ))}
            </div>

            {isLoading && !activeExercise && (
                <div className="mt-6 flex justify-center items-center p-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Spinner />
                    <span className="ml-3">Übung wird geladen...</span>
                </div>
            )}

            {error && <p className="mt-6 text-center text-red-500">{error}</p>}
            
            {activeExercise && (
                <div className="mt-6 p-4 border-2 border-orange-400 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold">{activeExercise.data.promptDE}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activeExercise.data.promptFR}</p>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-md space-y-3">
                        {activeExercise.data.fullPrompt?.situation && (
                            <div className="border-b pb-3 mb-3 border-slate-200 dark:border-slate-600">
                                <h4 className="font-semibold text-slate-600 dark:text-slate-400 text-sm mb-1">Situation:</h4>
                                <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                    {activeExercise.data.fullPrompt.situation}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="font-semibold whitespace-pre-wrap">{activeExercise.data.taskDE}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{activeExercise.data.taskFR}</p>
                        </div>
                        {activeExercise.data.fullPrompt && (
                             <div>
                                <h4 className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Schreiben Sie zu folgenden Punkten:</h4>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                                    {activeExercise.data.fullPrompt.guidingPoints.map(p => <li key={p.pointDE}>{p.pointDE} <em className="text-slate-500">({p.pointFR})</em></li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    {isQuiz ? (
                        <div className="space-y-3">
                            <p className="font-semibold">Wählen Sie die richtige Antwort:</p>
                            <div className="flex flex-wrap gap-2">
                                {activeExercise.data.modelPhrases.map((phrase, i) => {
                                    const isSelected = userChoice === phrase;
                                    
                                    const correctPhrase = activeExercise.data.modelPhrases.find(p => 
                                        activeExercise.data.modelSolution.includes(`'${p}'`) || activeExercise.data.modelSolution.includes(`"${p}"`) || activeExercise.data.modelSolution.startsWith(p)
                                    );
                                    const isCorrectChoice = phrase === correctPhrase;
                                    
                                    let buttonClass = 'bg-white dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-800/50';
                                    
                                    if (isChoiceSubmitted) {
                                        if (isCorrectChoice) {
                                            buttonClass = 'bg-green-200 dark:bg-green-800 ring-2 ring-green-500';
                                        } else if (isSelected) {
                                            buttonClass = 'bg-red-200 dark:bg-red-800 ring-2 ring-red-500';
                                        } else {
                                            buttonClass = 'bg-slate-100 dark:bg-slate-700 opacity-60';
                                        }
                                    }

                                    return (
                                        <button 
                                            key={i} 
                                            onClick={() => {
                                                setUserChoice(phrase);
                                                setIsChoiceSubmitted(true);
                                            }}
                                            disabled={isChoiceSubmitted}
                                            className={`px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md transition-colors ${buttonClass}`}
                                        >
                                            {phrase}
                                        </button>
                                    );
                                })}
                            </div>
                            {isChoiceSubmitted && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg animate-fade-in mt-4">
                                    <h4 className="font-bold">Erklärung:</h4>
                                    <p className="whitespace-pre-wrap">{activeExercise.data.modelSolution}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <textarea 
                                value={userResponse}
                                onChange={e => setUserResponse(e.target.value)}
                                rows={isExamTask ? 12 : 5}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500"
                                placeholder="Schreiben Sie Ihre Antwort hier..."
                            />
                            <div>
                                <p className="text-sm font-semibold mb-2">Hilfe (Phrases-modèles) :</p>
                                <div className="flex flex-wrap gap-2">
                                    {activeExercise.data.modelPhrases.map((phrase, i) => (
                                        <button key={i} onClick={() => setUserResponse(p => `${p}${p.length > 0 ? ' ' : ''}${phrase}`)} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/70 text-sm rounded-full hover:bg-orange-200 dark:hover:bg-orange-800">
                                            "{phrase}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-600">
                        {isExamTask && (
                             <button onClick={handleCorrection} disabled={isLoading || !userResponse} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400 flex items-center gap-2">
                                {isLoading ? <Spinner /> : '🔍'} Ma correction
                            </button>
                        )}
                        {isMicroCorrectionAvailable && (
                             <button onClick={handleMicroCorrection} disabled={isCheckingMicro || !userResponse.trim()} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400 flex items-center gap-2">
                                {isCheckingMicro ? <Spinner /> : '🔍'} Ma correction
                            </button>
                        )}
                        {!isQuiz && (
                            <button onClick={() => setShowSolution(s => !s)} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                                {showSolution ? 'Lösung ausblenden 🔼' : 'Lösung anzeigen 🔽'}
                            </button>
                        )}
                        <button onClick={() => loadExercise(activeExercise.type)} disabled={isLoading} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-slate-400 flex items-center gap-2">
                           {isLoading ? <Spinner/> : '🔄'} Neues Beispiel
                        </button>
                    </div>

                    {showSolution && !isQuiz && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg animate-fade-in">
                            <h4 className="font-bold">Musterlösung:</h4>
                            <p className="whitespace-pre-wrap">{activeExercise.data.modelSolution}</p>
                        </div>
                    )}

                     {microCorrection && (
                        <div className={`p-3 rounded-lg animate-fade-in mt-4 border-l-4 ${microCorrection.isGood ? 'bg-green-50 dark:bg-green-900/40 border-green-500' : 'bg-red-50 dark:bg-red-900/40 border-red-500'}`}>
                            <h4 className="font-bold">{microCorrection.isGood ? '✅ Très bien !' : '📝 Correction'}</h4>
                            <p className="mt-1 text-sm">{microCorrection.feedbackTextFR}</p>
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                <p className="text-sm font-semibold">Exemple de réponse idéale :</p>
                                <p className="text-sm italic">"{microCorrection.correctedTextDE}"</p>
                            </div>
                        </div>
                    )}

                    {correction && isExamTask && (
                        <div className="space-y-4 pt-4 animate-fade-in">
                            <h3 className="text-xl font-bold">Ma correction</h3>
                            {/* Feedback */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                                <h4 className="font-semibold">🔹 Feedback (en français)</h4>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{correction.feedbackFR}</p>
                            </div>
                            {/* User Text Translation */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                                <h4 className="font-semibold">🔹 Traduction de votre texte</h4>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{correction.userTextTranslationFR}</p>
                            </div>
                            {/* Corrected Version */}
                            <div className="p-3 bg-green-50 dark:bg-green-900/40 rounded-lg">
                                <h4 className="font-semibold">🔹 Correction proposée (en allemand)</h4>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{correction.correctedVersionDE}</p>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default WritingTrainer;