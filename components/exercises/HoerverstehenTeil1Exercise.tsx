import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { HoerverstehenTeil1Question } from '../../types';
import { generateHoerverstehenTeil1Exercise } from '../../services/geminiService';
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


const initialExerciseData: HoerverstehenTeil1Question[] = [
  {
    id: 41,
    contextDE: "Sie hören eine Frau über ihre Hausarbeit sprechen.",
    contextFR: "Vous entendez une femme parler de ses tâches ménagères.",
    statement: "Die Sprecherin muss im Haushalt fast alles alleine machen.",
    audioText: "Na,eigentlich mach alles ich, ich bin zu Haus, daher koch ich, ich wasch ab, ich bügle, ich versorge das Kind, na ja mein Mann macht vielleicht den Abwasch und den Garten – für den ist er zuständig und einkaufen gehen wir beide.",
    keySentence: "Na, eigentlich mach alles ich.",
    correctAnswer: 'A',
    phoneticKeywords: [
        { de: "alles", fr: "tout", ipa: "[ˈaləs]" },
        { de: "alleine", fr: "seule", ipa: "[aˈlaɪ̯nə]" },
        { de: "Haushalt", fr: "ménage", ipa: "[ˈhaʊ̯shalt]" }
    ],
    explanationDE: "Die Antwort ist richtig. Die Sprecherin sagt: 'eigentlich mach alles ich'.",
    explanationFR: "La réponse est correcte. La locutrice dit : 'en fait, c'est moi qui fais tout'.",
    strategyTipDE: "Achten Sie auf Schlüsselwörter, die eine Totalität ausdrücken, wie 'alles'.",
    strategyTipFR: "Faites attention aux mots-clés qui expriment une totalité, comme 'tout'.",
    voiceGender: 'female',
  },
  {
    id: 42,
    contextDE: "Sie hören einen Mann über seine Hausarbeit sprechen.",
    contextFR: "Vous entendez un homme parler de ses tâches ménagères.",
    statement: "Der Sprecher wäscht das Geschirr und die Wäsche.",
    audioText: "Wo ich im Haushalt helfe, ach Gott, kochen tu immer ich, das macht mir großen Spaß. Dafür wäscht meine Frau eben ab. Wäsche waschen mach ich nicht so gerne, das macht sie. Dafür geh ich immer gerne einkaufen und gieße die Blumen, damit ich ein bisschen aus dem Haus rauskomme.",
    keySentence: "Wäsche waschen mach ich nicht so gerne, das macht sie.",
    correctAnswer: 'B',
    phoneticKeywords: [
        { de: "Wäsche waschen", fr: "faire la lessive", ipa: "[ˈvɛʃə ˈvaʃn̩]" },
        { de: "macht sie", fr: "elle le fait", ipa: "[maxt ziː]" },
        { de: "nicht ich", fr: "pas moi", ipa: "[nɪçt ɪç]" }
    ],
    explanationDE: "Die Antwort ist falsch. Der Sprecher sagt, dass seine Frau die Wäsche wäscht: 'Wäsche waschen mach ich nicht so gerne, das macht sie.'",
    explanationFR: "La réponse est fausse. Le locuteur dit que c'est sa femme qui fait la lessive : 'Je n'aime pas faire la lessive, c'est elle qui la fait'.",
    strategyTipDE: "Achten Sie genau darauf, wer die Aktion ausführt (Subjekt des Satzes).",
    strategyTipFR: "Faites bien attention à qui fait l'action (sujet de la phrase).",
    voiceGender: 'male',
  },
  {
    id: 43,
    contextDE: "Sie hören eine Mutter über ihre täglichen Aufgaben sprechen.",
    contextFR: "Vous entendez une mère parler de ses tâches quotidiennes.",
    statement: "Die Sprecherin ist berufstätig und hat keine Zeit für die Hausarbeit.",
    audioText: "Bei uns ist das so, mein Mann ist voll berufstätig, ich bin zu Hause mit unseren zwei kleinen Kindern, drei und fünf Jahre alt, tja, und dann schaut’s so aus, dass ich koche, abwasche, aufräume, das muss auch ich machen. Wäschewaschen und Bügeln mach ich auch. Das Einkaufen übernimmt er, und im Sommer betreut er den Garten, denn Gartenarbeit mag ich gar nicht.",
    keySentence: "ich bin zu Hause mit unseren zwei kleinen Kindern.",
    correctAnswer: 'B',
    phoneticKeywords: [
        { de: "zu Hause", fr: "à la maison", ipa: "[tsuː ˈhaʊ̯zə]" },
        { de: "kleinen Kindern", fr: "jeunes enfants", ipa: "[ˈklaɪ̯nən ˈkɪndɐn]" },
        { de: "nicht berufstätig", fr: "pas d'emploi", ipa: "[nɪçt bəˈruːfsteːtɪç]" }
    ],
    explanationDE: "Die Antwort ist falsch. Sie sagt: 'ich bin zu Hause mit unseren zwei kleinen Kindern'.",
    explanationFR: "La réponse est fausse. Elle dit : 'je suis à la maison avec nos deux jeunes enfants'.",
    strategyTipDE: "Hören Sie genau auf die Beschreibung der Lebenssituation am Anfang.",
    strategyTipFR: "Écoutez attentivement la description de la situation de vie au début.",
    voiceGender: 'female',
  },
  {
    id: 44,
    contextDE: "Sie hören einen Mann über die Aufteilung der Hausarbeit sprechen.",
    contextFR: "Vous entendez un homme parler du partage des tâches ménagères.",
    statement: "Der Sprecher teilt sich mit seiner Partnerin die Arbeit je nach Situation auf.",
    audioText: "Puh, wissen Sie, bei uns ist das ganz unterschiedlich, das hängt von der Situation ab. Meistens koche ich und gehe auch einkaufen, während meine Partnerin sich eher mit Aufräumen und Abwaschen beschäftigt. Die Wäsche teilen wir uns, und Garten haben wir keinen, daher fällt das weg.",
    keySentence: "bei uns ist das ganz unterschiedlich, das hängt von der Situation ab.",
    correctAnswer: 'A',
    phoneticKeywords: [
        { de: "unterschiedlich", fr: "variable", ipa: "[ˈʊntɐˌʃiːtlɪç]" },
        { de: "hängt von der Situation ab", fr: "dépend de la situation", ipa: "[hɛŋt fɔn deːɐ̯ zituaˈtsjoːn ap]" }
    ],
    explanationDE: "Die Antwort ist richtig. Er sagt: 'bei uns ist das ganz unterschiedlich, das hängt von der Situation ab'.",
    explanationFR: "La réponse est correcte. Il dit : 'chez nous, c'est très variable, ça dépend de la situation'.",
    strategyTipDE: "Achten Sie auf Ausdrücke, die Flexibilität oder Variation beschreiben.",
    strategyTipFR: "Soyez attentif aux expressions qui décrivent la flexibilité ou la variation.",
    voiceGender: 'male',
  },
  {
    id: 45,
    contextDE: "Sie hören eine Frau, die sich über ihren Mann beschwert.",
    contextFR: "Vous entendez une femme se plaindre de son mari.",
    statement: "Die Sprecherin ist froh, dass ihr Mann so viele Hausarbeiten übernimmt.",
    audioText: "Also mein Mann, der ist ziemlich faul. Der macht überhaupt nur, was ihm Spaß macht. Einkaufen geht er ja – aber er hält sich nicht an die Liste, die ich ihm aufschreibe. Ab und zu kocht er, aber das Abwaschen überlässt er mir. Aufräumen tut er sowieso nicht, und um den Garten kümmert sich keiner – der verwildert.",
    keySentence: "Also mein Mann, der ist ziemlich faul.",
    correctAnswer: 'B',
    phoneticKeywords: [
        { de: "ziemlich faul", fr: "assez paresseux", ipa: "[ˈtsiːmlɪç faʊ̯l]" },
        { de: "macht nicht viel", fr: "ne fait pas grand-chose", ipa: "[maxt nɪçt fiːl]" }
    ],
    explanationDE: "Die Antwort ist falsch. Sie sagt, ihr Mann sei 'ziemlich faul'.",
    explanationFR: "La réponse est fausse. Elle dit que son mari est 'assez paresseux'.",
    strategyTipDE: "Adjektive wie 'faul' geben einen starken Hinweis auf die Meinung der Person.",
    strategyTipFR: "Les adjectifs comme 'paresseux' donnent une forte indication sur l'opinion de la personne.",
    voiceGender: 'female',
  }
];

