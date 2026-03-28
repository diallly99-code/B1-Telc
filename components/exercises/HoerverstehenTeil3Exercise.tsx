import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { HoerverstehenTeil3ExerciseData } from '../../types';
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

interface HoerverstehenTeil3ExerciseProps {
  data: HoerverstehenTeil3ExerciseData;
  onComplete: (score: { correct: number; total: number }) => void;
  onGenerateNew: () => void;
  isLoading: boolean;
}

const LearningGuide: React.FC = () => (
    <details className="mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
        <summary className="font-bold text-lg cursor-pointer text-green-700 dark:text-green-400">🧭 Guide d’apprentissage et Stratégie (Teil 3)</summary>
        <div className="mt-4 space-y-4 text-sm">
            <div>
                <h4 className="font-semibold">🔑 Mots-clés typiques à repérer</h4>
                <ul className="list-disc list-inside ml-4 mt-1 text-slate-600 dark:text-slate-300">
                    <li><strong>Ort / Richtung :</strong> Bahnhof, Straße, Kreuzung, gegenüber</li>
                    <li><strong>Zeit / Uhrzeit :</strong> 18 Uhr 30, Montag, Nachmittag</li>
                    <li><strong>Themen :</strong> Film, Wetter, Reise, Verkauf, Zug, Stadt</li>
                    <li><strong>Hinweise :</strong> Rabatt, Temperatur, Richtung, Angebot, Preis</li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold">💡 Stratégie d’écoute (Telc B1 Teil 3)</h4>
                <ol className="list-decimal list-inside ml-4 mt-1 text-slate-600 dark:text-slate-300 space-y-1">
                    <li><strong>Lis les 5 affirmations avant d’écouter</strong> – prépare ton cerveau à chercher les bons mots-clés.</li>
                    <li><strong>Écoute une première fois :</strong> comprends le thème général de chaque court texte.</li>
                    <li><strong>Écoute une deuxième fois :</strong> repère les détails précis (noms, chiffres, lieux).</li>
                    <li><strong>Compare les affirmations</strong> avec ce que tu entends : si le texte confirme → ✅ Richtig, s’il contredit → ❌ Falsch.</li>
                    <li>Fais attention aux <strong>mots piégeux :</strong> nicht, kein, geschlossen, aber, später, nur, gegenüber, bis.</li>
                </ol>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-md border border-green-200 dark:border-green-700">
                <h4 className="font-semibold">🎯 Astuce examen Telc B1</h4>
                <p className="mt-1 text-slate-700 dark:text-slate-200">
                    ⚠️ Les textes de Teil 3 sont courts mais rapides : tu dois identifier le sujet principal et un détail clé (lieu, prix, température, heure). Ne cherche pas à tout comprendre mot à mot — écoute globalement et repère les indices directs.
                </p>
            </div>
        </div>
    </details>
);

