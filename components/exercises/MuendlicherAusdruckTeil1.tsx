import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { PresentationAnswers, ChatMessage, MuendlichAnswerKey } from '../../types';
import { generateFullDialogue } from '../../services/geminiService';
import Spinner from '../Spinner';

// --- Types and Constants ---
interface QuestionConfig {
  id: MuendlichAnswerKey;
  label: string;
  questionDE: string;
  questionFR: string;
  template: string;
  suggestions: string[];
}

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


const QUESTION_CONFIG: QuestionConfig[] = [
    { 
        id: 'name', 
        label: 'Name', 
        questionDE: 'Wie heißen Sie?', 
        questionFR: 'Comment vous appelez-vous ?',
        template: 'Ich heiße _______________.', 
        suggestions: [
            'Ich heiße Maria Conte.',
            'Ich heiße Ali Demir.',
            'Ich heiße Abdoulaye Keita.',
            'Ich heiße Lena Schmidt.',
            'Ich heiße Fatima Diallo.'
        ] 
    },
    { 
        id: 'nameDetails', 
        label: 'Vorname & Nachname', 
        questionDE: 'Wie ist Ihr Vorname und Nachname?', 
        questionFR: 'Quel est votre prénom et nom ?',
        template: '_______________ ist mein Vorname und _______________ ist mein Nachname.', 
        suggestions: [
            'Maria ist mein Vorname und Conte ist mein Nachname.',
            'Ali ist mein Vorname und Demir ist mein Nachname.',
            'Lena ist mein Vorname und Schmidt ist mein Nachname.',
            'Abdoulaye ist mein Vorname und Keita ist mein Nachname.',
            'Fatima ist mein Vorname und Diallo ist mein Nachname.',
            'Abdoulaye ist mein Vorname und Keita ist mein Familienname.'
        ] 
    },
    { 
        id: 'origin', 
        label: 'Herkunft', 
        questionDE: 'Woher kommen Sie?',
        questionFR: 'D’où venez-vous ?',
        template: 'Ich komme aus _______________ (Land), aus _______________ (Stadt/Dorf/Region).', 
        suggestions: [
            'Ich komme aus Italien, aus Rom.',
            'Ich komme aus der Türkei, aus Izmir.',
            'Ich komme aus Guinea, aus Conakry.',
            'Ich komme aus Deutschland, aus München.',
            'Ich komme aus Frankreich, aus Lyon.'
        ] 
    },
    { 
        id: 'cityDescription', 
        label: 'Stadt beschreiben', 
        questionDE: 'Wie ist Ihre Stadt?',
        questionFR: 'Comment est votre ville ?',
        template: '_______________ ist eine _______________ Stadt.', 
        suggestions: [
            'Rom ist eine alte und schöne Stadt.',
            'Izmir ist eine große und moderne Stadt.',
            'Conakry ist eine kleine, aber lebendige Stadt.',
            'München ist eine reiche und bekannte Stadt.',
            'Lyon ist eine interessante und historische Stadt.'
        ] 
    },
    { 
        id: 'personalDetails', 
        label: 'Alter / Familienstand / Kinder', 
        questionDE: 'Wie alt sind Sie? Sind Sie verheiratet? Haben Sie Kinder?',
        questionFR: 'Quel âge avez-vous ? Êtes-vous marié(e) ? Avez-vous des enfants ?',
        template: 'Ich bin _______________ Jahre alt, _______________ und ich habe _______________.', 
        suggestions: [
            'Ich bin 25 Jahre alt, ledig und ich habe keine Kinder.',
            'Ich bin 30 Jahre alt, verheiratet und ich habe zwei Kinder.',
            'Ich bin 40 Jahre alt, geschieden und ich habe ein Kind.',
            'Ich bin 55 Jahre alt, verwitwet und ich habe keine Kinder.',
            'Ich bin 18 Jahre alt, ledig und ich habe keine Kinder.'
        ] 
    },
    { 
        id: 'familie', 
        label: 'Familie', 
        questionDE: 'Erzählen Sie bitte über Ihre Familie.',
        questionFR: 'Parlez de votre famille.',
        template: 'In meiner Familie gibt es _______________.', 
        suggestions: [
            'Ich habe eine kleine Familie: meine Frau und zwei Kinder.',
            'Ich lebe mit meinen Eltern und Geschwistern zusammen.',
            'Meine Familie lebt in meinem Heimatland, ich bin allein in Deutschland.',
            'Ich habe eine große Familie mit vielen Cousins und Cousinen.',
            'Ich habe nur wenige Verwandte, aber wir haben guten Kontakt.'
        ] 
    },
    { 
        id: 'wohnSituation', 
        label: 'Wohnsituation', 
        questionDE: 'Wie wohnen Sie?',
        questionFR: 'Comment habitez-vous ?',
        template: 'Ich wohne in _______________.', 
        suggestions: [
            'Ich wohne in einer kleinen Wohnung in der Stadt.',
            'Ich wohne in einem Haus mit Garten.',
            'Ich wohne in einem Studentenheim.',
            'Ich wohne allein in einer Mietwohnung.',
            'Ich wohne in einer Wohngemeinschaft mit Freunden.'
        ] 
    },
    { 
        id: 'residence', 
        label: 'Wohnzeit in Deutschland', 
        questionDE: 'Seit wann leben Sie in Deutschland?',
        questionFR: 'Depuis quand vivez-vous en Allemagne ?',
        template: 'Ich wohne in Deutschland seit _______________.', 
        suggestions: [
            'Ich wohne in Deutschland seit 2 Jahren.',
            'Ich wohne in Deutschland seit 6 Monaten.',
            'Ich wohne in Deutschland seit 10 Jahren.',
            'Ich wohne in Deutschland seit 3 Wochen.',
            'Ich wohne in Deutschland seit 5 Jahren.'
        ] 
    },
    { 
        id: 'profession', 
        label: 'Beruf / Tätigkeit',
        questionDE: 'Was machen Sie?',
        questionFR: 'Que faites-vous dans la vie ?',
        template: 'Ich bin _______________ von Beruf. In meiner Heimat habe ich _______________ gearbeitet.', 
        suggestions: [
            'Ich bin Lehrer von Beruf. In meiner Heimat habe ich an einer Schule gearbeitet.',
            'Ich bin Ingenieurin von Beruf. In meiner Heimat habe ich in einer Firma gearbeitet.',
            'Ich bin Hausfrau. In meiner Heimat habe ich mich um meine Familie gekümmert.',
            'Ich bin Schüler. In meiner Heimat habe ich die Schule besucht.',
            'Ich habe zurzeit keinen Beruf, aber ich suche Arbeit.'
        ] 
    },
    { 
        id: 'education', 
        label: 'Bildung', 
        questionDE: 'Welche Schule oder Universität haben Sie besucht?',
        questionFR: 'Quelles études avez-vous faites ?',
        template: 'Ich habe in meiner Heimat _______________ besucht.', 
        suggestions: [
            'Ich habe in meiner Heimat die Schule besucht.',
            'Ich habe in meiner Heimat die Universität besucht.',
            'Ich habe in meiner Heimat ein Gymnasium besucht.',
            'Ich habe eine Ausbildung gemacht.',
            'Ich habe keine Universität besucht, nur die Schule.'
        ] 
    },
    { 
        id: 'germanLearning', 
        label: 'Wo Deutsch gelernt', 
        questionDE: 'Wo haben Sie Deutsch gelernt?',
        questionFR: 'Où avez-vous appris l’allemand ?',
        template: 'Ich habe Deutsch _______________ gelernt.', 
        suggestions: [
            'Ich habe Deutsch in der Schule gelernt.',
            'Ich habe Deutsch an der Universität gelernt.',
            'Ich habe Deutsch in einem Sprachkurs gelernt.',
            'Ich habe Deutsch selbst gelernt, mit Büchern und Apps.',
            'Ich habe Deutsch im Alltag gelernt, mit Freunden und Kollegen.'
        ] 
    },
    { 
        id: 'languages', 
        label: 'Sprachen', 
        questionDE: 'Welche Sprachen sprechen Sie?',
        questionFR: 'Quelles langues parlez-vous ?',
        template: 'Ich spreche _______________, _______________ und natürlich Deutsch.', 
        suggestions: [
            'Ich spreche Italienisch, Englisch und natürlich Deutsch.',
            'Ich spreche Türkisch, Arabisch und natürlich Deutsch.',
            'Ich spreche Französisch, Englisch und natürlich Deutsch.',
            'Ich spreche Spanisch, Portugiesisch und natürlich Deutsch.',
            'Ich spreche Französisch, Englisch und ein bisschen Deutsch.'
        ] 
    },
    { 
        id: 'motherTongue', 
        label: 'Muttersprache', 
        questionDE: 'Was ist Ihre Muttersprache?',
        questionFR: 'Quelle est votre langue maternelle ?',
        template: '_______________ ist meine Muttersprache.', 
        suggestions: [
            'Italienisch ist meine Muttersprache.',
            'Französisch ist meine Muttersprache.',
            'Türkisch ist meine Muttersprache.',
            'Arabisch ist meine Muttersprache.',
            'Malinke ist meine Muttersprache.'
        ] 
    },
    { 
        id: 'hobbies', 
        label: 'Interessen/Hobbys', 
        questionDE: 'Was sind Ihre Hobbys?',
        questionFR: 'Quels sont vos loisirs ?',
        template: 'Ich interessiere mich für _______________, _______________ und _______________.', 
        suggestions: [
            'Ich interessiere mich für Musik, Reisen und Lesen.',
            'Ich interessiere mich für Fußball, Kochen und Tanzen.',
            'Ich interessiere mich für Natur, Filme und Malerei.',
            'Ich interessiere mich für Politik, Geschichte und Sprachen.',
            'Ich interessiere mich für Sport, Familie und Religion.',
            'In meiner Freizeit lese ich gern Bücher und gehe spazieren.',
            'In meiner Freizeit treffe ich Freunde und spiele Fußball.',
            'In meiner Freizeit höre ich Musik und schaue Filme.',
            'In meiner Freizeit koche ich gern und gehe einkaufen.',
            'In meiner Freizeit mache ich Sport und fotografiere.'
        ] 
    },
    { 
        id: 'futurePlans', 
        label: 'Pläne nach der B1-Prüfung',
        questionDE: 'Was möchten Sie nach der Prüfung machen?',
        questionFR: 'Que voulez-vous faire après l’examen B1 ?',
        template: 'Nach der B1-Prüfung möchte ich _______________.', 
        suggestions: [
            'Nach der B1-Prüfung möchte ich einen B2-Kurs besuchen.',
            'Nach der B1-Prüfung möchte ich eine Ausbildung machen.',
            'Nach der B1-Prüfung möchte ich studieren.',
            'Nach der B1-Prüfung möchte ich arbeiten.',
            'Nach der B1-Prüfung möchte ich eine Reise machen.',
            'Nach der B1-Prüfung möchte ich eine Ausbildung als Krankenpfleger machen.'
        ] 
    },
];


