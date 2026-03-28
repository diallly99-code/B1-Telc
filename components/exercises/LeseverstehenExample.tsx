import React, { useState, useMemo } from 'react';
import Spinner from '../Spinner';
import { LeseverstehenMiniExercise } from '../../types';
import { generateMiniLeseverstehenExercises } from '../../services/geminiService';


interface LeseverstehenExampleProps {
  onStartTraining: () => void;
  isLoading: boolean;
  onBack: () => void;
}

const initialExercises: LeseverstehenMiniExercise[] = [
  {
    id: 1,
    text: 'Anna liest jeden Abend ein Buch, bevor sie schlafen geht. Aber seit ein paar Wochen schläft sie sehr schlecht und sucht nach Tipps.',
    options: [
      { letter: 'a', title: 'Ein neues Buch über Schlafprobleme' },
      { letter: 'b', title: 'Eine Reise mit der Bahn' },
      { letter: 'c', title: 'Computer spielen am Abend' },
    ],
    correctAnswer: 'a',
    feedback: 'Wichtige Wörter = „schläft schlecht“, „Tipps“.',
  },
  {
    id: 2,
    text: 'Immer mehr Menschen fahren in den Ferien mit dem Fahrrad. Viele kombinieren das Rad mit der Bahn.',
    options: [
      { letter: 'a', title: 'Urlaub mit dem Fahrrad wird beliebter' },
      { letter: 'b', title: 'Hilfe bei Schlafproblemen' },
      { letter: 'c', title: 'Frauen lieben Computer' },
    ],
    correctAnswer: 'a',
    feedback: 'Wichtige Wörter = „Ferien“, „Fahrrad“, „Bahn“.',
  },
  {
    id: 3,
    text: 'Thomas ist 17 Jahre alt. Er spielt gern Computerspiele und schreibt Texte am PC.',
    options: [
      { letter: 'a', title: 'Jugendliche lieben den Computer' },
      { letter: 'b', title: 'Familien fahren mit der Bahn' },
      { letter: 'c', title: 'Tipps zum besseren Schlaf' },
    ],
    correctAnswer: 'a',
    feedback: 'Wichtige Wörter = „17 Jahre“, „Computerspiele“.',
  },
  {
    id: 4,
    text: 'Ab Oktober gibt es bei der Bahn ein neues Ticket: Familien fahren viel billiger, wenn Kinder oder Enkel mitreisen.',
    options: [
        { letter: 'a', title: 'Familien reisen billiger' },
        { letter: 'b', title: 'Jugendliche am Computer' },
        { letter: 'c', title: 'Neues Medikament gegen Schlaflosigkeit' },
    ],
    correctAnswer: 'a',
    feedback: 'Wichtige Wörter = „Familien“, „billiger“, „Kinder“.',
  },
  {
    id: 5,
    text: 'Viele Urlauber interessieren sich für Kultur. Jüngere Touristen besuchen gern Museen, während manche ältere lieber eine Pause machen.',
    options: [
        { letter: 'a', title: 'Kultur im Urlaub: Interessen je nach Alter unterschiedlich' },
        { letter: 'b', title: 'Computer – Hobby für junge Männer' },
        { letter: 'c', title: 'Tipps für besseres Schlafen' },
    ],
    correctAnswer: 'a',
    feedback: 'Wichtige Wörter = „Urlauber“, „Kultur“, „Alter“.',
  }
];