const HoerverstehenTeil3Exercise: React.FC<HoerverstehenTeil3ExerciseProps> = ({ data, onComplete, onGenerateNew, isLoading }) => {
    const [answers, setAnswers] = useState<Record<number, 'Richtig' | 'Falsch' | null>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [audioStates, setAudioStates] = useState<Record<number, { status: 'idle' | 'loading' | 'playing' }>>({});
    const [showTranscriptions, setShowTranscriptions] = useState<Record<number, boolean>>({});
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const initializeStates = useCallback(() => {
        const initialAudioStates: Record<number, { status: 'idle' }> = {};
        const initialAnswers: Record<number, null> = {};
        const initialTranscriptions: Record<number, boolean> = {};
        data.questions.forEach(q => {
            initialAudioStates[q.id] = { status: 'idle' };
            initialAnswers[q.id] = null;
            initialTranscriptions[q.id] = false;
        });
        setAudioStates(initialAudioStates);
        setAnswers(initialAnswers);
        setShowTranscriptions(initialTranscriptions);
        setIsSubmitted(false);
    }, [data]);

    useEffect(() => {
        initializeStates();
    }, [data, initializeStates]);

    const stopAllAudio = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.onended = null;
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setAudioStates(prev => {
            const newStates = { ...prev };
            Object.keys(newStates).forEach(key => {
                const id = parseInt(key);
                if (newStates[id]?.status === 'playing') {
                    newStates[id] = { status: 'idle' };
                }
            });
            return newStates;
        });
    }, []);

    useEffect(() => {
        return () => stopAllAudio();
    }, [stopAllAudio]);

    const handleTogglePlay = useCallback(async (questionId: number, text: string, gender: 'female' | 'male' = 'female') => {
        const currentState = audioStates[questionId]?.status;

        if (currentState === 'loading') return;
        if (currentState === 'playing') {
            stopAllAudio();
            return;
        }

        stopAllAudio();
        setAudioStates(prev => ({ ...prev, [questionId]: { status: 'loading' } }));

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const context = audioContextRef.current;
            
            const ai = new GoogleGenAI({ apiKey: import.meta.env?.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || 'missing_key' });
            const maleVoices = ['Kore', 'Orus', 'Charon'];
            const femaleVoices = ['Puck', 'Leda', 'Callirrhoe'];
            const voiceName = gender === 'female' 
                ? femaleVoices[questionId % femaleVoices.length] 
                : maleVoices[questionId % maleVoices.length];

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text.replace(/\bICE\b/g, 'I C E') }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("Keine Audiodaten von der API erhalten.");
            
            const buffer = await decodeAudioData(decode(base64Audio), context);
            const source = context.createBufferSource();
            source.buffer = buffer;
            source.connect(context.destination);
            source.onended = () => {
                setAudioStates(prev => ({ ...prev, [questionId]: { status: 'idle' } }));
                sourceRef.current = null;
            };
            
            source.start(0);
            sourceRef.current = source;
            setAudioStates(prev => ({ ...prev, [questionId]: { status: 'playing' } }));

        } catch (error) {
            console.error("Fehler bei der Audiowiedergabe:", error);
            setAudioStates(prev => ({ ...prev, [questionId]: { status: 'idle' } }));
        }
    }, [audioStates, stopAllAudio]);

    const handleAnswerChange = (id: number, answer: 'Richtig' | 'Falsch') => {
        if (isSubmitted) return;
        setAnswers(prev => ({ ...prev, [id]: answer }));
    };

    const handleSubmit = () => {
        stopAllAudio();
        setIsSubmitted(true);
        const correctCount = data.questions.filter(q => answers[q.id] === q.correctAnswer).length;
        onComplete({ correct: correctCount, total: data.questions.length });
    };

    const highlightKeywords = (text: string, keywords: string[]) => {
        if (!keywords || keywords.length === 0) return text;
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        return text.replace(regex, `<mark class="bg-yellow-300 dark:bg-yellow-500 rounded px-1">$1</mark>`);
    };

    const allAnswered = Object.values(answers).every(a => a !== null);

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-2">{data.title}</h3>
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6 text-sm">
                {data.instructions.map((line, i) => <p key={i}>{line}</p>)}
            </div>

            <LearningGuide />
            
            {isSubmitted && (
                 <div className="my-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/50 text-center">
                    <h4 className="text-2xl font-bold text-green-800 dark:text-green-200">
                        Résultat: {data.questions.filter(q => answers[q.id] === q.correctAnswer).length} / {data.questions.length}
                    </h4>
                </div>
            )}
            
            <div className="space-y-4">
                {data.questions.map(q => {
                    const audioStatus = audioStates[q.id]?.status || 'idle';
                    const isCorrect = isSubmitted && answers[q.id] === q.correctAnswer;
                    
                    const buttonContent = {
                        idle: { icon: 'play', text: 'Écouter' },
                        loading: { icon: 'spinner', text: 'Génère...' },
                        playing: { icon: 'stop', text: 'Arrêter' },
                    };
                    
                    return (
                        <div key={q.id} className={`p-4 border-l-4 rounded-r-lg ${isSubmitted ? (isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/40' : 'border-red-500 bg-red-50 dark:bg-red-900/40') : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                            <p className="font-semibold mb-2">{q.id}. {q.aussage}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <button 
                                    onClick={() => handleTogglePlay(q.id, q.audioText, q.voiceGender)} 
                                    disabled={audioStatus === 'loading'}
                                    className={`px-4 py-2 text-white font-semibold rounded-lg flex items-center gap-2 text-sm transition-colors disabled:bg-slate-400 ${audioStatus === 'playing' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                                    {audioStatus === 'loading' ? <Spinner /> : <i className={`fas fa-${buttonContent[audioStatus].icon}`}></i>}
                                    {buttonContent[audioStatus].text}
                                </button>
                                {isSubmitted && (
                                    <button onClick={() => setShowTranscriptions(prev => ({...prev, [q.id]: !prev[q.id]}))} className="px-3 py-1 bg-slate-200 dark:bg-slate-600 rounded-md text-xs hover:bg-slate-300 dark:hover:bg-slate-500">
                                        {showTranscriptions[q.id] ? 'Fermer la transcription' : '📜 Voir la transcription'}
                                    </button>
                                )}
                            </div>

                             {isSubmitted && showTranscriptions[q.id] && (
                                <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-xs italic" dangerouslySetInnerHTML={{ __html: highlightKeywords(q.audioText, q.keywords)}}>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === 'Richtig'} onChange={() => handleAnswerChange(q.id, 'Richtig')} disabled={isSubmitted} className="form-radio" />
                                    <span>Richtig (+)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === 'Falsch'} onChange={() => handleAnswerChange(q.id, 'Falsch')} disabled={isSubmitted} className="form-radio" />
                                    <span>Falsch (-)</span>
                                </label>
                            </div>

                            {isSubmitted && (
                                <div className={`mt-3 text-sm p-3 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50'}`}>
                                    <p className="font-semibold">🇩🇪 {q.feedbackDE}</p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-400">🇫🇷 {q.feedbackFR}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center space-x-4">
                {!isSubmitted ? (
                    <button onClick={handleSubmit} disabled={!allAnswered} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                        Valider mes réponses
                    </button>
                ) : (
                    <button onClick={onGenerateNew} disabled={isLoading} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center gap-2">
                       {isLoading ? <Spinner /> : '🆕 Encore un autre exercice'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HoerverstehenTeil3Exercise;
