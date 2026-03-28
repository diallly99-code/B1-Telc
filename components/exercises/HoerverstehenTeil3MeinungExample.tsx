import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { HoerverstehenTeil3MeinungExerciseData } from '../../types';
import { generateHoerverstehenTeil3MeinungExercise } from '../../services/geminiService';
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

// Helper to concatenate audio buffers
function concatenateAudioBuffers(buffers: AudioBuffer[], context: AudioContext): AudioBuffer {
    if (buffers.length === 0) {
        // Return a silent, single-sample buffer if there's nothing to concatenate
        return context.createBuffer(1, 1, context.sampleRate);
    }

    const numberOfChannels = buffers[0].numberOfChannels;
    const sampleRate = buffers[0].sampleRate;

    let totalLength = 0;
    for (const buffer of buffers) {
        totalLength += buffer.length;
    }

    const result = context.createBuffer(numberOfChannels, totalLength, sampleRate);

    for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = result.getChannelData(channel);
        let offset = 0;
        for (const buffer of buffers) {
            channelData.set(buffer.getChannelData(channel), offset);
            offset += buffer.length;
        }
    }

    return result;
}


const fixedExerciseData: HoerverstehenTeil3MeinungExerciseData = {
    thema: "Wie sieht die Zukunft in zwanzig Jahren aus? (À quoi ressemblera la vie dans vingt ans ?)",
    dialogue: [
        { speaker: 'Sprecherin', text: 'Guten Morgen, liebe Zuhörer, willkommen zu unserer Hörerdiskussion. Unser Thema heute ist „Wie sieht die Zukunft in zwanzig Jahren aus?“. Monika, möchten Sie vielleicht beginnen unseren Hörern zu erzählen, wie Sie sich unser Leben in zwanzig Jahren vorstellen?', voiceGender: 'female' },
        { speaker: 'Monika', text: 'Also ich denke auf jeden Fall, dass die Technik sich immer weiter entwickeln wird. Dabei denke ich zum Beispiel an die Automobilindustrie. Es gibt ja jetzt schon Autos, die von alleine einparken können. Dabei bin ich mir sicher, dass wir in einigen Jahren voll automatisierte Autos haben werden, die über Computer gesteuert werden, so dass man nur noch einsteigen und den Bordcomputer anschalten muss.', voiceGender: 'female' },
        { speaker: 'Sprecherin', text: 'Was meinen Sie dazu, Kristin?', voiceGender: 'female' },
        { speaker: 'Kristin', text: 'In meinem Studium benutze ich jetzt schon ein virtuelles Klassenzimmer oder Chats und Blogs zur Zusammenarbeit mit Anderen. In den nächsten Jahrzehnten werden Zeit und Raum für die Kommunikation noch unwichtiger werden. In zwanzig Jahren werden Studenten sich über ihr Handy oder Tablet-Computer in eine virtuelle Universität einloggen und überall und jederzeit mit dem ganzen System arbeiten können.', voiceGender: 'female' },
        { speaker: 'Sprecherin', text: 'Und wie ist es bei Ihnen, Alex?', voiceGender: 'female' },
        { speaker: 'Alex', text: 'In Unternehmen wird es sicher auch ganz anders aussehen. Ich könnte mir vorstellen, dass Firmen Kommunikationsinseln einrichten, wo sich Kollegen und Kunden als Teams treffen. Natürlich würde es dort digitale Wandflächen für Skizzen und Ideen geben. Und Serviceroboter werden technische Hilfe bereitstellen und Getränke servieren.', voiceGender: 'male' },
        { speaker: 'Sprecherin', text: 'Tja, und nun zu Ihnen, Julius.', voiceGender: 'female' },
        { speaker: 'Julius', text: 'Ich glaube, dass in zwanzig Jahren niemand mehr einen herkömmlichen Computer oder einen Laptop haben wird. Auch Tablets werden wir dann wahrscheinlich total altmodisch finden. Stattdessen werden wir alle Informationen mit Datenbrillen abrufen. Damit werden wir nicht nur surfen und Fotos machen, sondern auch fernsehen und telefonieren. Und irgendwann brauchen wir dazu auch keine Brillen mehr, sondern machen alles über einen winzigen Mikrochip, den wir unter der Haut tragen.', voiceGender: 'male' },
        { speaker: 'Sprecherin', text: 'Und wie ist Ihre Meinung dazu, Sofie?', voiceGender: 'female' },
        { speaker: 'Sofie', text: 'Also, ich weiß nicht. Noch mehr Technologien in unserem Leben halte ich für unmöglich. Und ich will das auch gar nicht! Die Menschen sind doch jetzt schon mit vielen elektronischen Entwicklungen überfordert. Wenn es so weitergeht, werden wir schon bald eine Rückbewegung erleben. Ich glaube, wir werden die 24-Stunden-Erreichbarkeit zurücknehmen und Medienpausen einplanen.', voiceGender: 'female' },
        { speaker: 'Sprecherin', text: 'Und wie sehen Sie das, Ben?', voiceGender: 'female' },
        { speaker: 'Ben', text: 'Ich glaube auch, dass es irgendwann mit dem Technologiewahn genug sein wird. Immer mehr elektronische Geräte und immer weniger zwischenmenschlicher Kontakt hat meiner Meinung nach schlimme Auswirkungen auf unsere Kommunikationsfähigkeit und unser Sozialleben. Der Mensch ist schließlich kein Computer. Aber natürlich gibt es auch Positives daran. Was ich mir zum Beispiel für mich gut vorstellen kann, ist ein Büro, das papierlos ist. Das wäre allein schon aus ökologischen Gründen toll.', voiceGender: 'male' },
        { speaker: 'Sprecherin', text: 'Ich bedanke mich bei unseren Hörern für ihre Meinungen zum Thema „Wie wird die Zukunft in zwanzig Jahren aussehen?“.', voiceGender: 'female' }
    ],
    questions: [
        { id: 56, speakerName: 'Kristin' },
        { id: 57, speakerName: 'Alex' },
        { id: 58, speakerName: 'Julius' },
        { id: 59, speakerName: 'Sofie' },
        { id: 60, speakerName: 'Ben' },
    ],
    affirmations: [
        { letter: 'a', text: '… am Arbeitsplatz viel mehr Technik benutzt werden wird.' },
        { letter: 'b', text: '… die Art, wie wir lernen, sich verändern wird.' },
        { letter: 'c', text: '… die elektronischen Geräte immer kleiner werden.' },
        { letter: 'd', text: '… jeder entweder einen Laptop oder ein Tablet besitzen wird.' },
        { letter: 'e', text: '… Technik zwar viele Nachteile, aber auch Vorteile hat.' },
        { letter: 'f', text: '… wir Zeiten ohne Telefone, Fernsehen und Computer brauchen werden.' }
    ],
    solutions: [
        { questionId: 56, correctAffirmationLetter: 'b', feedbackDE: 'Kristin spricht über virtuelles Lernen mit Handy und Tablet.', feedbackFR: 'Kristin parle d’un apprentissage virtuel via portable et tablette.', relevantSnippet: 'In meinem Studium benutze ich jetzt schon ein virtuelles Klassenzimmer...' },
        { questionId: 57, correctAffirmationLetter: 'a', feedbackDE: 'Alex beschreibt Roboter und digitale Arbeitsplätze.', feedbackFR: 'Alex décrit un futur travail très technologique.', relevantSnippet: 'Serviceroboter werden technische Hilfe bereitstellen...' },
        { questionId: 58, correctAffirmationLetter: 'c', feedbackDE: 'Julius spricht über Datenbrillen und Mikrochips.', feedbackFR: 'Julius parle de lunettes connectées et de micropuces.', relevantSnippet: 'Und irgendwann brauchen wir dazu auch keine Brillen mehr, sondern machen alles über einen winzigen Mikrochip...' },
        { questionId: 59, correctAffirmationLetter: 'f', feedbackDE: 'Sofie will weniger Technik und mehr Ruhe.', feedbackFR: 'Sofie souhaite moins de technologie et plus de pauses médias.', relevantSnippet: 'Ich glaube, wir werden die 24-Stunden-Erreichbarkeit zurücknehmen und Medienpausen einplanen.' },
        { questionId: 60, correctAffirmationLetter: 'e', feedbackDE: 'Ben sieht gute und schlechte Seiten der Technologie.', feedbackFR: 'Ben reconnaît les avantages et les inconvénients de la technologie.', relevantSnippet: 'Der Mensch ist schließlich kein Computer. Aber natürlich gibt es auch Positives daran.' },
    ]
};

