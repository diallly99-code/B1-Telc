import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SchriftlicherAusdruckExerciseData, GuidingPointFeedback, LinguisticHelpData, WritingTrainerMode } from '../../types';
import { generateWritingExercise, checkWritingCoverage, generateModelWritingAnswer, generateLinguisticHelp } from '../../services/geminiService';
import Spinner from '../Spinner';
import WritingTrainer from './WritingTrainer';

const staticMarianneExercise: SchriftlicherAusdruckExerciseData = {
    subject: "Antwort an eine Freundin",
    type: 'email',
    formality: 'informal',
    situation: "Sie haben von einer Freundin folgende E-Mail erhalten:\n\nLiebe/r …,\ndanke für deine nette Einladung! Ich komme dich sehr gerne besuchen, um dein Land kennenzulernen – wie du weißt, war ich ja noch nie da. Wann wäre die beste Zeit, dich zu besuchen? Ich weiß noch nicht einmal, ob es bei euch im Sommer sehr heiß wird – allzu große Hitze mag ich nämlich nicht so sehr. Und gibt es sonst noch irgendwelche Dinge, die ich wissen sollte, bevor ich diese Reise mache?\nBitte schreib mir möglichst bald, damit ich mich gut auf die Reise vorbereiten kann.\nHerzliche Grüße,\nMarianne",
    task: "Antworten Sie auf die E-Mail und schreiben Sie etwas zu allen vier Punkten.",
    guidingPoints: [
        { pointDE: "Welche Ausflüge Sie mit Marianne machen wollen", pointFR: "quelles excursions vous voulez faire avec elle" },
        { pointDE: "Was die beste Jahreszeit für die Reise ist", pointFR: "quelle est la meilleure saison pour venir" },
        { pointDE: "Welche Kleidung sie mitnehmen soll", pointFR: "quels vêtements elle doit prendre" },
        { pointDE: "Wie sie sich am besten auf die Reise vorbereiten kann", pointFR: "comment elle peut bien préparer son voyage" }
    ]
};

