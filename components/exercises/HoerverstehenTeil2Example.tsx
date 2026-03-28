import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HoerverstehenTeil2ExerciseData, HoerverstehenTeil2DialogueTurn } from '../../types';
import { generateHoerverstehenTeil2Exercise, generateHoerverstehenTeil2Audio, generateSingleSnippetAudio } from '../../services/geminiService';
import Spinner from '../Spinner';

const initialStaticData: HoerverstehenTeil2ExerciseData = {
    thema: 'Nervige Mitfahrgelegenheit',
    dialogue: [
        { speaker: 'Frau', text: 'Laura und Marco wohnen in der Stadt und brauchen kein Auto. Aber heute wollen sie nach Bremen fahren, um Lauras Tante zu besuchen. Die Zugfahrkarte ist ihnen zu teuer, also haben sie online eine Mitfahrgelegenheit gebucht. Eine Frau fährt die Strecke und möchte die beiden mitnehmen. Das kostet pro Person 20 Euro. Laura sagt:' },
        { speaker: 'Frau', text: 'Da sparen wir 60 Euro! Davon können wir Tante Beate ein schönes Geschenk kaufen.' },
        { speaker: 'Mann', text: 'Hoffentlich ist die Frau eine gute Fahrerin. Ich habe etwas Angst, mich zu fremden Menschen ins Auto zu setzen.' },
        { speaker: 'Frau', text: 'Sie treffen Frau Herz am Bahnhof. Sie wartet in einem roten BMW und sagt:'},
        { speaker: 'Frau', text: 'Hallo ihr beiden, ich bin Ilse Herz. Ihr müsst hinten einsteigen. Vorn sitzt mein Wauzi – dem wird hinten immer schlecht. Na dann fahren wir mal los!' },
        { speaker: 'Frau', text: 'Wauzi ist ein dicker Mops. Er sitzt auf dem Beifahrersitz. Frau Herz fährt zügig los. Marco denkt sich:' },
        { speaker: 'Mann', text: 'Das nenne ich aber einen rasanten Start … Hoffentlich geht das nicht so weiter.' },
        { speaker: 'Frau', text: 'Auf der Autobahn tritt Frau Herz das Gaspedal voll durch. Marco wird ängstlich und fragt:' },
        { speaker: 'Mann', text: 'Äh, können wir etwas langsamer fahren?' },
        { speaker: 'Frau', text: 'Aber Frau Herz hört ihn nicht – der Motor ist zu laut. Laura wird übel und muss eine Tüte benutzen. Endlich erreichen sie Bremen. Frau Herz bremst scharf und fragt:' },
        { speaker: 'Frau', text: 'Ich fahre am Sonntagmittag wieder zurück – soll ich euch wieder mitnehmen?' },
        { speaker: 'Frau', text: 'Oh nein, danke! Wir haben schon eine Fahrkarte für die Rückreise gekauft, antworten beide schnell.'},
        { speaker: 'Mann', text: 'Und sie denken sich: Nie wieder Mitfahrgelegenheit!'}
    ],
    questions: [
        { id: 46, statement: 'Laura und Marco wollen nach Bremen fahren, um Lauras Tante zu besuchen.', correctAnswer: 'Richtig', explanationDE: '🔑 Schlüsselwörter: Bremen, Tante besuchen, Fahrtgrund → Das Ziel ihrer Reise ist klar: die Tante besuchen.', explanationFR: '🔑 Mots-clés : Bremen, Tante besuchen, Fahrtgrund → L’objectif de leur voyage est clair : rendre visite à la tante.', relevantSnippet: 'sie möchten Lauras Tante besuchen' },
        { id: 47, statement: 'Laura und Marco haben online eine Mitfahrgelegenheit gebucht.', correctAnswer: 'Richtig', explanationDE: '🔑 Schlüsselwörter: online, Mitfahrgelegenheit, gebucht → Achten Sie auf Verben, die mit Buchungen zu tun haben.', explanationFR: '🔑 Mots-clés : online, Mitfahrgelegenheit, gebucht → Écoute les verbes d’action liés à “buchen / fahren / mitnehmen”.', relevantSnippet: 'haben sie online eine Mitfahrgelegenheit gebucht' },
        { id: 48, statement: 'Laura und Marco sparen durch die Mitfahrgelegenheit insgesamt 20 Euro.', correctAnswer: 'Falsch', explanationDE: '🔑 Schlüsselwörter: sparen, 60 Euro → Falsch. Im Text sagt Laura explizit: "Da sparen wir 60 Euro!", nicht 20 Euro.', explanationFR: '🔑 Mots-clés : sparen (économiser), 60 Euro → Faux. Dans le texte, Laura dit explicitement : "Da sparen wir 60 Euro!" (Nous économisons 60 euros !), et non 20 euros.', relevantSnippet: 'Da sparen wir 60 Euro!' },
        { id: 49, statement: 'Der Kofferraum des Autos ist groß genug für ihr Gepäck.', correctAnswer: 'Falsch', explanationDE: '🔑 Schlüsselwörter: Kofferraum, klein, mit Mühe → Der Kofferraum ist klein, sie hatten Schwierigkeiten.', explanationFR: '🔑 Mots-clés : Kofferraum, klein, mit Mühe laden → Le coffre est petit, ils ont du mal à y placer leurs affaires.', relevantSnippet: 'Mit Mühe können sie ihre Reisetaschen in den kleinen Kofferraum laden.' },
        { id: 50, statement: 'Laura und Marco müssen hinten im Auto sitzen.', correctAnswer: 'Richtig', explanationDE: '🔑 Schlüsselwörter: hinten einsteigen, vorn sitzt Wauzi → Sie sitzen hinten, weil der Hund vorne ist.', explanationFR: '🔑 Mots-clés : hinten einsteigen, vorn sitzt Wauzi → Ils sont assis à l’arrière, car le chien est devant.', relevantSnippet: 'Ihr müsst hinten einsteigen.' },
        { id: 51, statement: 'Wauzi ist ein großer Schäferhund, der vorne im Auto sitzt.', correctAnswer: 'Falsch', explanationDE: '🔑 Schlüsselwörter: Wauzi, Mops, klein → Wauzi ist ein Mops, kein Schäferhund.', explanationFR: '🔑 Mots-clés : Wauzi, Mops, klein, Beifahrersitz → Wauzi ist ein dicker Mops (un carlin), pas un Schäferhund (berger allemand).', relevantSnippet: 'Wauzi ist ein dicker Mops.' },
        { id: 52, statement: 'Frau Herz fährt langsam und vorsichtig.', correctAnswer: 'Falsch', explanationDE: '🔑 Schlüsselwörter: rasant, Gaspedal, schnell, zügig → Sie fährt schnell und gefährlich, nicht vorsichtig.', explanationFR: '🔑 Mots-clés : rasant, Gaspedal, schnell, zügig losfahren → Elle conduit vite et dangereusement, pas prudemment.', relevantSnippet: 'fährt zügig los' },
        { id: 53, statement: 'Laura wird während der Fahrt schlecht und benutzt eine Plastiktüte.', correctAnswer: 'Richtig', explanationDE: '🔑 Schlüsselwörter: wird übel, Plastiktüte, benutzen → Laura fühlt sich krank und benutzt eine Tüte.', explanationFR: '🔑 Mots-clés : wird übel, Plastiktüte, benutzen → Laura se sent mal et utilise un sac plastique.', relevantSnippet: 'Laura wird übel und muss ihre Tüte benutzen.' },
        { id: 54, statement: 'Laura und Marco fühlen sich auf der Fahrt sehr wohl.', correctAnswer: 'Falsch', explanationDE: '🔑 Schlüsselwörter: Angst, unwohl, rasant → Sie sind gestresst und haben Angst.', explanationFR: '🔑 Mots-clés : Angst, unwohl, rasant fahren → Ils sont stressés, effrayés, et ne se sentent pas bien.', relevantSnippet: 'Marco tastet heimlich nach Lauras Hand – er hat Angst.' },
        { id: 55, statement: 'Laura und Marco haben beschlossen, die Rückfahrt mit Frau Herz zu machen.', correctAnswer: 'Falsch', explanationDE: '🔑 Schlüsselwörter: Rückfahrt, ablehnen, schon Fahrkarte → Sie lehnen höflich ab und wollen nicht mehr mitfahren.', explanationFR: '🔑 Mots-clés : Rückfahrt, ablehnen, schon Fahrkarte gekauft → Ils refusent poliment et ne veulent plus refaire le trajet.', relevantSnippet: 'Oh nein, danke!' }
    ]
};

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