const StrategyGuide: React.FC = () => (
    <details className="mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
        <summary className="font-bold text-lg cursor-pointer text-green-700 dark:text-green-400">🧭 Stratégie d’écoute (Teil 3 - Meinungen)</summary>
        <div className="mt-4 space-y-2 text-sm">
            <p><strong>🇩🇪 Tipp 1:</strong> Höre auf Signalwörter wie <mark>ich denke</mark>, <mark>ich glaube</mark>, <mark>meiner Meinung nach</mark>.</p>
            <p className="text-slate-500 dark:text-slate-400"><strong>🇫🇷 Conseil 1:</strong> Repère les expressions qui marquent l’opinion (je pense que, je crois que…).</p>
            <hr className="dark:border-slate-600 my-2"/>
            <p><strong>🇩🇪 Tipp 2:</strong> Notiere zu jeder Person ein Stichwort – das hilft beim Zuordnen.</p>
            <p className="text-slate-500 dark:text-slate-400"><strong>🇫🇷 Conseil 2:</strong> Note un mot-clé par intervenant pour retenir son idée.</p>
            <hr className="dark:border-slate-600 my-2"/>
            <p><strong>🇩🇪 Tipp 3:</strong> Achte auf Kontraste (<mark>aber</mark>, <mark>trotzdem</mark>, <mark>dagegen</mark>).</p>
            <p className="text-slate-500 dark:text-slate-400"><strong>🇫🇷 Conseil 3:</strong> Les connecteurs mais, pourtant, cependant marquent souvent une opposition.</p>
            <hr className="dark:border-slate-600 my-2"/>
            <p><strong>🇩🇪 Tipp 4:</strong> Lass dich nicht verwirren, wenn zwei Personen ähnlich denken – konzentriere dich auf Details.</p>
            <p className="text-slate-500 dark:text-slate-400"><strong>🇫🇷 Conseil 4:</strong> Ne te laisse pas piéger si deux avis se ressemblent : écoute les détails précis.</p>
        </div>
    </details>
);


