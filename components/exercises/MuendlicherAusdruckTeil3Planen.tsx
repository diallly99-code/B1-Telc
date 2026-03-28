import React, { useState, useEffect, useRef } from 'react';
import { MuendlicherAusdruckTeil3PlanungsThema, ChatMessage, PlanungsHilfe } from '../../types';
import { generatePlanungsThema, getPlanungsPartnerResponse, summarizePlanung, generatePlanungsHilfe } from '../../services/geminiService';
import Spinner from '../Spinner';
import DialogueAudioPlayer from '../common/DialogueAudioPlayer';

const initialThema: MuendlicherAusdruckTeil3PlanungsThema = {
  title: 'Eine Abschiedsparty feiern',
  descriptionDE: 'Sie haben zwei Wochen Urlaub gemacht und in dieser Zeit einige nette Deutsche kennengelernt. Vor dem Ende des Urlaubs und bevor Ihre Bekannten alle wieder nach Hause fahren, möchten Sie eine Abschiedsparty feiern. Sie haben die Aufgabe, zusammen mit Ihrem Gesprächspartner/Ihrer Gesprächspartnerin diese Party zu planen. Überlegen Sie sich, was alles zu tun ist und wer welche Aufgaben übernimmt.',
  descriptionFR: 'Vous avez passé deux semaines de vacances et rencontré des Allemands sympathiques. Avant la fin des vacances, vous voulez organiser une fête d’adieu. Votre tâche : planifier cette fête avec votre partenaire. Décidez ensemble quoi faire, qui s’occupe de quoi et parvenez à une solution commune.',
  planningPoints: ['Wann?', 'Wo?', 'Essen & Trinken', 'Wer kauft was?', 'Musik?', 'Kosten?']
};

const MuendlicherAusdruckTeil3Planen: React.FC = () => {
    const [thema, setThema] = useState<MuendlicherAusdruckTeil3PlanungsThema>(initialThema);
    const [dialogue, setDialogue] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [summary, setSummary] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [contextualHelp, setContextualHelp] = useState<PlanungsHilfe | null>(null);
    
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isLoadingHelp, setIsLoadingHelp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dialogue]);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const newUserMessage: ChatMessage = { speaker: 'A', text: userInput };
        const newDialogue = [...dialogue, newUserMessage];
        setDialogue(newDialogue);
        setUserInput('');
        setIsLoadingAI(true);
        setError(null);

        try {
            const aiResponseText = await getPlanungsPartnerResponse(thema, newDialogue, userInput);
            const newAiMessage: ChatMessage = { speaker: 'B', text: aiResponseText };
            setDialogue(prev => [...prev, newAiMessage]);
        } catch (err) {
            setError('Fehler bei der Antwort des Partners. Bitte versuchen Sie es erneut.');
            console.error(err);
        } finally {
            setIsLoadingAI(false);
        }
    };
    
    const handleFinalizePlanung = async () => {
        setIsLoadingSummary(true);
        setError(null);
        try {
            const result = await summarizePlanung(dialogue);
            setSummary(result);
        } catch (err) {
            setError('Fehler beim Erstellen der Zusammenfassung.');
            console.error(err);
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const handleGenerateNewTopic = async () => {
        setIsLoadingTopic(true);
        setError(null);
        setDialogue([]);
        setSummary(null);
        setUserInput('');
        setShowHelp(false);
        setContextualHelp(null);
        try {
            const newThema = await generatePlanungsThema();
            setThema(newThema);
        } catch (err) {
             setError('Fehler beim Generieren eines neuen Themas.');
            console.error(err);
        } finally {
            setIsLoadingTopic(false);
        }
    };

    const handleToggleHelp = async () => {
        const willBeOpen = !showHelp;
        setShowHelp(willBeOpen);

        if (willBeOpen && !contextualHelp) {
            setIsLoadingHelp(true);
            setError(null);
            try {
                const helpData = await generatePlanungsHilfe(thema);
                setContextualHelp(helpData);
            } catch (err) {
                setError('Fehler beim Laden der Hilfe.');
                console.error(err);
                setShowHelp(false);
            } finally {
                setIsLoadingHelp(false);
            }
        }
    };
    
    const isPlanFinished = !!summary;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Teil 3: Gemeinsam etwas planen</h2>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h3 className="font-semibold text-lg">{thema.title}</h3>
                <p className="mt-2">{thema.descriptionDE}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400"><em>({thema.descriptionFR})</em></p>
                <div className="mt-3">
                    <p className="font-semibold">Punkte zur Planung:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {thema.planningPoints.map(p => <span key={p}>• {p}</span>)}
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="h-96 overflow-y-auto p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                {dialogue.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'A' ? 'justify-end' : 'justify-start'}`}>
                        {msg.speaker === 'B' && <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="Partner B">B</div>}
                        <div className={`max-w-md p-3 rounded-2xl ${msg.speaker === 'A' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-600 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                        {msg.speaker === 'A' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="Kandidat A">A</div>}
                    </div>
                ))}
                {isLoadingAI && (
                     <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="Partner B">B</div>
                        <div className="max-w-md p-3 rounded-2xl bg-slate-200 dark:bg-slate-600 rounded-bl-none flex items-center gap-2">
                           <Spinner/> <span className="text-sm italic">schreibt...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* User Input & Help */}
            {!isPlanFinished && (
                <div>
                    <div className="flex gap-2">
                        <textarea 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            rows={2}
                            placeholder="Ihre Nachricht..."
                            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-slate-900"
                            disabled={isLoadingAI}
                        />
                        <button onClick={handleSendMessage} disabled={isLoadingAI || !userInput.trim()} className="px-5 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:bg-slate-400">
                            Senden
                        </button>
                    </div>

                    <button onClick={handleToggleHelp} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600">
                        {isLoadingHelp ? <Spinner /> : '💡'} Hilfe zeigen {showHelp ? '▲' : '▼'}
                    </button>

                    {showHelp && contextualHelp && (
                        <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg space-y-4 animate-fade-in">
                            {Object.entries(contextualHelp).map(([category, phrases]) => (
                                <div key={category}>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">{category}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(phrases as string[]).map((phrase, i) => (
                                            <button key={i} onClick={() => setUserInput(p => `${p}${p ? ' ' : ''}${phrase}`)} className="px-3 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full text-sm shadow-sm">
                                                "{phrase}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Summary and Final Actions */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                {!isPlanFinished && dialogue.length > 2 && (
                    <button onClick={handleFinalizePlanung} disabled={isLoadingSummary} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                        {isLoadingSummary ? <Spinner /> : '✅ Planung abschließen & Zusammenfassung'}
                    </button>
                )}
                
                {isPlanFinished && summary && (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-bold">Planungs-Ergebnis</h3>
                        <div className="mt-2 p-4 bg-green-100 dark:bg-green-900/50 rounded-lg border-l-4 border-green-500">
                            <p className="font-semibold text-green-800 dark:text-green-200">{summary}</p>
                        </div>
                        <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-slate-800">
                            <DialogueAudioPlayer dialogue={dialogue} />
                        </div>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-4">
                     <button onClick={handleGenerateNewTopic} disabled={isLoadingTopic} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-slate-400">
                        {isLoadingTopic ? <Spinner /> : '🔄'} Neues Thema generieren
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MuendlicherAusdruckTeil3Planen;