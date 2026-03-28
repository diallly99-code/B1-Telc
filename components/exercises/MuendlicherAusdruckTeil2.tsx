import React, { useState, useEffect } from 'react';
import { MuendlicherAusdruckTeil2Thema, MuendlicherAusdruckTeil2UserInput, ChatMessage, MuendlicherAusdruckTeil2Character } from '../../types';
import { generateGesprächDialogue, generateB1Reformulation, generateB1Examples, generateMuendlicherAusdruckTeil2Thema } from '../../services/geminiService';
import Spinner from '../Spinner';
import DialogueAudioPlayer from '../common/DialogueAudioPlayer';

const initialTheme: MuendlicherAusdruckTeil2Thema = {
  title: 'Ausziehen und alleine wohnen',
  titleFR: 'Déménager et vivre seul',
  characters: [
    {
      name: 'Jenny Waldrich',
      details: '21 Jahre, Studentin',
      text: 'Meine Eltern hätten gar nichts dagegen, dass ich ausziehe. Sie würden mir sogar Geld für die Miete geben. Aber was soll ich denn allein in einer kleinen, ungemütlichen Wohnung? Im Haus meiner Eltern habe ich doch viel mehr Platz. Dort habe ich nicht nur mein eigenes Zimmer, sondern auch die anderen Räume und den Garten. Das ist doch viel bequemer!'
    },
    {
      name: 'David Sell',
      details: '20 Jahre, Student',
      text: 'Eigentlich wollte ich gar nicht ausziehen, denn bei meinen Eltern habe ich mich wohlgefühlt. Aber ich musste zum Studieren in eine andere Stadt ziehen und mir dort eine Wohnung suchen. Zuerst fiel es mir schwer, mich um alles selbst zu kümmern. Waschen, kochen oder putzen musste ich zuhause nie! Mittlerweile bin ich froh, allein zu wohnen. Ich bin nämlich viel selbständiger geworden.'
    }
  ]
};

