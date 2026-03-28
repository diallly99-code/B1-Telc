import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { HoerverstehenTeil1Question } from '../../types';
import { generateHoerverstehenTeil1Exercise, getHoerverstehenPersonalizedTip } from '../../services/geminiService';
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


const STRATEGY_TIPS = [
    "Lisez toutes les phrases avant d’écouter pour savoir quelles informations chercher.",
    "Soulignez les mots-clés (noms, lieux, verbes, négations) dans les phrases.",
    "Écoutez une première fois pour avoir une idée générale, puis une deuxième fois pour les détails.",
    "Comparez précisément ce que vous entendez avec les mots des phrases. Attention aux synonymes !",
    "Faites attention aux pièges comme les négations ('nicht', 'kein') ou les mots qui changent le sens ('nur', 'schon', 'erst')."
];

const HoerverstehenTeil1Example: React.FC<{ onStartTraining: () => void; onBack: () => void; }> = ({ onStartTraining, onBack }) => {
    const [phase, setPhase] = useState<'initial' | 'training' | 'summary'>('initial');
    const [exerciseData, setExerciseData] = useState<HoerverstehenTeil1Question[] | null>(null);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [personalizedTip, setPersonalizedTip] = useState<string>('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Audio State
    const [playingState, setPlayingState] = useState<{ id: number; status: 'loading' | 'playing' } | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const handleGenerateExercise = async () => {
        setIsLoading(true);
        setError(null);
        stopAllAudio();
        try {
            const data = await generateHoerverstehenTeil1Exercise();
            setExerciseData(data);
            setAnswers({});
            setStep(0);
            setPhase('training');
        } catch (err) {
            setError('Fehler beim Generieren der Übung. Bitte versuchen Sie es erneut.');
            console.error(err);
            setPhase('initial');
        } finally {
            setIsLoading(false);
        }
    };

    const stopAllAudio = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.onended = null;
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setPlayingState(null);
    }, []);
    
    useEffect(() => {
        return () => stopAllAudio();
    }, [stopAllAudio]);

    const handlePlayAudio = useCallback(async (id: number, text: string, gender: 'female' | 'male' = 'female') => {
        if (playingState?.id === id) {
            stopAllAudio();
            return;
        }
        if (playingState?.status === 'loading') return;

        stopAllAudio();
        setPlayingState({ id, status: 'loading' });

        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const context = audioContextRef.current;
            
            const ai = new GoogleGenAI({ apiKey: import.meta.env?.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || 'missing_key' });
            
            const maleVoices = ['Kore', 'Orus', 'Charon'];
            const femaleVoices = ['Puck', 'Leda', 'Callirrhoe'];
            const voiceName = gender === 'female' 
                ? femaleVoices[id % femaleVoices.length] 
                : maleVoices[id % maleVoices.length];

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
                setPlayingState(null);
                sourceRef.current = null;
            };
            
            source.start(0);
            sourceRef.current = source;
            setPlayingState({ id, status: 'playing' });

        } catch (error) {
            console.error("Fehler bei der Audiowiedergabe:", error);
            setPlayingState(null);
        }
    }, [playingState, stopAllAudio]);


    const handleAnswer = (id: number, answer: string) => {
        if (answers[id]) return;
        setAnswers(prev => ({ ...prev, [id]: answer }));
    };

    const handleShowSummary = async () => {
        setPhase('summary');
        setIsLoading(true);
        try {
            const results = exerciseData?.map(q => ({
                statement: q.statement,
                isCorrect: answers[q.id] === q.correctAnswer
            })) || [];
            const tip = await getHoerverstehenPersonalizedTip(results);
            setPersonalizedTip(tip);
        } catch (err) {
            console.error(err);
            setPersonalizedTip("Impossible de générer un conseil personnalisé pour le moment.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (phase === 'initial') {
        return (
            <div className="animate-fade-in text-center space-y-6">
                <h2 className="text-2xl font-bold">🧠 Explication Hörverstehen Teil 1</h2>
                <p>🇩🇪 In diesem Modul kannst du beliebig viele Hörverstehen-Übungen vom Typ Teil 1 generieren.</p>
                <p className="text-slate-500 dark:text-slate-400">🇫🇷 Dans ce module, tu peux générer autant d’exercices de compréhension orale (Teil 1) que tu veux.</p>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 text-sm rounded-lg">
                    <strong>Consigne:</strong> Sie hören fünf kurze Texte. Entscheiden Sie, ob die Aussagen richtig oder falsch sind. / Écoutez les cinq courts textes. Décidez si les affirmations sont vraies ou fausses.
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button onClick={handleGenerateExercise} disabled={isLoading} className="px-8 py-4 rounded-lg font-bold text-white transition-colors duration-300 bg-green-500 hover:bg-green-600 text-xl flex items-center justify-center mx-auto disabled:bg-slate-400">
                    {isLoading ? <Spinner/> : '🟩 Générer un nouvel exercice'}
                </button>
            </div>
        );
    }
    
    if (phase === 'training' && exerciseData) {
        const currentExercise = exerciseData[step];
        const isAnswered = answers[currentExercise.id] !== undefined;
        
        return (
            <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Frage {currentExercise.id}</h3>
                    <div className="font-semibold">{step + 1} / {exerciseData.length}</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="font-semibold">{currentExercise.contextDE}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400"><em>({currentExercise.contextFR})</em></p>
                    <button onClick={() => handlePlayAudio(currentExercise.id, currentExercise.audioText, currentExercise.voiceGender)} className={`mt-2 px-4 py-2 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors ${playingState?.id === currentExercise.id ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {playingState?.status === 'loading' ? <Spinner/> : <i className={`fas fa-${playingState?.id === currentExercise.id ? 'stop' : 'play'}`}></i>}
                        {playingState?.id === currentExercise.id ? (playingState.status === 'loading' ? 'Génère...' : 'Stopp') : 'Audio abspielen'}
                    </button>
                </div>
                <p className="font-bold text-lg">Aussage: <em className="font-normal">"{currentExercise.statement}"</em></p>
                <div className="space-y-3">
                    {[{val: 'A', text: 'Richtig', icon: '✅'}, {val: 'B', text: 'Falsch', icon: '❌'}].map(opt => {
                        const isSelected = answers[currentExercise.id] === opt.val;
                        const isCorrect = isAnswered && opt.val === currentExercise.correctAnswer;
                        let btnClass = 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700';
                        if(isAnswered) {
                            if(isCorrect) btnClass = 'bg-green-100 dark:bg-green-900 ring-2 ring-green-500';
                            else if (isSelected) btnClass = 'bg-red-100 dark:bg-red-900 ring-2 ring-red-500';
                            else btnClass = 'bg-slate-200 dark:bg-slate-600 opacity-60';
                        }
                        return <button key={opt.val} onClick={() => handleAnswer(currentExercise.id, opt.val)} disabled={isAnswered} className={`w-full text-left p-3 border rounded-md flex items-center gap-3 transition-all ${btnClass}`}>
                           <span className="font-bold text-lg">{opt.icon}</span> {opt.text}
                        </button>
                    })}
                </div>
                {isAnswered && (
                     <div className="p-3 rounded-lg animate-fade-in space-y-4 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-400">
                        <p className="font-bold text-lg">{answers[currentExercise.id] === currentExercise.correctAnswer ? '✅ Richtig! Sehr gut!' : '❌ Leider falsch.'}</p>
                        
                        <div>
                            <h4 className="font-semibold text-sm">Analyse audio :</h4>
                             <div className="p-2 my-2 bg-white dark:bg-slate-800 rounded-md">
                               <p>{currentExercise.audioText}</p>
                            </div>
                            <button onClick={() => handlePlayAudio(currentExercise.id, currentExercise.audioText, currentExercise.voiceGender)} className="text-sm px-3 py-1 bg-blue-200 dark:bg-blue-800 rounded-full hover:bg-blue-300 dark:hover:bg-blue-700">Rejouer</button>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm">Explication complète:</h4>
                            <p>{currentExercise.explanationDE} <em className="text-slate-500 dark:text-slate-400">({currentExercise.explanationFR})</em></p>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50">⬅️ Précédent</button>
                    {step < exerciseData.length - 1 ? (
                        <button onClick={() => setStep(s => s + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Suivant ➡️</button>
                    ) : (
                        <button onClick={handleShowSummary} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">Voir le résumé</button>
                    )}
                </div>
            </div>
        );
    }

    if (phase === 'summary' && exerciseData) {
        const correctCount = Object.keys(answers).filter(key => answers[parseInt(key)] === exerciseData.find(q => q.id === parseInt(key))?.correctAnswer).length;
        return (
             <div className="animate-fade-in space-y-6">
                <h3 className="text-2xl font-bold text-center">Résumé & Stratégie</h3>
                <div className="p-4 text-center bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-200">Bonnes réponses: {correctCount} / {exerciseData.length}</p>
                    <p className="text-slate-600 dark:text-slate-300">Mauvaises réponses: {exerciseData.length - correctCount}</p>
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-md">
                        <h4 className="font-semibold">💡 Conseil personnalisé</h4>
                        {isLoading ? <Spinner/> : <p className="text-sm mt-1">{personalizedTip}</p>}
                    </div>
                </div>
                <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm table-auto">
                        <thead className="bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="p-2">Nr.</th>
                                <th className="p-2">Votre réponse</th>
                                <th className="p-2">Résultat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exerciseData.map(q => {
                                const ans = answers[q.id];
                                const isCorrect = ans === q.correctAnswer;
                                return <tr key={q.id} className="border-b dark:border-slate-700">
                                    <td className="p-2 font-bold">{q.id}</td>
                                    <td className="p-2 font-bold text-center">{ans === 'A' ? 'Richtig' : ans === 'B' ? 'Falsch' : 'N/A'}</td>
                                    <td className="p-2 text-xl text-center">{isCorrect ? '✅' : '❌'}</td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/50 border-l-4 border-purple-400 rounded-r-lg">
                    <h4 className="font-bold text-lg text-purple-800 dark:text-purple-300">🧠 Comment mieux écouter</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">{STRATEGY_TIPS.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                </div>
                <div className="text-center pt-4 flex flex-wrap justify-center gap-4">
                     <button onClick={handleGenerateExercise} disabled={isLoading} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400 flex items-center justify-center">
                        {isLoading ? <Spinner /> : '🆕 Générer un nouvel exercice'}
                    </button>
                    <button onClick={onStartTraining} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center">
                        ▶️ Passer en mode Examen
                    </button>
                </div>
            </div>
        )
    }

    return null;
};

export default HoerverstehenTeil1Example;