const GuideSection: React.FC = () => (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/50 border-l-4 border-purple-400 rounded-r-lg space-y-4">
        <h3 className="font-bold text-lg text-purple-800 dark:text-purple-300">🧭 Explication Hörverstehen Teil 2 – Ein Gespräch verstehen</h3>
        <p><strong>💡 Objectif :</strong> Apprendre à analyser une conversation (dialogue radio, interview, etc.) au format Telc B1.</p>
        <details className="space-y-2">
            <summary className="font-bold cursor-pointer">🔑 1. Avant l’écoute – Phase de préparation</summary>
            <div className="pl-4 pt-2 text-sm space-y-1">
                <p><strong>Lire toutes les phrases (Aussagen 46–55)</strong> avant le début de l’audio pour savoir quoi chercher.</p>
                <p><strong>Souligner les mots-clés :</strong> Personnes, lieux, chiffres, sentiments, actions.</p>
                <p><strong>Chercher les oppositions possibles</strong> (schnell ≠ langsam, klein ≠ groß).</p>
                <p><strong>📍 Conseil :</strong> Note mentalement les mots-clés à écouter avant que l’audio ne commence.</p>
            </div>
        </details>
         <details className="space-y-2">
            <summary className="font-bold cursor-pointer">🎧 2. Première écoute – Compréhension globale</summary>
            <div className="pl-4 pt-2 text-sm space-y-1">
                 <p>Essaie de comprendre le <strong>contexte général :</strong> Qui parle ? Où ? Pourquoi ?</p>
                 <p>Concentre-toi sur les <strong>voix et émotions</strong>. Une voix nerveuse peut indiquer du stress.</p>
            </div>
        </details>
        <details className="space-y-2">
            <summary className="font-bold cursor-pointer">🔁 3. Deuxième écoute – Vérification précise</summary>
            <div className="pl-4 pt-2 text-sm space-y-1">
                 <p>Réécoute en te concentrant sur les <strong>mots-clés repérés</strong>.</p>
                 <p>Compare les phrases entendues avec les affirmations. Si le sens est différent, la réponse est <strong>❌ falsch</strong>.</p>
                 <p>Vérifie les <strong>négations :</strong> nicht, kein, nie, ohne changent souvent le sens.</p>
            </div>
        </details>
        <details className="space-y-2">
            <summary className="font-bold cursor-pointer">📈 4. Stratégies “Telc B1 – Teil 2”</summary>
            <div className="pl-4 pt-2 text-sm space-y-1">
                 <p>✅ <strong>Astuce 1 :</strong> Identifier <strong>wer spricht über was</strong> (qui parle de quoi).</p>
                 <p>✅ <strong>Astuce 2 :</strong> Se concentrer sur les <strong>verbes d’action</strong> (fahren, sparen, sitzen).</p>
                 <p>✅ <strong>Astuce 3 :</strong> Écouter les <strong>connecteurs logiques</strong> (aber, deshalb, trotzdem).</p>
                 <p>✅ <strong>Astuce 4 :</strong> Ne panique pas si tu ne comprends pas tout – vise le <strong>sens global</strong>.</p>
            </div>
        </details>
    </div>
);


