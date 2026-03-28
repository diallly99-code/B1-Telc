import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HoerverstehenTeil2ExerciseData, HoerverstehenTeil2DialogueTurn } from '../../types';
import { generateHoerverstehenTeil2Exercise, generateHoerverstehenTeil2Audio, generateSingleSnippetAudio } from '../../services/geminiService';
import Spinner from '../Spinner';

const initialData: HoerverstehenTeil2ExerciseData = {
    thema: 'Ein Gespräch im Radiostudio über einen Sportverein',
    dialogue: [
        { speaker: 'Journalist', text: 'Der Turn- und Sportverein Neustadt wird in diesem Jahr 100 Jahre alt und feiert diesen Geburtstag mit einem großen Programm. Ich begrüße dazu heute hier im Studio eine Vertreterin des Turn- und Sportvereins Neustadt, Frau Seiffert. Guten Tag!' },
        { speaker: 'Frau Seiffert', text: 'Guten Tag!' },
        { speaker: 'Journalist', text: 'Frau Seiffert, welche Aufgaben haben Sie denn im Verein?' },
        { speaker: 'Frau Seiffert', text: 'Ja, also ich führe bei allen Sitzungen Protokoll. Ich schreibe also alles auf, worüber diskutiert wird und was beschlossen wird. Schriftführerin heißt das.' },
        { speaker: 'Journalist', text: 'Aha. Vielleicht liegen Ihnen als Schriftführerin da sogar noch Papiere aus den ersten Vereinsjahren vor...?' },
        { speaker: 'Frau Seiffert', text: 'Ja, so ist es. Unsere Kollegen früher waren nämlich äußerst sorgfältig. So konnten wir in unserer Festzeitung zum 100. Geburtstag das Programm von der ersten Hauptversammlung des Vereins veröffentlichen. Das macht sich sehr nett.' },
        { speaker: 'Journalist', text: 'Unglaublich, dass trotz der zwei Kriege in diesem Jahrhundert solche Papiere und Unterlagen noch vorhanden sind. Also, ich nehme mal an, als Ihr Verein vor 100 Jahren gegründet wurde, war Sport doch sicher nur eine Sache für Männer?' },
        { speaker: 'Frau Seiffert', text: 'Ja, klar. Am Anfang war Sport reine Männersache. Es hat 16 Jahre gedauert, bis bei uns die ersten Frauen dazukamen. Das war ein echter Fortschritt für die Zeit damals, Anfang des 20. Jahrhunderts.' },
        { speaker: 'Journalist', text: 'Ja, das kann man sich gut vorstellen. Wie viele Frauen haben Sie denn heute im Verein im Vergleich zu Männern?' },
        { speaker: 'Frau Seiffert', text: 'Ja, also heute sind es ziemlich viele. Über 50 Prozent der Mitglieder sind Frauen, d. h. mehr als 1000 der insgesamt 2000 Mitglieder.' },
        { speaker: 'Journalist', text: 'Ihr Verein hat ja hier in Neustadt eine schöne Anlage mit Sportplätzen im Freien und einer großen Halle. Wer finanziert denn das eigentlich alles?' },
        { speaker: 'Frau Seiffert', text: 'Ja, also 50 Prozent des Geldes, das wir brauchen, bekommen wir durch unsere Mitglieder, in Form von Mitgliedsbeiträgen, den Rest bekommen wir von der Stadt und vom Deutschen Sportbund dazu.' },
        { speaker: 'Journalist', text: 'Wenn man sich Ihr Angebot ansieht, dann staunt man. Da gibt es alles, was zur Zeit gefragt ist: von Aerobic über sportliches Gehen bis hin zu Mutter-Kind-Gymnastik.' },
        { speaker: 'Frau Seiffert', text: 'Ja, das stimmt. Im Grunde genommen bieten wir fast jede Sportart an, außer Schwimmen. Es gibt im Nachbarort ein großes Schwimmbad mit einem Extra-Schwimmverein. Also, da wäre es Unsinn, wenn wir eine eigene Abteilung für Schwimmen aufmachen würden.' },
        { speaker: 'Journalist', text: 'Woher kommen denn Ihre Trainer und die Lehrer für alle diese vielen Sportarten?' },
        { speaker: 'Frau Seiffert', text: 'Ja, also die meisten kommen aus dem Verein selber. Wir bilden ja viele Leute aus, die später Sport studieren oder Leistungssport machen. Diese Leute bitten wir oft, im eigenen Verein zu unterrichten.' },
        { speaker: 'Journalist', text: 'Ja, klar – so bleiben Ihnen die Talente praktisch erhalten. Frau Seiffert, ich bedanke mich für Ihren Besuch hier im Studio und wünsche Ihrem Verein auch für die nächsten 100 Jahre alles Gute.' },
        { speaker: 'Frau Seiffert', text: 'Danke.' }
    ],
    questions: [
        { id: 46, statement: 'Der Sportverein plant eine große Feier.', correctAnswer: 'Richtig', explanationDE: 'Richtig, der Verein feiert seinen 100. Geburtstag mit einem großen Programm.', explanationFR: 'Le club fête son 100e anniversaire avec un grand programme.', relevantSnippet: 'Der Turn- und Sportverein Neustadt wird in diesem Jahr 100 Jahre alt und feiert diesen Geburtstag mit einem großen Programm.' },
        { id: 47, statement: 'Der Journalist spricht mit einem Vertreter des Vereins.', correctAnswer: 'Falsch', explanationDE: 'Falsch, er spricht mit einer Vertreterin, Frau Seiffert.', explanationFR: 'Il parle avec une représentante, Frau Seiffert.', relevantSnippet: 'Ich begrüße dazu heute hier im Studio eine Vertreterin des Turn- und Sportvereins Neustadt, Frau Seiffert.' },
        { id: 48, statement: 'Viele alte Dokumente sind im Krieg verloren gegangen.', correctAnswer: 'Falsch', explanationDE: 'Falsch, die Dokumente sind trotz der Kriege noch vorhanden.', explanationFR: 'Les anciens documents ont été conservés malgré les guerres.', relevantSnippet: 'Unglaublich, dass trotz der zwei Kriege in diesem Jahrhundert solche Papiere und Unterlagen noch vorhanden sind.' },
        { id: 49, statement: 'Der Verein veröffentlicht jedes Jahr eine Festzeitung.', correctAnswer: 'Falsch', explanationDE: 'Falsch, es war eine spezielle Festzeitung zum 100. Geburtstag.', explanationFR: 'C’était une édition spéciale pour le centenaire.', relevantSnippet: 'So konnten wir in unserer Festzeitung zum 100. Geburtstag das Programm von der ersten Hauptversammlung des Vereins veröffentlichen.' },
        { id: 50, statement: 'Der Verein hatte von Anfang an Frauen als Mitglieder.', correctAnswer: 'Falsch', explanationDE: 'Falsch, die ersten Frauen kamen erst 16 Jahre später dazu.', explanationFR: 'Les femmes sont venues 16 ans plus tard.', relevantSnippet: 'Es hat 16 Jahre gedauert, bis bei uns die ersten Frauen dazukamen.' },
        { id: 51, statement: 'Heute gibt es mehr Frauen als Männer im Verein.', correctAnswer: 'Richtig', explanationDE: 'Richtig, über 50 Prozent der Mitglieder sind Frauen.', explanationFR: 'Plus de 50 % des membres sont des femmes.', relevantSnippet: 'Über 50 Prozent der Mitglieder sind Frauen, d. h. mehr als 1000 der insgesamt 2000 Mitglieder.' },
        { id: 52, statement: 'Im Verein kann man Sport im Freien und in der Halle treiben.', correctAnswer: 'Richtig', explanationDE: 'Richtig, der Verein hat Sportplätze im Freien und eine große Halle.', explanationFR: 'Il y a des terrains extérieurs et une grande salle.', relevantSnippet: 'Ihr Verein hat ja hier in Neustadt eine schöne Anlage mit Sportplätzen im Freien und einer großen Halle.' },
        { id: 53, statement: 'Die Mitglieder bezahlen alle Kosten allein.', correctAnswer: 'Falsch', explanationDE: 'Falsch, der Verein wird auch von der Stadt und dem Sportbund finanziert.', explanationFR: 'Le club reçoit aussi des subventions publiques (de la ville et de la fédération sportive).', relevantSnippet: 'den Rest bekommen wir von der Stadt und vom Deutschen Sportbund dazu.' },
        { id: 54, statement: 'Der Verein bietet auch Schwimmen an.', correctAnswer: 'Falsch', explanationDE: 'Falsch, Schwimmen wird nicht angeboten, da es einen anderen Verein dafür gibt.', explanationFR: 'Il ne propose pas de natation car un autre club le fait déjà.', relevantSnippet: 'Im Grunde genommen bieten wir fast jede Sportart an, außer Schwimmen.' },
        { id: 55, statement: 'Einige Ausgebildete arbeiten später als Lehrer im Verein.', correctAnswer: 'Richtig', explanationDE: 'Richtig, einige Mitglieder, die im Verein ausgebildet wurden, unterrichten später dort.', explanationFR: 'Certains membres formés par le club reviennent y enseigner.', relevantSnippet: 'Diese Leute bitten wir oft, im eigenen Verein zu unterrichten.' }
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


interface HoerverstehenTeil2ExerciseProps {
  onComplete: (score: { correct: number; total: number }) => void;
}

const HoerverstehenTeil2Exercise: React.FC<HoerverstehenTeil2ExerciseProps> = ({ onComplete }) => {
    const [exerciseData, setExerciseData] = useState<HoerverstehenTeil2ExerciseData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [answers, setAnswers] = useState<Record<number, 'Richtig' | 'Falsch'>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
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
        if (audioState === 'generating' || (playCount >= 2 && !dialogueBuffer)) {
            return;
        }

        if (dialogueBuffer) {
            setAudioState('playing');
            playBuffer(dialogueBuffer, () => setAudioState('idle'));
            if(playCount < 2 && !isSubmitted) setPlayCount(p => p + 1);
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
                if(playCount < 2 && !isSubmitted) setPlayCount(p => p + 1);
            } catch (err) {
                console.error(err);
                setError("Fehler bei der Audiowiedergabe.");
                setAudioState('idle');
            }
        }
    }, [audioState, playCount, isSubmitted, dialogueBuffer, exerciseData.dialogue, playBuffer]);
    
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
        if (isSubmitted) return;
        setAnswers(prev => ({ ...prev, [id]: answer }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        stopAllAudio();
        let correctCount = 0;
        exerciseData.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });
        onComplete({ correct: correctCount, total: exerciseData.questions.length });
    };

    const handleGenerateNew = async () => {
        setIsLoading(true);
        setError(null);
        stopAllAudio();
        try {
            const newData = await generateHoerverstehenTeil2Exercise();
            setExerciseData(newData);
            setAnswers({});
            setIsSubmitted(false);
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
        <div className="space-y-6">
            <h3 className="text-xl font-bold">Hörverstehen Teil 2 – Ein Gespräch verstehen</h3>

            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-2">
                <p><strong>Consigne:</strong> Sie hören ein Gespräch. Dazu lösen Sie zehn Aufgaben. Entscheiden Sie, ob die Aussagen richtig oder falsch sind.</p>
                <div className="flex flex-col items-start gap-2">
                     <div className="flex items-center gap-4">
                         <button onClick={handlePlayPause} disabled={(playCount >= 2 && audioState === 'idle') || audioState === 'generating'} className="px-5 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-slate-400 flex items-center gap-2">
                            {audioState === 'generating' ? <Spinner /> : <i className={`fas fa-${getPlayButtonContent().icon}`}></i>}
                            {getPlayButtonContent().text}
                        </button>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Écoutes restantes: {2 - playCount}</span>
                    </div>
                    <button onClick={() => setShowTranscription(!showTranscription)} className="text-sm px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center gap-2">
                        {showTranscription ? '❌ Fermer la transcription' : '📜 Voir la transcription'}
                    </button>
                </div>

                {showTranscription && (
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

            <div className="space-y-4">
                {exerciseData.questions.map(q => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    const snippetState = playingSnippetState?.id === q.id ? playingSnippetState.status : 'idle';

                    return (
                        <div key={q.id} className={`p-4 border-l-4 rounded-r-lg ${isSubmitted ? (isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/40' : 'border-red-500 bg-red-50 dark:bg-red-900/40') : 'border-slate-200 dark:border-slate-600'}`}>
                            <p className="font-semibold">{q.id}. {q.statement}</p>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`q-${q.id}`} checked={userAnswer === 'Richtig'} onChange={() => handleAnswerChange(q.id, 'Richtig')} disabled={isSubmitted} />
                                    Richtig (+)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name={`q-${q.id}`} checked={userAnswer === 'Falsch'} onChange={() => handleAnswerChange(q.id, 'Falsch')} disabled={isSubmitted} />
                                    Falsch (-)
                                </label>
                            </div>
                            {isSubmitted && (
                                <div className="mt-3 text-sm animate-fade-in">
                                    {isCorrect ? (
                                        <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-lg space-y-1">
                                            <p><strong>✅ Richtig!</strong></p>
                                            <p>🇩🇪 {q.explanationDE}</p>
                                            <p>🇫🇷 {q.explanationFR}</p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-red-100 dark:bg-red-800/50 rounded-lg space-y-2">
                                            <p><strong>❌ Falsch – Hör dir diesen Teil noch einmal an.</strong></p>
                                            <p className="text-xs text-slate-500 italic mb-1">(Faux - réécoute le passage suivant.)</p>
                                            
                                            <p className="italic my-1 p-2 bg-slate-200 dark:bg-slate-700 rounded">📜 "{q.relevantSnippet}"</p>
                                            
                                            <button onClick={() => handlePlaySnippet(q)} disabled={snippetState !== 'idle'} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400">
                                                {snippetState === 'loading' ? <Spinner /> : <i className={`fas fa-${snippetState === 'playing' ? 'stop' : 'play'}`}></i>}
                                                {snippetState === 'idle' ? 'Passage anhören' : snippetState === 'loading' ? 'Génère...' : 'Arrêter'}
                                            </button>
                                            
                                            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                                                <p><strong>💡 Erklärung:</strong></p>
                                                <p>🇩🇪 {q.explanationDE}</p>
                                                <p>🇫🇷 {q.explanationFR}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {error && <p className="text-center text-red-500">{error}</p>}
            
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {!isSubmitted ? (
                     <button onClick={handleSubmit} disabled={Object.keys(answers).length < exerciseData.questions.length} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                        Korrigieren / Corriger
                    </button>
                ) : (
                    <button onClick={handleGenerateNew} disabled={isLoading} className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center gap-2">
                       {isLoading ? <Spinner /> : '🆕 Nouvel exercice'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HoerverstehenTeil2Exercise;