const ExamMode: React.FC = () => {
  const [exercise, setExercise] = useState<SchriftlicherAusdruckExerciseData | null>(null);
  const [linguisticHelp, setLinguisticHelp] = useState<LinguisticHelpData | null>(null);
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState<GuidingPointFeedback[] | null>(null);
  const [modelAnswer, setModelAnswer] = useState<string | null>(null);
  const [showFormalityModal, setShowFormalityModal] = useState(false);
  
  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [isLoadingHelp, setIsLoadingHelp] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isGettingModel, setIsGettingModel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const loadLinguisticHelp = useCallback(async (currentExercise: SchriftlicherAusdruckExerciseData) => {
    setIsLoadingHelp(true);
    setLinguisticHelp(null);
    try {
        const help = await generateLinguisticHelp(currentExercise);
        setLinguisticHelp(help);
    } catch (err) {
        setError("Fehler beim Laden der sprachlichen Hilfe.");
        console.error(err);
    } finally {
        setIsLoadingHelp(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialExercise = async () => {
        setIsLoadingExercise(true);
        setError(null);
        setExercise(staticMarianneExercise);
        await loadLinguisticHelp(staticMarianneExercise);
        setIsLoadingExercise(false);
    };
    loadInitialExercise();
  }, [loadLinguisticHelp]);

  const handleGenerateNew = useCallback(async () => {
    setIsLoadingExercise(true);
    setError(null);
    setFeedback(null);
    setModelAnswer(null);
    setUserText('');
    setExercise(null);
    setLinguisticHelp(null);
    try {
      const newExercise = await generateWritingExercise();
      setExercise(newExercise);
      await loadLinguisticHelp(newExercise);
    } catch (err) {
      setError("Fehler beim Generieren des neuen Themas. Bitte versuchen Sie es erneut.");
      console.error(err);
    } finally {
      setIsLoadingExercise(false);
    }
  }, [loadLinguisticHelp]);

  const handleCheck = async () => {
    if (!exercise) return;
    setIsChecking(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await checkWritingCoverage(userText, exercise.guidingPoints.map(p => p.pointDE));
      setFeedback(result);
    } catch (err) {
      setError("Fehler beim Überprüfen des Textes.");
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleGetModelAnswer = async () => {
    if (!exercise) return;
    setIsGettingModel(true);
    setError(null);
    setModelAnswer(null);
    try {
        const answer = await generateModelWritingAnswer(exercise);
        setModelAnswer(answer);
    } catch (err) {
        setError("Fehler beim Generieren der Musterlösung.");
        console.error(err);
    } finally {
        setIsGettingModel(false);
    }
  };
  
  const handleHelpClick = (sentence: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = `${text.substring(0, start)}${sentence} ${text.substring(end)}`;
    setUserText(newText);
    textarea.focus();
    setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + sentence.length + 1;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-center mb-4">Examen-Modus</h3>
      {(isLoadingExercise || !exercise) ? (
        <div className="flex justify-center items-center p-8">
            <Spinner /> 
            <span className="ml-3 text-slate-500 dark:text-slate-400">Neues Thema wird geladen...</span>
        </div>
       ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Left Column: Prompt & Writing Area */}
            <div className="space-y-6">
                {/* Prompt */}
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <h3 className="font-bold text-xl">{exercise.subject} ({exercise.formality})</h3>
                    <p className="mt-2 whitespace-pre-wrap">{exercise.situation}</p>
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                        <p className="font-semibold">{exercise.task}</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            {exercise.guidingPoints.map(p => <li key={p.pointDE}>{p.pointDE} <em className="text-slate-500">({p.pointFR})</em></li>)}
                        </ul>
                    </div>
                </div>
                
                {/* Writing Area */}
                <div>
                    <label htmlFor="user-text-area" className="font-semibold block mb-2">Ihre Antwort:</label>
                    <textarea
                        ref={textareaRef}
                        id="user-text-area"
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
                        rows={15}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Schreiben Sie hier Ihren Text..."
                    />
                     <p className="text-right text-sm text-slate-500 dark:text-slate-400 mt-1">{userText.trim().split(/\s+/).filter(Boolean).length} Wörter</p>
                </div>

                {/* Action Buttons */}
                 <div className="flex flex-wrap gap-2">
                    <button onClick={handleCheck} disabled={isChecking || !userText.trim()} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400 flex items-center gap-2">
                        {isChecking ? <Spinner/> : '✅'} Antwort prüfen
                    </button>
                    <button onClick={handleGetModelAnswer} disabled={isGettingModel} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-slate-400 flex items-center gap-2">
                        {isGettingModel ? <Spinner/> : '📖'} Korrigierte Version
                    </button>
                </div>
            </div>

            {/* Right Column: Linguistic Help */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <h4 className="font-bold text-lg mb-4">Aide linguistique – Phrases-modèles cliquables</h4>
                {isLoadingHelp ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                        <span className="ml-2 text-sm text-slate-500">Lade Hilfe...</span>
                    </div>
                ) : linguisticHelp ? (
                    <div className="space-y-4 text-sm max-h-[80vh] overflow-y-auto">
                        <div>
                            <h5 className="font-semibold mb-2">Anrede</h5>
                            <div className="flex flex-wrap gap-2">{linguisticHelp.anrede.map(s => <button key={s} onClick={() => handleHelpClick(s)} className="px-3 py-1 bg-white dark:bg-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-500 shadow-sm">{s}</button>)}</div>
                        </div>
                         <div>
                            <h5 className="font-semibold mb-2">Einleitung</h5>
                            <div className="flex flex-wrap gap-2">{linguisticHelp.einleitung.map(s => <button key={s} onClick={() => handleHelpClick(s)} className="px-3 py-1 bg-white dark:bg-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-500 shadow-sm">{s}</button>)}</div>
                        </div>
                        {linguisticHelp.hauptteil.map(sec => (
                            <div key={sec.title}>
                               <h5 className="font-semibold mb-2">{sec.title}</h5>
                               <div className="flex flex-wrap gap-2">{sec.points.map(s => <button key={s} onClick={() => handleHelpClick(s)} className="px-3 py-1 bg-white dark:bg-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-500 shadow-sm">{s}</button>)}</div>
                            </div>
                        ))}
                        <div>
                            <h5 className="font-semibold mb-2">Schluss</h5>
                            <div className="flex flex-wrap gap-2">{linguisticHelp.schluss.map(s => <button key={s} onClick={() => handleHelpClick(s)} className="px-3 py-1 bg-white dark:bg-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-500 shadow-sm">{s}</button>)}</div>
                        </div>
                    </div>
                ) : <p className="text-sm text-slate-500">Keine Hilfe verfügbar.</p> }
            </div>
            
             {/* Results Section below columns */}
             <div className="lg:col-span-2 space-y-6">
                {error && <p className="text-red-500 text-center">{error}</p>}
                {feedback && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg animate-fade-in">
                        <h4 className="font-bold text-lg mb-3">Feedback zur Abdeckung der Punkte:</h4>
                        <ul className="space-y-2">
                            {feedback.map(fb => (
                                <li key={fb.point} className={`p-2 rounded-md ${fb.covered ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50'}`}>
                                    <p className="font-semibold">{fb.covered ? '✅' : '❌'} {fb.point}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 ml-6">{fb.explanation}</p>
                                    {fb.quote && <p className="text-sm text-slate-500 dark:text-slate-400 ml-6 italic">"...{fb.quote}..."</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {modelAnswer && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/40 rounded-lg animate-fade-in">
                        <h4 className="font-bold text-lg mb-2">Musterlösung (B1-Niveau):</h4>
                        <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{modelAnswer}</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
        <button onClick={handleGenerateNew} disabled={isLoadingExercise} className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-slate-400">
            {isLoadingExercise ? 'Lade...' : 'Neues Schreiben üben'}
        </button>
         <button onClick={() => setShowFormalityModal(true)} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600">
            Formell oder informell?
        </button>
      </div>

       {showFormalityModal && <FormalityModal onClose={() => setShowFormalityModal(false)} />}
    </div>
  );
};

const FormalityModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">Formell vs. Informell vs. Halbformell</h3>
                    <button onClick={onClose} className="text-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
                </div>
                <div className="space-y-4 text-sm">
                    <p>En allemand, il est crucial de choisir le bon niveau de formalité (Sie/du) selon votre interlocuteur.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/40 rounded-lg">
                            <h4 className="font-bold text-lg text-red-600 dark:text-red-400">Informell (du)</h4>
                            <p className="mt-1"><strong>Quand :</strong> Famille, amis, enfants.</p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                <li><strong>Anrede:</strong> Liebe Anna, Hallo Tom,</li>
                                <li><strong>Stil:</strong> Direct (Was machst du?), simple.</li>
                                <li><strong>Schluss:</strong> Viele Grüße, Liebe Grüße, Dein(e)...</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/40 rounded-lg">
                            <h4 className="font-bold text-lg text-yellow-600 dark:text-yellow-400">Halbformell (Sie)</h4>
                            <p className="mt-1"><strong>Quand :</strong> Voisins, collègues que vous ne connaissez pas bien, parents d'élèves.</p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                <li><strong>Anrede:</strong> Liebe Frau Schmidt, Guten Tag Herr Bauer,</li>
                                <li><strong>Stil:</strong> Poli mais amical.</li>
                                <li><strong>Schluss:</strong> Mit freundlichen Grüßen, Viele Grüße</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                            <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">Formell (Sie)</h4>
                            <p className="mt-1"><strong>Quand :</strong> Administration, inconnus, situations professionnelles.</p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                <li><strong>Anrede:</strong> Sehr geehrte Frau Schmidt, Sehr geehrte Damen und Herren,</li>
                                <li><strong>Stil:</strong> Formules de politesse, Konjunktiv II.</li>
                                <li><strong>Schluss:</strong> Mit freundlichen Grüßen</li>
                            </ul>
                        </div>
                    </div>
                </div>
                 <button onClick={onClose} className="mt-6 px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600">Fermer</button>
            </div>
        </div>
    );
};

const SchriftlicherAusdruckExercise: React.FC = () => {
    const [mode, setMode] = useState<WritingTrainerMode>('selection');

    switch (mode) {
        case 'training':
            return <WritingTrainer onBack={() => setMode('selection')} />;
        case 'exam':
            return (
              <div className="animate-fade-in">
                  <button onClick={() => setMode('selection')} className="mb-4 text-sm px-3 py-1 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                    ⬅️ Zurück zur Auswahl
                  </button>
                  <ExamMode />
              </div>
            );
        case 'selection':
        default:
            return (
                <div className="animate-fade-in text-center">
                    <h3 className="text-xl font-semibold mb-4">Wählen Sie einen Modus</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                        Commencez par l'entraînement pas à pas pour construire vos compétences, ou passez directement au mode examen pour vous tester dans les conditions réelles.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
                        <button 
                            onClick={() => setMode('training')} 
                            className="flex-1 p-8 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform border-2 border-transparent hover:border-orange-500"
                        >
                            <div className="text-5xl mb-4">✍️</div>
                            <h4 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Entraînement à l’écriture</h4>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Apprenez pas à pas avec des exercices guidés.</p>
                        </button>
                        <button 
                            onClick={() => setMode('exam')}
                            className="flex-1 p-8 bg-white dark:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all transform border-2 border-transparent hover:border-purple-500"
                        >
                             <div className="text-5xl mb-4">🚀</div>
                            <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Examen-Modus</h4>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Simulez l'épreuve d'examen complète.</p>
                        </button>
                    </div>
                </div>
            );
    }
};


export default SchriftlicherAusdruckExercise;