interface HoerverstehenTeil2ExampleProps {
  onStartTraining: () => void;
  onBack: () => void;
}

const HoerverstehenTeil2Example: React.FC<HoerverstehenTeil2ExampleProps> = ({ onStartTraining }) => {
    const [exerciseData, setExerciseData] = useState<HoerverstehenTeil2ExerciseData>(initialStaticData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<number, 'Richtig' | 'Falsch' | null>>(Object.fromEntries(initialStaticData.questions.map(q => [q.id, null])));
    const [showTranscription, setShowTranscription] = useState(false);
    
    // Audio State
    const [playCount, setPlayCount] = useState(0);
    const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
    const [dialogueBuffer, setDialogueBuffer] = useState<AudioBuffer | null>(null);
    const [playingSnippetState, setPlayingSnippetState] = useState<{ id: number; status: 'loading' | 'playing' } | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const stopAllAudio = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.onended = null;
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setAudioState(prev => prev === 'playing' ? 'idle' : prev);
        setPlayingSnippetState(null);
    }, []);

    useEffect(() => {
        return () => stopAllAudio();
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
        if (audioState === 'playing') {
            stopAllAudio();
            return;
        }
        if (audioState === 'generating' || playCount >= 2) {
            return;
        }

        if (dialogueBuffer) {
            setAudioState('playing');
            playBuffer(dialogueBuffer, () => setAudioState('idle'));
            setPlayCount(p => p + 1);
        } else {
            setAudioState('generating');
            try {
                const base64Audio = await generateHoerverstehenTeil2Audio(exerciseData.dialogue);
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
                setDialogueBuffer(buffer);
                setAudioState('playing');
                playBuffer(buffer, () => setAudioState('idle'));
                setPlayCount(p => p + 1);
            } catch (err) {
                console.error(err);
                setError("Fehler bei der Audiowiedergabe.");
                setAudioState('idle');
            }
        }
    }, [audioState, playCount, dialogueBuffer, exerciseData.dialogue, playBuffer, stopAllAudio]);

    const handlePlaySnippet = useCallback(async (question: typeof exerciseData.questions[0]) => {
        if (playingSnippetState?.id === question.id) {
            stopAllAudio();
            return;
        }
        stopAllAudio();
        setPlayingSnippetState({ id: question.id, status: 'loading' });
        
        try {
            const turn = exerciseData.dialogue.find(t => t.text.includes(question.relevantSnippet));
            const speaker = turn ? turn.speaker : 'Frau';
            const base64Audio = await generateSingleSnippetAudio(question.relevantSnippet, speaker);
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);

            setPlayingSnippetState({ id: question.id, status: 'playing' });
            playBuffer(buffer, () => setPlayingSnippetState(null));
        } catch (err) {
            console.error(err);
            setError("Fehler beim Abspielen des Snippets.");
            setPlayingSnippetState(null);
        }
    }, [exerciseData.dialogue, playBuffer, playingSnippetState, stopAllAudio]);


    const handleAnswerChange = (id: number, answer: 'Richtig' | 'Falsch') => {
        if (answers[id]) return; // Lock answer after first choice
        setAnswers(prev => ({ ...prev, [id]: answer }));
    };

    const handleGenerateNew = async () => {
        setIsLoading(true);
        setError(null);
        stopAllAudio();
        try {
            const newData = await generateHoerverstehenTeil2Exercise();
            setExerciseData(newData);
            setAnswers(Object.fromEntries(newData.questions.map(q => [q.id, null])));
            setPlayCount(0);
            setAudioState('idle');
            setDialogueBuffer(null);
            setShowTranscription(false);
        } catch (err) {
            setError('Erreur: Nouvel exercice n\'a pas pu être généré. Veuillez réessayer.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const getPlayButtonContent = () => {
        switch(audioState) {
            case 'idle': return { icon: 'play', text: 'Écouter' };
            case 'generating': return { icon: 'spinner', text: 'Génère...' };
            case 'playing': return { icon: 'stop', text: 'Arrêter' };
        }
    };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">🧠 Explication Hörverstehen Teil 2 – Ein Gespräch verstehen</h2>
            
            <GuideSection />
            
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-2">
                <p><strong>Thème:</strong> {isLoading ? "Chargement..." : exerciseData.thema}</p>
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlayPause} disabled={(playCount >= 2 && audioState === 'idle') || audioState === 'generating' || isLoading} className="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-slate-400 flex items-center gap-2">
                            {audioState === 'generating' ? <Spinner /> : <i className={`fas fa-${getPlayButtonContent().icon}`}></i>}
                            {getPlayButtonContent().text}
                        </button>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Écoutes restantes: {2 - playCount}</span>
                    </div>
                    <button onClick={() => setShowTranscription(!showTranscription)} disabled={isLoading} className="text-sm px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center gap-2">
                        {showTranscription ? '❌ Fermer la transcription' : '📜 Voir la transcription'}
                    </button>
                </div>

                {showTranscription && !isLoading && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg max-h-60 overflow-y-auto animate-fade-in border border-slate-200 dark:border-slate-600">
                        <h4 className="font-bold mb-2 text-base">📜 Transcription</h4>
                        <div className="text-sm space-y-2" style={{ lineHeight: 1.5 }}>
                            {exerciseData.dialogue.map((turn, index) => (
                                <p key={index}>
                                    <strong>{turn.speaker}:</strong> {turn.text}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {isLoading ? <div className="flex justify-center p-8"><Spinner/></div> :
            <div className="space-y-4">
                {exerciseData.questions.map(q => {
                    const userAnswer = answers[q.id];
                    const isAnswered = userAnswer !== null;
                    const isCorrect = userAnswer === q.correctAnswer;
                    const snippetState = playingSnippetState?.id === q.id ? playingSnippetState.status : 'idle';

                    return (
                        <div key={q.id} className={`p-4 border-l-4 rounded-r-lg ${isAnswered ? (isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/40' : 'border-red-500 bg-red-50 dark:bg-red-900/40') : 'border-slate-200 dark:border-slate-600'}`}>
                            <p className="font-semibold">{q.id}. {q.statement}</p>
                            <div className="flex gap-4 mt-2">
                                <button onClick={() => handleAnswerChange(q.id, 'Richtig')} disabled={isAnswered} className={`px-4 py-2 rounded-md font-semibold transition-colors ${isAnswered && q.correctAnswer === 'Richtig' ? 'bg-green-200 dark:bg-green-700' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300'}`}>✅ Richtig</button>
                                <button onClick={() => handleAnswerChange(q.id, 'Falsch')} disabled={isAnswered} className={`px-4 py-2 rounded-md font-semibold transition-colors ${isAnswered && q.correctAnswer === 'Falsch' ? 'bg-green-200 dark:bg-green-700' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300'}`}>❌ Falsch</button>
                            </div>
                            {isAnswered && (
                                <div className="mt-3 text-sm animate-fade-in p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-2">
                                    <p><strong>{isCorrect ? '✅ Sehr gut!' : '❌ Pas tout à fait.'}</strong> La bonne réponse est <strong>{q.correctAnswer}</strong>.</p>
                                    <div>
                                        <p><strong>💡 Explication :</strong></p>
                                        <p className="pl-2" style={{ whiteSpace: 'pre-wrap' }}>🇩🇪 {q.explanationDE}</p>
                                        <p className="pl-2" style={{ whiteSpace: 'pre-wrap' }}>🇫🇷 {q.explanationFR}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Réécouter le passage concerné :</span>
                                        <button onClick={() => handlePlaySnippet(q)} disabled={snippetState !== 'idle'} className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400">
                                            {snippetState === 'loading' ? <Spinner /> : <i className={`fas fa-${snippetState === 'playing' ? 'stop' : 'play'}`}></i>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            }

            {error && <p className="text-center text-red-500">{error}</p>}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleGenerateNew} disabled={isLoading} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center gap-2">
                   {isLoading ? <Spinner /> : '🆕 Nouvel exercice'}
                </button>
                 <button onClick={onStartTraining} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    ▶️ Passer en mode Examen
                </button>
            </div>
        </div>
    );
};

export default HoerverstehenTeil2Example;