interface HoerverstehenTeil1ExerciseProps {
  onComplete: (score: { correct: number; total: number }) => void;
}

const HoerverstehenTeil1Exercise: React.FC<HoerverstehenTeil1ExerciseProps> = ({ onComplete }) => {
    const [exerciseData, setExerciseData] = useState<HoerverstehenTeil1Question[]>(initialExerciseData);
    const [isLoadingNewExercise, setIsLoadingNewExercise] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const [phase, setPhase] = useState<'reading' | 'answering' | 'review'>('reading');
    const [answers, setAnswers] = useState<( 'A' | 'B' | null)[]>(Array(5).fill(null));
    
    const [audioStates, setAudioStates] = useState<Record<number, { status: 'idle' | 'loading' | 'playing' }>>({});
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const initializeStates = useCallback(() => {
        const initialAudioStates: Record<number, { status: 'idle' }> = {};
        exerciseData.forEach(q => {
            initialAudioStates[q.id] = { status: 'idle' };
        });
        setAudioStates(initialAudioStates);
        setAnswers(Array(5).fill(null));
        setPhase('reading');
    }, [exerciseData]);

    useEffect(() => {
        initializeStates();
    }, [exerciseData, initializeStates]);

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

    const handleTogglePlay = useCallback(async (questionId: number, text: string, statement: string, defaultGender: 'female' | 'male' = 'female') => {
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
            
            let gender: 'female' | 'male';
            if (statement.includes('Der Sprecher')) {
                gender = 'male';
            } else if (statement.includes('Die Sprecherin')) {
                gender = 'female';
            } else {
                gender = defaultGender;
            }

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


    const handleAnswerSelect = (index: number, answer: 'A' | 'B') => {
        if (phase !== 'answering') return;
        const newAnswers = [...answers];
        newAnswers[index] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        setPhase('review');
        stopAllAudio();
        const correctCount = answers.filter((ans, i) => ans === exerciseData[i].correctAnswer).length;
        onComplete({ correct: correctCount, total: exerciseData.length });
    };

    const handleGenerateNew = async () => {
        setIsLoadingNewExercise(true);
        setGenerationError(null);
        stopAllAudio();
        try {
            const newQuestions = await generateHoerverstehenTeil1Exercise();
            setExerciseData(newQuestions);
        } catch (err) {
            setGenerationError('Fehler: Neues Training konnte nicht generiert werden. Bitte erneut versuchen.');
            console.error(err);
        } finally {
            setIsLoadingNewExercise(false);
        }
    };

    const renderReadingPhase = () => (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-2">Hörverstehen Teil 1</h3>
            <p className="mb-4 text-slate-600 dark:text-slate-400">Lesen Sie jetzt die Aufgaben 41–45. Sie haben dafür 30 Sekunden Zeit. Klicken Sie dann auf "Start", um mit dem Hören zu beginnen.</p>
            <div className="my-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-3">
                {exerciseData.map(q => <p key={q.id}><strong>{q.id}.</strong> {q.statement}</p>)}
            </div>
            <div className="text-center">
                 <button onClick={() => setPhase('answering')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-lg">
                    Start
                </button>
            </div>
        </div>
    );

    const renderAnsweringPhase = () => (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-2">Hören und antworten</h3>
             <p className="mb-4 text-slate-600 dark:text-slate-400">Sie hören jeden Text nur einmal. Entscheiden Sie, ob die Aussage richtig (+) oder falsch (-) ist.</p>
            
            <div className="space-y-4">
                {exerciseData.map((q, index) => {
                    const audioStatus = audioStates[q.id]?.status || 'idle';
                    const buttonContent = {
                        idle: { icon: 'play', text: 'Écouter' },
                        loading: { icon: 'spinner', text: 'Génère...' },
                        playing: { icon: 'stop', text: 'Arrêter' },
                    };
                    
                    return (
                        <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold">{q.id}. {q.statement}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <button
                                    onClick={() => handleTogglePlay(q.id, q.audioText, q.statement, q.voiceGender)}
                                    disabled={audioStatus === 'loading'}
                                    className={`w-36 justify-center px-4 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                                        audioStatus === 'playing' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    {audioStatus === 'loading' ? <Spinner /> : <i className={`fas fa-${buttonContent[audioStatus].icon}`}></i>}
                                    {buttonContent[audioStatus].text}
                                </button>
                                 <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAnswerSelect(index, 'A')}
                                        className={`w-12 h-12 text-2xl font-bold rounded-lg transition-colors ${answers[index] === 'A' ? 'bg-blue-500 text-white ring-2 ring-blue-700' : 'bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700'}`}
                                    >+</button>
                                    <button
                                        onClick={() => handleAnswerSelect(index, 'B')}
                                        className={`w-12 h-12 text-2xl font-bold rounded-lg transition-colors ${answers[index] === 'B' ? 'bg-orange-500 text-white ring-2 ring-orange-700' : 'bg-orange-200 dark:bg-orange-800 hover:bg-orange-300 dark:hover:bg-orange-700'}`}
                                    >-</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 text-center">
                 <button
                    onClick={handleSubmit}
                    disabled={answers.some(a => a === null)}
                    className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-xl disabled:bg-slate-400"
                >
                    Korrigieren
                </button>
            </div>
        </div>
    );
    
    const renderReviewPhase = () => {
        const correctCount = answers.filter((ans, i) => ans === exerciseData[i].correctAnswer).length;
        const scoreMessage = correctCount >= 4 
            ? { de: "Sehr gut! Du hast das Hörverstehen sehr gut gemeistert.", fr: "Excellent ! Tu as très bien compris les audios." }
            : { de: "Gut gemacht! Hör dir den Text noch einmal an und versuche es erneut.", fr: "Bien essayé ! Réécoute le texte et essaie encore une fois." };

        const audioButton = (id: number, text: string, statement: string, gender: 'female' | 'male', isSnippet = false) => {
            const status = audioStates[id]?.status || 'idle';
            const content = {
                idle: { icon: 'play', text: isSnippet ? 'Passage anhören' : 'Ganzen Text anhören' },
                loading: { icon: 'spinner', text: 'Génère...' },
                playing: { icon: 'stop', text: 'Arrêter' },
            };
            return (
                <button
                    onClick={() => handleTogglePlay(id, text, statement, gender)}
                    disabled={status === 'loading'}
                    className={`mt-2 text-sm px-3 py-1.5 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                        status === 'playing' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {status === 'loading' ? <Spinner /> : <i className={`fas fa-${content[status].icon}`}></i>}
                    {content[status].text}
                </button>
            );
        };

        return (
            <div className="animate-fade-in space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-center">Correction</h3>
                    <div className="mt-4 p-4 text-center bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                        <p className="text-xl font-bold text-blue-800 dark:text-blue-200">Du hast {correctCount} von 5 richtig beantwortet.</p>
                        <p className="text-slate-600 dark:text-slate-300">Tu as obtenu {correctCount} sur 5 bonnes réponses.</p>
                        <p className="mt-2 font-semibold text-blue-700 dark:text-blue-300">{scoreMessage.de}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">({scoreMessage.fr})</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-xl font-bold mb-3">Detailliertes Feedback</h4>
                    <div className="space-y-4">
                         {exerciseData.map((q, index) => {
                             const isCorrect = answers[index] === q.correctAnswer;
                             
                             return (
                                 <div key={`fb-${q.id}`} className={`p-3 rounded-lg border-l-4 ${isCorrect ? 'bg-green-50 dark:bg-green-900/40 border-green-500' : 'bg-red-50 dark:bg-red-900/40 border-red-500'}`}>
                                     <p className="font-semibold">{q.id}. {q.statement}</p>
                                     <p className={`mt-1 text-sm font-bold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                        Deine Antwort: {answers[index] === 'A' ? 'Richtig' : 'Falsch'} ({isCorrect ? '✅' : '❌'})
                                     </p>
                                     <p className="mt-2 text-sm">
                                         {isCorrect ? 'Sehr gut! Du hast die Mitteilung richtig verstanden.' : q.explanationDE}
                                         <em className="text-slate-500 dark:text-slate-400"> ({isCorrect ? 'Très bien ! Tu as bien compris le message.' : q.explanationFR})</em>
                                     </p>
                                     <div className="flex flex-wrap gap-2">
                                        {audioButton(q.id, q.audioText, q.statement, q.voiceGender)}
                                        {!isCorrect && audioButton(q.id + 100, q.keySentence, q.statement, q.voiceGender, true)}
                                     </div>
                                 </div>
                             );
                         })}
                    </div>
                </div>
                
                <div className="text-center pt-4">
                    {generationError && <p className="text-red-500 text-sm mb-2">{generationError}</p>}
                    <button 
                        onClick={handleGenerateNew} 
                        disabled={isLoadingNewExercise}
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center justify-center mx-auto"
                    >
                        {isLoadingNewExercise ? <Spinner /> : '🆕 Neues Training starten'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            {phase === 'reading' && renderReadingPhase()}
            {phase === 'answering' && renderAnsweringPhase()}
            {phase === 'review' && renderReviewPhase()}
        </div>
    );
};

export default HoerverstehenTeil1Exercise;