const MuendlicherAusdruckTeil2: React.FC = () => {
    const [theme, setTheme] = useState<MuendlicherAusdruckTeil2Thema>(initialTheme);
    const [step, setStep] = useState(0); // 0: select char, 1: reform, 2: opinion, 3: question, 4: experience, 5: dialogue
    const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(null);
    const [userInput, setUserInput] = useState<MuendlicherAusdruckTeil2UserInput>({ reformulation: '', opinion: '', question: '', experience: ''});
    const [dialogue, setDialogue] = useState<ChatMessage[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateNewTheme = async () => {
        setIsGeneratingTheme(true);
        setError(null);
        try {
            const newTheme = await generateMuendlicherAusdruckTeil2Thema();
            setTheme(newTheme);
        } catch (err) {
            setError('Erreur lors de la génération des textes. Veuillez réessayer.');
            console.error(err);
        } finally {
            setIsGeneratingTheme(false);
        }
    };

    const handleSelectChar = (index: number) => {
        setSelectedCharIndex(index);
        setStep(1);
    };

    const handleGenerateDialogue = async () => {
        if (selectedCharIndex === null) return;
        setIsLoading(true);
        setError(null);
        try {
            const userCharacter = theme.characters[selectedCharIndex];
            const aiCharacter = theme.characters[1 - selectedCharIndex];
            const result = await generateGesprächDialogue(theme.title, userInput, userCharacter, aiCharacter);
            setDialogue(result);
            setStep(5);
        } catch (err) {
            setError('Erreur lors de la génération du dialogue. Veuillez réessayer.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetExercise = () => {
        setTheme(initialTheme);
        setStep(0);
        setSelectedCharIndex(null);
        setUserInput({ reformulation: '', opinion: '', question: '', experience: '' });
        setDialogue(null);
        setError(null);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CharacterSelection 
                    theme={theme}
                    onSelect={handleSelectChar}
                    onGenerateNewTheme={handleGenerateNewTheme}
                    isGenerating={isGeneratingTheme}
                    error={error}
                />;
            case 1:
                if (selectedCharIndex === null) return null;
                return <Step1_Reformulation
                    character={theme.characters[selectedCharIndex]}
                    value={userInput.reformulation}
                    onChange={(value) => setUserInput(prev => ({ ...prev, reformulation: value }))}
                    onNext={() => setStep(2)}
                    onBack={() => { setStep(0); setSelectedCharIndex(null); }}
                />;
             case 2:
                return <Step2_Opinion
                    theme={theme.title}
                    value={userInput.opinion}
                    onChange={(value) => setUserInput(prev => ({ ...prev, opinion: value }))}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />;
            case 3:
                return <Step3_Question
                    theme={theme.title}
                    value={userInput.question}
                    onChange={(value) => setUserInput(prev => ({ ...prev, question: value }))}
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                />;
            case 4:
                return <Step4_Experience
                    theme={theme.title}
                    value={userInput.experience}
                    onChange={(value) => setUserInput(prev => ({ ...prev, experience: value }))}
                    onNext={handleGenerateDialogue}
                    onBack={() => setStep(3)}
                    isLoading={isLoading}
                    error={error}
                />;
            case 5:
                 return dialogue ? <DialogueReview dialogue={dialogue} onRestart={resetExercise} /> : null;
            default:
                return <CharacterSelection
                    theme={theme}
                    onSelect={handleSelectChar}
                    onGenerateNewTheme={handleGenerateNewTheme}
                    isGenerating={isGeneratingTheme}
                    error={error}
                />;
        }
    };

    return <div className="animate-fade-in">{renderStep()}</div>;
};

// --- Sub-components for each step ---

const CharacterSelection: React.FC<{ theme: MuendlicherAusdruckTeil2Thema, onSelect: (index: number) => void, onGenerateNewTheme: () => void, isGenerating: boolean, error: string | null }> = ({ theme, onSelect, onGenerateNewTheme, isGenerating, error }) => (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
                <h2 className="text-2xl font-bold">Thème: {theme.title} <span className="text-xl font-normal text-slate-500 dark:text-slate-400">({theme.titleFR})</span></h2>
                <h3 className="text-xl">Schritt 1: Wählen Sie einen Text</h3>
            </div>
            <button 
                onClick={onGenerateNewTheme} 
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-slate-400"
            >
                 {isGenerating ? <Spinner /> : '🤖'} Générer d'autres textes
            </button>
        </div>
        <p className="mb-6 text-slate-600 dark:text-slate-400">Choisissez le texte que vous voulez résumer. Votre partenaire de dialogue prendra l'autre.</p>
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theme.characters.map((char, index) => (
                <div key={char.name} className="p-6 bg-slate-100 dark:bg-slate-700 rounded-lg flex flex-col">
                    <h3 className="font-bold text-xl mb-2">{char.name} <span className="text-base font-normal text-slate-500 dark:text-slate-400">({char.details})</span></h3>
                    <p className="italic flex-grow">"{char.text}"</p>
                    <button onClick={() => onSelect(index)} className="mt-4 w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">
                        Wählen / Choisir
                    </button>
                </div>
            ))}
        </div>
    </div>
);

const DialogueGuide = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="border rounded-lg my-4">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex justify-between items-center font-semibold">
          <span>GUIDE: Comment commencer le dialogue (cliquez pour ouvrir/fermer)</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 space-y-4 animate-fade-in text-sm">
            <h4 className="font-bold text-base text-green-700 dark:text-green-400">🟢 Étapes pour commencer le dialogue</h4>
            
            <div className="pl-4">
                <p><strong>1. Ein Thema einleiten (Introduire le sujet)</strong></p>
                <ul className="list-disc list-inside ml-4 text-slate-600 dark:text-slate-400">
                    <li>„Es geht um das Thema...“</li>
                    <li>„Auf meinem Aufgabenblatt habe ich einen Text gelesen.“</li>
                    <li>„Ich habe einen Text von [Nom du personnage] gelesen. Er/Sie ist [âge] Jahre alt. Er/Sie ist [profession] von Beruf.“</li>
                </ul>
            </div>
  
            <div className="pl-4">
                <p><strong>2. Aussage wiedergeben (Rapporter le texte de son candidat)</strong></p>
                <ul className="list-disc list-inside ml-4 text-slate-600 dark:text-slate-400">
                    <li>„Im Text sagt ..., dass …“</li>
                    <li>„Er/Sie meint, dass …“</li>
                    <li>„Außerdem sagt er/sie …“</li>
                    <li>👉 Ici, l’élève doit transformer le texte de la 1ʳᵉ personne (ich) → à la 3ᵉ personne (er/sie).</li>
                </ul>
            </div>
            
            <div className="pl-4">
                <p><strong>3. Eigene Meinung geben (Donner son opinion)</strong></p>
                <ul className="list-disc list-inside ml-4 text-slate-600 dark:text-slate-400">
                    <li>„Ich finde diese Meinung interessant, aber …“</li>
                    <li>„Ich bin nicht ganz einverstanden, weil …“</li>
                    <li>„Ich denke, es ist besser, wenn …“</li>
                </ul>
            </div>
            
            <div className="pl-4">
                <p><strong>4. Frage stellen (Poser une question au partenaire)</strong></p>
                <ul className="list-disc list-inside ml-4 text-slate-600 dark:text-slate-400">
                    <li>„Und Sie, was haben Sie gelesen?“</li>
                    <li>„Wie finden Sie die Meinung im Text?“</li>
                    <li>„Was denken Sie über dieses Thema?“</li>
                </ul>
            </div>
  
            <hr className="my-2 border-slate-200 dark:border-slate-600"/>
  
            <h4 className="font-bold text-base">📝 Exemple concret – début de dialogue (Candidat A et B)</h4>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-md space-y-3">
                <p><strong>Candidat A :</strong><br/>„Es geht um das Thema Ausziehen und alleine wohnen. Auf meinem Aufgabenblatt habe ich einen Text von Jenny Waldrich gelesen. Sie sagt, dass ihre Eltern nichts dagegen hätten, wenn sie auszieht, und dass sie sogar Geld für die Miete bekommen würde. Aber Jenny meint auch, dass es im Haus ihrer Eltern viel bequemer ist, weil sie dort mehr Platz hat. Ich finde ihre Meinung interessant, aber ich denke, man sollte trotzdem irgendwann alleine wohnen, um selbständiger zu werden. Und Sie, was haben Sie gelesen?“</p>
                <p><strong>Candidat B :</strong><br/>„Ich habe einen Text von David Sell gelesen. Er erzählt, dass er zuerst nicht ausziehen wollte, weil er sich bei seinen Eltern wohlgefühlt hat. Aber er musste zum Studium in eine andere Stadt ziehen. Am Anfang war es für ihn schwer, allein zu wohnen, aber jetzt ist er froh, weil er selbständiger geworden ist. Ich finde seine Meinung gut, weil man durch das Alleinwohnen wirklich viel lernt. Wie ist Ihre persönliche Erfahrung mit dem Thema?“</p>
            </div>
          </div>
        )}
      </div>
    );
};

