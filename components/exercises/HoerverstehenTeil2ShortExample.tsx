import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HoerverstehenTeil2ShortExerciseData, HoerverstehenTeil2DialogueTurn } from '../../types';
import { generateHoerverstehenTeil2ShortExercise, generateHoerverstehenTeil2Audio } from '../../services/geminiService';
import Spinner from '../Spinner';

// --- Audio Decoding Helpers (as per Gemini API guidelines) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / 1; // numChannels = 1
  const buffer = ctx.createBuffer(1, frameCount, 24000); // sampleRate = 24000

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


const buecherwurmExtract: HoerverstehenTeil2ShortExerciseData = {
    title: 'Extrait : Le club de lecture "Bücherwurm"',
    dialogue: [
        { speaker: 'Mann', text: 'Herzlich Willkommen, liebe Hörerinnen und Hörer bei Treffpunkt Radio…' },
        { speaker: 'Frau', text: '…da ich als Buchhändlerin täglich mit Menschen zusammenkomme… hab’ ich mir… überlegt, eine Bücherrunde zu organisieren…' },
        { speaker: 'Mann', text: 'Was machen Sie so in diesem Verein? Was sind die Bereiche… die Sie… abdecken?' },
        { speaker: 'Frau', text: 'Wir verstehen uns erstens als Kontaktstelle für alle Bücherliebhaber,… wo man die neuesten Informationen am Büchermarkt bekommt und wo man Gleichgesinnte kennenlernt.' },
        { speaker: 'Frau', text: 'Also Diskussionsmöglichkeiten, Erfahrungsaustausch… Bücherseminare und Vorträge von Autoren… Kindergruppe „Bücherwürmchen“… 3 bis 10 Jahre… einmal in der Woche…' },
        { speaker: 'Frau', text: 'Idee war, dass jeder… kann in den Verein eintreten…'}
    ],
    questions: [
        { 
            id: 1, 
            statement: 'Frau Schweiger hat den Verein „Bücherwurm“ gegründet, damit sich Menschen über Bücher austauschen können.',
            correctAnswer: 'Richtig',
            keywords: ['Bücherrunde organisieren', 'Erfahrungsaustausch', 'Kontaktstelle'],
            explanationDE: 'Richtig. Sie sagt, sie wollte eine "Bücherrunde organisieren" und der Verein ist eine "Kontaktstelle" für "Erfahrungsaustausch".',
            explanationFR: 'Correct. Elle dit qu\'elle voulait "organiser un cercle de lecture" et que le club est un "point de contact" pour "l\'échange d\'expériences".'
        },
        { 
            id: 2, 
            statement: 'Die Kindergruppe „Bücherwürmchen“ trifft sich zweimal pro Woche.',
            correctAnswer: 'Falsch',
            keywords: ['Kindergruppe', 'einmal in der Woche', 'zweimal'],
            explanationDE: 'Falsch. Sie sagt, die Kindergruppe trifft sich "einmal in der Woche".',
            explanationFR: 'Faux. Elle dit que le groupe d\'enfants se réunit "une fois par semaine".'
        },
        { 
            id: 3, 
            statement: 'Jeder, der sich für Bücher interessiert, kann Mitglied werden.',
            correctAnswer: 'Richtig',
            keywords: ['jeder', 'kann', 'eintreten'],
            explanationDE: 'Richtig. Sie sagt am Ende: "...jeder... kann in den Verein eintreten".',
            explanationFR: 'Correct. Elle dit à la fin : "...tout le monde... peut rejoindre le club".'
        }
    ]
};

interface HoerverstehenTeil2ShortExampleProps {
  onStartTraining: () => void;
  onBack: () => void;
}