// --- Main Component ---
const MuendlicherAusdruckTeil1: React.FC = () => {
    const [phase, setPhase] = useState<'build' | 'review'>('build');
    const [userProfile, setUserProfile] = useState<PresentationAnswers>({});
    const [fullDialogue, setFullDialogue] = useState<ChatMessage[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateDialogue = async (answers: PresentationAnswers) => {
        setIsLoading(true);
        setError(null);
        setFullDialogue(null);
        setUserProfile(answers);
        try {
            const dialogue = await generateFullDialogue(answers);
            setFullDialogue(dialogue);
            setPhase('review');
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création du dialogue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditPresentation = () => {
        setPhase('build');
        setFullDialogue(null);
        setError(null);
    };

    const handleStartOver = () => {
        setPhase('build');
        setFullDialogue(null);
        setUserProfile({});
        setError(null);
    }

    if (phase === 'build') {
        return (
            <PresentationBuilder
                initialAnswers={userProfile}
                onGenerateDialogue={handleGenerateDialogue}
                onStartOver={handleStartOver}
                isLoading={isLoading}
                error={error}
            />
        );
    }
    
    if (phase === 'review' && fullDialogue) {
        return (
            <DialogueReview
                dialogue={fullDialogue}
                onEditPresentation={handleEditPresentation}
                onGenerateNew={() => handleGenerateDialogue(userProfile)}
                isLoading={isLoading}
            />
        );
    }

    return (
        <div className="flex justify-center items-center p-8">
            {isLoading ? <Spinner /> : <p className="text-red-500">{error || "Une erreur inattendue est survenue."}</p>}
        </div>
    );
};


// --- Sub-Component for Presentation Building ---
interface PresentationBuilderProps {
    initialAnswers: PresentationAnswers;
    onGenerateDialogue: (answers: PresentationAnswers) => void;
    onStartOver: () => void;
    isLoading: boolean;
    error: string | null;
}
const PresentationBuilder: React.FC<PresentationBuilderProps> = ({ initialAnswers, onGenerateDialogue, onStartOver, isLoading, error }) => {
    const [answers, setAnswers] = useState<PresentationAnswers>(initialAnswers);
    const [showPresentation, setShowPresentation] = useState(false);
    
    useEffect(() => {
        setAnswers(initialAnswers);
    }, [initialAnswers]);

    const handleAnswerChange = (id: MuendlichAnswerKey, value: string) => setAnswers(prev => ({ ...prev, [id]: value }));

    const isComplete = QUESTION_CONFIG.every(q => answers[q.id]?.trim());

    const fullPresentationText = QUESTION_CONFIG
        .map(q => answers[q.id])
        .filter(answer => answer && answer.trim() !== '')
        .join('. ') + '.';

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Expression Orale – Apprendre à se connaître</h2>
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6">
                <h3 className="font-semibold text-lg">Étape 1 : Préparez votre présentation</h3>
                <p className="mt-2">Veuillez répondre aux questions suivantes. <em className="text-slate-500 dark:text-slate-400">(Bitte beantworten Sie die folgenden Fragen.)</em></p>
                <p className="mt-1">Vous pouvez choisir une réponse ou écrire la vôtre. <em className="text-slate-500 dark:text-slate-400">(Sie können eine Antwort auswählen oder selbst schreiben.)</em></p>
                <p className="mt-1">À la fin, vous verrez et écouterez votre présentation personnelle dans un dialogue. <em className="text-slate-500 dark:text-slate-400">(Am Ende sehen und hören Sie Ihre persönliche Vorstellung in einem Dialog.)</em></p>
            </div>
            <div className="space-y-6">
                {QUESTION_CONFIG.map(q => (
                    <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div>
                            <label className="font-semibold text-lg">{q.label} - {q.questionDE}</label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{q.questionFR}</p>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 italic my-2">{q.template}</p>
                        <textarea value={answers[q.id] || ''} onChange={(e) => handleAnswerChange(q.id, e.target.value)} rows={2} placeholder="Écrivez votre propre réponse ici..." className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500" />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {q.suggestions.map((s, index) => <button key={index} onClick={() => handleAnswerChange(q.id, s)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">"{s}"</button>)}
                        </div>
                    </div>
                ))}
            </div>
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}

             <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={onStartOver} disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-trash"></i> Supprimer et recommencer
                </button>
                 <button onClick={() => setShowPresentation(true)} disabled={isLoading || !isComplete} className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2">
                    <i className="fas fa-eye"></i> Voir ma présentation
                </button>
                <button onClick={() => onGenerateDialogue(answers)} disabled={isLoading || !isComplete} className="flex-grow px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-lg disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isLoading ? <><Spinner/> Création du dialogue en cours...</> : 'Étape 2 : Générer le dialogue'}
                </button>
            </div>
            {!isComplete && <p className="text-center mt-2 text-sm text-slate-500">Veuillez remplir tous les champs pour continuer.</p>}

            {showPresentation && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in p-4" role="dialog" aria-modal="true" aria-labelledby="presentation-title">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 id="presentation-title" className="text-2xl font-bold">Ma présentation personnelle</h3>
                            <button onClick={() => setShowPresentation(false)} className="text-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Fermer">&times;</button>
                        </div>
                        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md max-h-[60vh] overflow-y-auto">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {fullPresentationText}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowPresentation(false)} 
                            className="mt-6 w-full sm:w-auto px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Sub-Component for Dialogue Review ---
interface DialogueReviewProps {
    dialogue: ChatMessage[];
    onEditPresentation: () => void;
    onGenerateNew: () => void;
    isLoading: boolean;
}
const DialogueReview: React.FC<DialogueReviewProps> = ({ dialogue, onEditPresentation, onGenerateNew, isLoading }) => {
    const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [audioError, setAudioError] = useState<string | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopAudio = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.onended = null;
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setAudioState('idle');
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    useEffect(() => {
        if (!dialogue || dialogue.length === 0) return;

        const generateAudio = async () => {
            setAudioState('generating');
            setAudioError(null);
            setAudioBuffer(null);
            stopAudio();

            try {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const context = audioContextRef.current;
                
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const speakerVoiceConfigs = [
                    { speaker: 'A', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }, // User (Female voice)
                    { speaker: 'B', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }  // AI Partner (Male voice)
                ];

                const prompt = dialogue.map(turn => `${turn.speaker}: ${turn.text}`).join('\n');
                
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: prompt }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            multiSpeakerVoiceConfig: { speakerVoiceConfigs }
                        }
                    }
                });

                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (!base64Audio) throw new Error("Keine Audiodaten von der API erhalten.");
                
                const buffer = await decodeAudioData(decode(base64Audio), context);
                setAudioBuffer(buffer);
                setAudioState('idle');

            } catch (err) {
                console.error("Fehler bei der Audiogenerierung:", err);
                setAudioError("Audio konnte nicht generiert werden.");
                setAudioState('idle');
            }
        };

        generateAudio();
    // Re-run audio generation only when dialogue content changes, not on every re-render of stopAudio
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialogue]);

    const handlePlayStop = () => {
        if (audioState === 'playing') {
            stopAudio();
            return;
        }

        if (audioState === 'idle' && audioBuffer) {
            if (!audioContextRef.current) {
                 audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                sourceRef.current = null;
                setAudioState('idle');
            };
            source.start(0);
            sourceRef.current = source;
            setAudioState('playing');
        }
    };


    const fullTranscriptForDisplay = dialogue.map(m => `${m.speaker === 'A' ? 'Vous (Candidat A)' : 'Partenaire (Candidat B)'}: ${m.text}`).join('\n\n');

    const handleDownloadTranscript = () => {
        const blob = new Blob([fullTranscriptForDisplay], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dialogue-transcription.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const getPlayButtonContent = () => {
        switch(audioState) {
            case 'idle': return { icon: 'play', text: 'Écouter le dialogue' };
            case 'generating': return { icon: 'spinner', text: 'Génération audio...' };
            case 'playing': return { icon: 'stop', text: 'Arrêter' };
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Résultat de la simulation de dialogue</h2>
            <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center mb-6">
                <h4 className="font-bold text-lg text-green-800 dark:text-green-200">Votre dialogue personnel a été créé !</h4>
                <p className="mt-1">Lisez et écoutez le dialogue. Ensuite, entraînez-vous à parler à voix haute pour votre rôle (Candidat A).</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transcript */}
                <div className="border rounded-lg shadow-sm p-4 bg-white dark:bg-slate-800">
                    <h3 className="font-semibold text-xl mb-3">Lire le dialogue</h3>
                    <div className="h-96 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/50 rounded-md space-y-4">
                        {dialogue.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-2 ${msg.speaker === 'A' ? 'justify-end' : 'justify-start'}`}>
                                {msg.speaker === 'B' && <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="Partenaire (Candidat B)">B</div>}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.speaker === 'A' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                                {msg.speaker === 'A' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="Vous (Candidat A)">A</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audio */}
                <div className="border rounded-lg shadow-sm p-4 bg-white dark:bg-slate-800 space-y-4">
                    <div>
                        <h3 className="font-semibold text-xl mb-3">Écouter le dialogue</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <button 
                                onClick={handlePlayStop} 
                                disabled={audioState === 'generating' || !audioBuffer}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-slate-400"
                            >
                                {audioState === 'generating' ? <Spinner/> : <i className={`fas fa-${getPlayButtonContent().icon}`}></i>}
                                {getPlayButtonContent().text}
                            </button>
                            <button onClick={handleDownloadTranscript} className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                                <i className="fas fa-download"></i> Télécharger le transcript
                            </button>
                        </div>
                        {audioError && <p className="text-red-500 text-sm mt-2">{audioError}</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                 <button onClick={onEditPresentation} className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-edit"></i> Modifier la présentation
                </button>
                <button onClick={onGenerateNew} disabled={isLoading} className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:bg-slate-400 flex items-center justify-center gap-2">
                    {isLoading ? <Spinner/> : <><i className="fas fa-sync-alt"></i> Générer un nouveau dialogue</>}
                </button>
            </div>
        </div>
    );
};

export default MuendlicherAusdruckTeil1;