const HoerverstehenTeil3MeinungExample: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    const [exercise, setExercise] = useState<HoerverstehenTeil3MeinungExerciseData>(fixedExerciseData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [answers, setAnswers] = useState<Record<number, string | null>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingSnippetId, setLoadingSnippetId] = useState<number | null>(null);
    const [showTranscription, setShowTranscription] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const solutionsMap = useMemo(() => new Map(exercise.solutions.map(s => [s.questionId, s])), [exercise]);

    const stopAllAudio = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.onended = null; // Prevent onended from firing on manual stop
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setIsPlaying(false);
        setLoadingSnippetId(null);
    }, []);

    const playBuffer = useCallback((buffer: AudioBuffer, onEnd?: () => void) => {
        stopAllAudio();
        if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            setIsPlaying(false);
            sourceRef.current = null;
            if(onEnd) onEnd();
        };
        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
    }, [stopAllAudio]);

    const handlePlayDialogue = useCallback(async () => {
        if (isPlaying) {
            stopAllAudio();
            return;
        }
    
        if (audioBuffer) {
            playBuffer(audioBuffer);
            return;
        }
    
        setIsGeneratingAudio(true);
        setError(null);
        
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const context = audioContextRef.current;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
             const speakerToVoiceMap: Record<string, string> = {
                'Sprecherin': 'Puck',
                'Monika': 'Leda',
                'Kristin': 'Callirrhoe',
                'Alex': 'Kore',
                'Julius': 'Orus',
                'Sofie': 'Puck', // Corrected from 'Leda' to have distinct participant voices
                'Ben': 'Charon',
            };
    
            const audioPromises = exercise.dialogue.map(async (turn) => {
                const voiceName = speakerToVoiceMap[turn.speaker] || 'Puck';
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: turn.text }] }],
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
                if (!base64Audio) {
                    console.warn(`No audio data generated for speaker ${turn.speaker}`);
                    return null;
                }
                return decodeAudioData(decode(base64Audio), context);
            });

            const individualBuffers = (await Promise.all(audioPromises)).filter((b): b is AudioBuffer => b !== null);

            if (individualBuffers.length === 0) {
                 throw new Error("No audio data could be generated for any dialogue part.");
            }

            const fullBuffer = concatenateAudioBuffers(individualBuffers, context);
    
            setAudioBuffer(fullBuffer);
            playBuffer(fullBuffer);
    
        } catch (err) {
            console.error(err);
            setError("Fehler bei der Audiogenerierung. " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsGeneratingAudio(false);
        }
    }, [isPlaying, audioBuffer, exercise.dialogue, stopAllAudio, playBuffer]);

    const playSnippet = useCallback(async (questionId: number, text: string) => {
        stopAllAudio();
        setLoadingSnippetId(questionId);
        setError(null);
        try {
             const speakerToVoiceMap: Record<string, string> = {
                'Sprecherin': 'Puck',
                'Monika': 'Leda',
                'Kristin': 'Callirrhoe',
                'Alex': 'Kore',
                'Julius': 'Orus',
                'Sofie': 'Puck',
                'Ben': 'Charon',
            };
            const turn = exercise.dialogue.find(d => d.text.includes(text));
            const speakerName = turn ? turn.speaker : 'Sprecherin';
            const voiceName = speakerToVoiceMap[speakerName] || 'Puck';


            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
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
             if (base64Audio) {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
                playBuffer(buffer, () => setLoadingSnippetId(null));
            } else {
                throw new Error("No audio data for snippet received.");
            }

        } catch (err) {
            console.error(err);
            setError("Fehler beim Abspielen des Snippets.");
            setLoadingSnippetId(null);
        }
    }, [stopAllAudio, playBuffer, exercise.dialogue]);

    const handleAnswerChange = (questionId: number, letter: string) => {
        if(isSubmitted) return;
        setAnswers(prev => ({...prev, [questionId]: letter}));
    };
    
    const handleSubmit = () => {
        stopAllAudio();
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setAnswers({});
        setShowTranscription(false);
        stopAllAudio();
    };
    
    const handleGenerateNew = async () => {
        handleReset();
        setAudioBuffer(null);
        setIsLoading(true);
        setError(null);
        try {
            const newExercise = await generateHoerverstehenTeil3MeinungExercise();
            setExercise(newExercise);
        } catch (err) {
            setError('Fehler beim Generieren der Übung. Bitte versuchen Sie es erneut.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !exercise) {
        return <div className="flex justify-center p-8"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">🎯 Explication Teil 3 – Meinungen verstehen</h2>
            <StrategyGuide />
            
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-3">
                <h3 className="font-bold text-lg">Hörtext: {exercise.thema}</h3>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handlePlayDialogue} disabled={isGeneratingAudio} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-slate-400">
                        {isGeneratingAudio ? <Spinner/> : <i className={`fas fa-${isPlaying ? 'stop' : 'play'}`}></i>}
                        {isGeneratingAudio ? 'Génère...' : isPlaying ? 'Arrêter' : (audioBuffer ? 'Réécouter' : 'Écouter')}
                    </button>
                    <button onClick={() => setShowTranscription(s => !s)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 text-sm">
                        {showTranscription ? 'Cacher la transcription' : '📜 Voir la transcription'}
                    </button>
                </div>
                {showTranscription && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-md text-sm max-h-60 overflow-y-auto space-y-2">
                        {exercise.dialogue.map((turn, i) => <p key={i}><strong>{turn.speaker}:</strong> {turn.text}</p>)}
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Fragen (56-60)</h3>
                    {exercise.questions.map(q => {
                        const solution = solutionsMap.get(q.id);
                        const userAnswer = answers[q.id];
                        const isCorrect = isSubmitted && userAnswer === solution?.correctAffirmationLetter;
                        return (
                            <div key={q.id} className={`p-3 border-l-4 rounded-r-lg ${isSubmitted ? (isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/40' : 'border-red-500 bg-red-50 dark:bg-red-900/40') : 'border-slate-200 dark:border-slate-700'}`}>
                                <p className="font-semibold">{q.id}. {q.speakerName} meint, dass...</p>
                                <select value={userAnswer || ''} onChange={e => handleAnswerChange(q.id, e.target.value)} disabled={isSubmitted} className="mt-2 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800">
                                    <option value="" disabled>Wählen...</option>
                                    {exercise.affirmations.map(a => <option key={a.letter} value={a.letter}>{a.letter}) {a.text}</option>)}
                                </select>
                                {isSubmitted && solution && !isCorrect && (
                                    <div className="mt-2 text-sm p-2 bg-red-100 dark:bg-red-800/50 rounded-md space-y-1">
                                        <p><strong>❌ Falsch.</strong> Richtige Antwort: <strong>{solution.correctAffirmationLetter.toUpperCase()}</strong></p>
                                        <p>{solution.feedbackDE} <em>({solution.feedbackFR})</em></p>
                                        <button onClick={() => playSnippet(q.id, solution.relevantSnippet)} disabled={loadingSnippetId !== null} className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1">
                                           {loadingSnippetId === q.id ? <Spinner/> : '🔊'} Passage anhören
                                        </button>
                                    </div>
                                )}
                                 {isSubmitted && solution && isCorrect && (
                                    <div className="mt-2 text-sm p-2 bg-green-100 dark:bg-green-800/50 rounded-md space-y-1">
                                        <p><strong>✅ Richtig!</strong> {solution.feedbackDE} <em>({solution.feedbackFR})</em></p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h3 className="font-bold text-lg">Aussagen (a-f)</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                        {exercise.affirmations.map(a => <li key={a.letter}><strong>{a.letter})</strong> {a.text}</li>)}
                    </ul>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {!isSubmitted ? (
                    <button onClick={handleSubmit} disabled={Object.values(answers).some(a => a === null || a === undefined) || Object.keys(answers).length < exercise.questions.length} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                        Überprüfen
                    </button>
                ) : (
                     <button onClick={handleReset} className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600">
                        Wiederholen
                    </button>
                )}
                 <button onClick={handleGenerateNew} disabled={isLoading} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center gap-2">
                    {isLoading ? <Spinner /> : '🆕 Encore un autre exercice'}
                </button>
            </div>
        </div>
    );
};

export default HoerverstehenTeil3MeinungExample;