const HoerverstehenTeil2ShortExample: React.FC<HoerverstehenTeil2ShortExampleProps> = ({ onStartTraining }) => {
    const [exercise, setExercise] = useState<HoerverstehenTeil2ShortExerciseData>(buecherwurmExtract);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [answers, setAnswers] = useState<Record<number, 'Richtig' | 'Falsch' | null>>(
        Object.fromEntries(buecherwurmExtract.questions.map(q => [q.id, null]))
    );
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const [showTranscription, setShowTranscription] = useState(false);
    const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
    const [dialogueBuffer, setDialogueBuffer] = useState<AudioBuffer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopAllAudio = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.onended = null;
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setAudioState(prev => prev === 'playing' ? 'idle' : prev);
    }, []);

    const loadExercise = useCallback(async (useStatic = false) => {
        setIsLoading(true);
        setError(null);
        setIsSubmitted(false);
        setShowTranscription(false);
        stopAllAudio();
        setDialogueBuffer(null);
        try {
            const data = useStatic ? buecherwurmExtract : await generateHoerverstehenTeil2ShortExercise();
            setExercise(data);
            setAnswers(Object.fromEntries(data.questions.map(q => [q.id, null])));
        } catch (err) {
            console.error(err);
            setError("Fehler beim Laden des Dialogs. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    }, [stopAllAudio]);
    
    useEffect(() => {
        return () => {
            stopAllAudio();
        };
    }, [stopAllAudio]);

    const playBuffer = useCallback((buffer: AudioBuffer, onEndCallback?: () => void) => {
        stopAllAudio();
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            sourceRef.current = null;
            if (onEndCallback) onEndCallback();
        };
        source.start(0);
        sourceRef.current = source;
    }, [stopAllAudio]);

    const handlePlayPause = useCallback(async () => {
        if (!exercise) return;

        if (audioState === 'playing') {
            stopAllAudio();
            return;
        }
        if (audioState === 'generating') {
            return;
        }

        if (dialogueBuffer) {
            setAudioState('playing');
            playBuffer(dialogueBuffer, () => setAudioState('idle'));
        } else {
            setAudioState('generating');
            try {
                const base64Audio = await generateHoerverstehenTeil2Audio(exercise.dialogue as HoerverstehenTeil2DialogueTurn[]);
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
                setDialogueBuffer(buffer);
                setAudioState('playing');
                playBuffer(buffer, () => setAudioState('idle'));
            } catch (err) {
                console.error(err);
                setError("Fehler bei der Audiowiedergabe.");
                setAudioState('idle');
            }
        }
    }, [audioState, dialogueBuffer, exercise, playBuffer, stopAllAudio]);


    const handleAnswer = (questionId: number, answer: 'Richtig' | 'Falsch') => {
        if (isSubmitted) return;
        setAnswers(prev => ({...prev, [questionId]: answer}));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        stopAllAudio();
    };

    const highlightKeywords = (text: string, keywords: string[]) => {
        if (!keywords || keywords.length === 0) return text;
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        return text.replace(regex, `<mark class="bg-yellow-300 dark:bg-yellow-500 rounded px-1">$1</mark>`);
    };

    const getPlayButtonContent = () => {
        switch(audioState) {
            case 'idle': return { icon: 'play', text: 'Écouter' };
            case 'generating': return { icon: 'spinner', text: 'Génère...' };
            case 'playing': return { icon: 'pause', text: 'Pause' };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">🎯 Explication courte Teil 2 – Comprendre un Dialogue</h2>
            
            <details className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <summary className="font-bold cursor-pointer">Stratégie rapide d’écoute</summary>
                <ul className="pt-2 text-sm space-y-1 list-disc list-inside">
                    <li>Lire les phrases avant d’écouter pour repérer les mots-clés.</li>
                    <li>1ère écoute : comprendre le sens global (thème, ton).</li>
                    <li>2ème écoute : vérifier les détails et les négations (nicht, kein).</li>
                    <li>Comparer avec les affirmations : ✅ = confirmé, ❌ = contredit.</li>
                </ul>
            </details>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-2">{exercise?.title || 'Mini-Exercice'}</h3>
                {isLoading && <div className="flex justify-center p-4"><Spinner /></div>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {exercise && (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-semibold mb-2">🎧 Mini-dialogue B1</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={handlePlayPause} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-slate-400">
                                    {audioState === 'generating' ? <Spinner/> : <i className={`fas fa-${getPlayButtonContent().icon}`}></i>}
                                    {getPlayButtonContent().text}
                                </button>
                                <button onClick={() => setShowTranscription(!showTranscription)} className="text-sm px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                                   {showTranscription ? 'Fermer la transcription' : '📜 Voir la transcription'}
                                </button>
                            </div>
                             {showTranscription && (
                                <div className="mt-3 p-2 bg-slate-200 dark:bg-slate-600 rounded-md text-sm space-y-1">
                                    {exercise.dialogue.map((turn, index) => <p key={index}><strong>{turn.speaker}:</strong> {turn.text}</p>)}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                        {exercise.questions.map(q => {
                            const userAnswer = answers[q.id];
                            const isCorrect = userAnswer === q.correctAnswer;
                            const statementHtml = isSubmitted ? highlightKeywords(q.statement, q.keywords) : q.statement;

                            return (
                                <div key={q.id} className={`p-3 rounded-lg ${isSubmitted ? (isCorrect ? 'bg-green-50 dark:bg-green-900/40' : 'bg-red-50 dark:bg-red-900/40') : 'bg-blue-50 dark:bg-blue-900/40'}`}>
                                   <p><strong>{q.id}.</strong> <span dangerouslySetInnerHTML={{ __html: statementHtml }}></span></p>
                                    <div className="flex gap-4 mt-2">
                                        <button 
                                            onClick={() => handleAnswer(q.id, 'Richtig')} 
                                            disabled={isSubmitted} 
                                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${!isSubmitted && userAnswer === 'Richtig' ? 'bg-blue-300 dark:bg-blue-500 ring-2 ring-blue-500' : 'bg-slate-200 dark:bg-slate-600'} ${isSubmitted ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                                        >✅ Richtig</button>
                                        <button 
                                            onClick={() => handleAnswer(q.id, 'Falsch')} 
                                            disabled={isSubmitted}
                                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${!isSubmitted && userAnswer === 'Falsch' ? 'bg-orange-300 dark:bg-orange-500 ring-2 ring-orange-500' : 'bg-slate-200 dark:bg-slate-600'} ${isSubmitted ? 'cursor-not-allowed opacity-70' : 'hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                                        >❌ Falsch</button>
                                    </div>
                                   {isSubmitted && (
                                        <div className={`mt-2 pt-2 border-t text-sm space-y-1 ${isCorrect ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'}`}>
                                            <p className="font-bold">{isCorrect ? '✅ Richtig!' : '❌ Falsch.'} La bonne réponse est : {q.correctAnswer}</p>
                                            <p><strong>Explication (DE):</strong> {q.explanationDE}</p>
                                            <p><strong>Explication (FR):</strong> {q.explanationFR}</p>
                                        </div>
                                   )}
                                </div>
                            )
                        })}
                        </div>
                        
                        {!isSubmitted && (
                            <div className="mt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!exercise || Object.values(answers).some(a => a === null)}
                                    className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    Valider les réponses
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={() => loadExercise(true)} disabled={isLoading} className="px-5 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 flex items-center gap-2">
                    🔄 Recommencer
                </button>
                <button onClick={() => loadExercise(false)} disabled={isLoading} className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-2">
                    {isLoading ? <Spinner /> : '🧩'} Nouveau dialogue
                </button>
                <button onClick={onStartTraining} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    ▶️ Passer à un exercice complet
                </button>
            </div>
        </div>
    );
};

export default HoerverstehenTeil2ShortExample;