const Step1_Reformulation: React.FC<{ character: MuendlicherAusdruckTeil2Character, value: string, onChange: (v: string) => void, onNext: () => void, onBack: () => void }> =
({ character, value, onChange, onNext, onBack }) => {
    const [aiHelp, setAiHelp] = useState('');
    const [isLoadingHelp, setIsLoadingHelp] = useState(false);

    const getAiHelp = async () => {
        setIsLoadingHelp(true);
        setAiHelp('');
        try {
            const result = await generateB1Reformulation(character.name, character.details, character.text);
            setAiHelp(result);
        } catch (error) { console.error(error); setAiHelp("Fehler bei der Generierung."); }
        finally { setIsLoadingHelp(false); }
    };
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Étape 1: Text wiedergeben <span className="font-normal text-base text-slate-500">(Reformulez le texte à la 3e personne)</span></h3>
            <DialogueGuide />
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <p><strong>Votre texte choisi :</strong> <em className="italic">"{character.text}"</em></p>
            </div>
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={`z.B. Ich habe einen Text von ${character.name} gelesen. Er/Sie ist ${character.details}. Er/Sie sagt, dass...`} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500" />
            <button onClick={getAiHelp} disabled={isLoadingHelp} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:bg-slate-400">
                 {isLoadingHelp ? <Spinner /> : '⚡'} Reformulierung zeigen
            </button>
            {aiHelp && <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-sm"><strong>Exemple:</strong> {aiHelp}</div>}
            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
};

const Step2_Opinion: React.FC<{ theme: string, value: string, onChange: (v: string) => void, onNext: () => void, onBack: () => void }> =
({ theme, value, onChange, onNext, onBack }) => {
    const [examples, setExamples] = useState<string[]>([]);
    const [isLoadingExamples, setIsLoadingExamples] = useState(false);

    const genericStarters = [
        "Ich finde diese Meinung interessant, weil...",
        "Ich bin nicht ganz einverstanden, denn...",
        "Meiner Meinung nach ist es wichtig, dass...",
        "Das ist ein guter Punkt, aber ich denke...",
        "Ich persönlich glaube, dass..."
    ];

    useEffect(() => {
        const loadExamples = async () => {
            setIsLoadingExamples(true);
            setExamples([]);
            try {
                const result = await generateB1Examples('opinion', theme);
                setExamples(result);
            } catch (error) {
                console.error(error);
                setExamples(["Fehler bei der Generierung von Beispielen."]);
            } finally {
                setIsLoadingExamples(false);
            }
        };
        loadExamples();
    }, [theme]);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Étape 2: Meinung geben <span className="font-normal text-base text-slate-500">(Exprimez votre avis)</span></h3>
             <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder="Écrivez votre opinion ou choisissez un exemple..." className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500" />
            
            <hr className="my-2 border-slate-200 dark:border-slate-600"/>

            <p className="text-sm font-semibold">Cliquez pour utiliser un modèle rapide :</p>
            <div className="flex flex-wrap gap-2">
                {genericStarters.map(s => <button key={s} onClick={() => onChange(s)} className="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-sm rounded-full hover:bg-slate-300 dark:hover:bg-slate-500">{s}</button>)}
            </div>

            <p className="text-sm font-semibold mt-4">Ou un exemple spécifique au thème :</p>
            {isLoadingExamples ? <div className="flex items-center gap-2 text-slate-500"><Spinner /> <span>Exemples en cours de chargement...</span></div> : (
                <div className="flex flex-wrap gap-2">
                    {examples.map((example, index) => (
                        <button key={index} onClick={() => onChange(example)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            "{example}"
                        </button>
                    ))}
                </div>
            )}

            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
};

const Step3_Question: React.FC<{ theme: string, value: string, onChange: (v: string) => void, onNext: () => void, onBack: () => void }> =
({ theme, value, onChange, onNext, onBack }) => {
    const [examples, setExamples] = useState<string[]>([]);
    const [isLoadingExamples, setIsLoadingExamples] = useState(false);

    const genericStarters = [
        "Und was haben Sie gelesen?",
        "Wie finden Sie die Meinung im Text?",
        "Was denken Sie über dieses Thema?",
    ];

    useEffect(() => {
        const loadExamples = async () => {
            setIsLoadingExamples(true);
            setExamples([]);
            try {
                const result = await generateB1Examples('question', theme);
                setExamples(result);
            } catch (error) {
                console.error(error);
                setExamples(["Fehler bei der Generierung von Beispielen."]);
            }
            finally {
                setIsLoadingExamples(false);
            }
        };
        loadExamples();
    }, [theme]);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Étape 3: Frage stellen <span className="font-normal text-base text-slate-500">(Posez une question)</span></h3>
             <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} placeholder="Écrivez votre question ou choisissez un exemple..." className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500" />
            
            <p className="text-sm font-semibold">Modèles rapides :</p>
            <div className="flex flex-wrap gap-2">
                {genericStarters.map(s => <button key={s} onClick={() => onChange(s)} className="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-sm rounded-full hover:bg-slate-300 dark:hover:bg-slate-500">{s}</button>)}
            </div>

            <p className="text-sm font-semibold mt-4">Exemples spécifiques au thème :</p>
            {isLoadingExamples ? <div className="flex items-center gap-2 text-slate-500"><Spinner /> <span>Exemples en cours de chargement...</span></div> : (
                <div className="flex flex-wrap gap-2">
                    {examples.map((example, index) => (
                        <button key={index} onClick={() => onChange(example)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            "{example}"
                        </button>
                    ))}
                </div>
            )}
            
            <StepNavigation onBack={onBack} onNext={onNext} />
        </div>
    );
};

const Step4_Experience: React.FC<{ theme: string, value: string, onChange: (v: string) => void, onNext: () => void, onBack: () => void, isLoading: boolean, error: string | null }> =
({ theme, value, onChange, onNext, onBack, isLoading, error }) => {
    const [examples, setExamples] = useState<string[]>([]);
    const [isLoadingExamples, setIsLoadingExamples] = useState(false);

    useEffect(() => {
        const loadExamples = async () => {
            setIsLoadingExamples(true);
            setExamples([]);
            try {
                const result = await generateB1Examples('experience', theme);
                setExamples(result);
            } catch (error) {
                console.error(error);
                setExamples(["Fehler bei der Generierung von Beispielen."]);
            }
            finally {
                setIsLoadingExamples(false);
            }
        };
        loadExamples();
    }, [theme]);
    
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Étape 4: Eigene Erfahrung <span className="font-normal text-base text-slate-500">(Racontez une expérience personnelle)</span></h3>
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder="Racontez votre expérience ou choisissez un exemple..." className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-red-500" />
            
            <p className="text-sm font-semibold mt-4">Exemples spécifiques au thème :</p>
            {isLoadingExamples ? <div className="flex items-center gap-2 text-slate-500"><Spinner /> <span>Exemples en cours de chargement...</span></div> : (
                <div className="flex flex-wrap gap-2">
                    {examples.map((example, index) => (
                        <button key={index} onClick={() => onChange(example)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            "{example}"
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
            <StepNavigation onBack={onBack} onNext={onNext} isFinalStep={true} isLoading={isLoading} />
        </div>
    );
};


const DialogueReview: React.FC<{dialogue: ChatMessage[], onRestart: () => void}> = ({ dialogue, onRestart }) => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Simulation de dialogue</h2>
         <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center mb-6">
            <h4 className="font-bold text-lg text-green-800 dark:text-green-200">Votre dialogue a été généré !</h4>
            <p className="mt-1">Écoutez et répétez vos répliques (Candidat A) pour vous entraîner.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="border rounded-lg shadow-sm p-4 bg-white dark:bg-slate-800">
                <DialogueAudioPlayer dialogue={dialogue} />
            </div>
        </div>
        <div className="mt-8 flex justify-center">
            <button onClick={onRestart} className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-undo"></i> Nouvel exercice
            </button>
        </div>
    </div>
);


const StepNavigation: React.FC<{onBack: () => void, onNext: () => void, isFinalStep?: boolean, isLoading?: boolean}> =
({ onBack, onNext, isFinalStep = false, isLoading = false }) => (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
            ⬅️ Zurück
        </button>
        <button onClick={onNext} disabled={isLoading} className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:bg-slate-400 flex items-center gap-2">
            {isLoading ? <Spinner /> : (isFinalStep ? 'Dialog generieren 🚀' : 'Weiter ➡️')}
        </button>
    </div>
);

export default MuendlicherAusdruckTeil2;