const LeseverstehenExample: React.FC<LeseverstehenExampleProps> = ({ onStartTraining, isLoading, onBack }) => {
  const [exercises, setExercises] = useState(initialExercises);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const currentExercise = exercises[currentExIndex];
  const isCorrect = selectedAnswer === currentExercise.correctAnswer;

  const highlightedText = useMemo(() => {
    if (!isSubmitted || isCorrect) {
      return `"${currentExercise.text}"`;
    }

    // This regex will find keywords enclosed in German quotes „...“, standard double quotes "...", or single quotes '...'.
    const keywordRegex = /„(.+?)“|'(.+?)'|"(.+?)"/g;
    const keywordMatches = [...currentExercise.feedback.matchAll(keywordRegex)];

    if (keywordMatches.length === 0) {
      return `"${currentExercise.text}"`;
    }

    const keywords = keywordMatches
      .map(match => {
        // The captured keyword will be in one of the three groups.
        const keyword = match[1] || match[2] || match[3];
        if (!keyword) return null;
        // Escape any special regex characters within the keyword itself.
        return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .filter((k): k is string => k !== null);

    if (keywords.length === 0) {
      return `"${currentExercise.text}"`;
    }

    const highlightRegex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const highlighted = currentExercise.text.replace(highlightRegex, `<mark class="bg-yellow-300 dark:bg-yellow-600 rounded px-1 py-0.5">$1</mark>`);
    
    return `"${highlighted}"`;
  }, [currentExercise, isSubmitted, isCorrect]);


  const handleSelectAnswer = (letter: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(letter);
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  };

  const handleNext = () => {
    setCurrentExIndex((prev) => (prev + 1) % exercises.length);
    handleRetry();
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const newExercises = await generateMiniLeseverstehenExercises();
      setExercises(newExercises);
      setCurrentExIndex(0);
      handleRetry();
    } catch (error) {
      setGenerationError("Fehler beim Generieren neuer Übungen. Bitte versuchen Sie es erneut.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonClass = (letter: string) => {
    if (!isSubmitted) {
      return 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700';
    }
    if (letter === selectedAnswer) {
      return isCorrect ? 'bg-green-100 dark:bg-green-900 border-green-500 ring-2 ring-green-500' : 'bg-red-100 dark:bg-red-900 border-red-500 ring-2 ring-red-500';
    }
    if (letter === currentExercise.correctAnswer) {
        return 'bg-green-100 dark:bg-green-900 border-green-500';
    }
    return 'bg-white dark:bg-slate-800 opacity-60';
  };

  return (
    <div className="space-y-8">
        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">Explication Leseverstehen</h3>
            <p className="mb-2"><strong>🎯 Objectif :</strong> Comprendre le thème principal d'un texte (Globalverstehen) ou trouver des informations spécifiques (Detailverstehen).</p>
            <p><em className="text-slate-600 dark:text-slate-400">Votre première tâche est de vous entraîner à trouver le thème principal avec ces mini-exercices.</em></p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-md bg-white dark:bg-slate-800">
            <h4 className="font-bold text-lg mb-2">Mini-Übung ({currentExIndex + 1}/{exercises.length})</h4>
            <p 
              className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-md italic" 
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            ></p>

            <div className="space-y-2 mb-4">
                {currentExercise.options.map(option => (
                    <button
                        key={option.letter}
                        onClick={() => handleSelectAnswer(option.letter)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3 border rounded-md transition-all duration-300 ${getButtonClass(option.letter)}`}
                    >
                       <strong>{option.letter})</strong> {option.title}
                    </button>
                ))}
            </div>

            {isSubmitted && (
                <div className={`p-3 rounded-md animate-fade-in ${isCorrect ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                    {isCorrect ? (
                        <p><strong>Super, genau richtig!</strong> Le texte parle bien de ce sujet.</p>
                    ) : (
                        <div>
                           <p><strong>Pas tout à fait.</strong> La bonne réponse est <strong>({currentExercise.correctAnswer})</strong>.</p>
                           <p className="mt-1"><strong>Pourquoi ?</strong> {currentExercise.feedback}</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={handleRetry} className="px-5 py-2 bg-gray-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                🔄 Noch einmal üben
            </button>
            <button onClick={handleNext} className="px-5 py-2 bg-gray-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                ➕ Nächster Versuch
            </button>
             <button onClick={handleGenerateNew} disabled={isGenerating} className="px-5 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:bg-slate-400 flex items-center">
                {isGenerating ? <Spinner /> : '🤖 Neue Mini-Übungen generieren'}
            </button>
        </div>
        
        {generationError && <p className="text-center text-red-500 mt-4">{generationError}</p>}

        <div className="text-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-lg font-semibold mb-4">Prêt(e) à passer aux vrais exercices ?</p>
            <button
              onClick={onStartTraining}
              disabled={isLoading}
              className="px-8 py-4 rounded-lg font-bold text-white transition-colors duration-300 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-xl"
            >
              {isLoading ? <Spinner /> : '▶️ Weiter zu den echten Übungen'}
            </button>
        </div>
    </div>
  );
};

export default LeseverstehenExample;