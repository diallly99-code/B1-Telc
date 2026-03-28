import React, { useState, useEffect, useMemo } from 'react';
import { LeseverstehenTeil3ExampleData, LeseverstehenTeil3ExampleLoesung } from '../../types';
import { generateLeseverstehenTeil3Example } from '../../services/geminiService';
import Spinner from '../Spinner';

interface LeseverstehenTeil3ExampleProps {
  onBack: () => void;
  onStartTraining: () => void;
  isLoading: boolean;
}

const initialExerciseData: LeseverstehenTeil3ExampleData = {
    anzeigen: [
        { letter: 'a', content: 'Thai-China-Vietnam – Asiatisches Spezialitäten-Restaurant Bong-Hong, Boschetsrieder Straße 140, Tel./Fax 089/765552\nTäglich von 11.30 – 14.30 Uhr und 17.30 – 20.30 Uhr, kein Ruhetag.\nAlle Gerichte auch zum Mitnehmen und Heimservice.' },
        { letter: 'b', content: 'Ristorante OLINDO – Italienisches Restaurant\nHausgemachte Nudeln, Fischspezialitäten, Mittagsmenüs ab 7,50 Euro.\nBei schönem Wetter Gartenbetrieb.\nFallmerayerstr. 16, München-Schwabing' },
        { letter: 'c', content: 'Versicherungskammer Bayern – Helmut Schwabe, Herzogstraße 89, 80796 München.\nTel.: 089/308702\nFragen Sie: Sind Sie für den Urlaub auch gut versichert?' },
        { letter: 'd', content: 'SEATOP Reisen – Der Flug- und Hotelspezialist.\nMietwagen, Hotelvermittlung, Rundreisen.\nSommertermine nach USA noch Plätze frei.\nTel. 53 91 84' },
        { letter: 'e', content: 'COUNCIL TRAVEL – Spezialpreise für Studenten/Jugendliche.\nBeispielpreise: London 99 €, New York 329 €, Los Angeles 429 €, Miami 349 € …\nSprachreisen & Abenteuerreisen.' },
        { letter: 'f', content: 'Kreittmayr – Kneipe mit Biergarten, Billard und Kegelbahnen.\nLive-Musik jeden Freitag und Samstag.' },
        { letter: 'g', content: 'Internationaler Stammtisch – Diskussion über ausländische Jugendliche in Deutschland.\nMontag, 4. September, 19.30 Uhr, Ratskeller Mariplatz.' },
        { letter: 'h', content: 'Nachprüfung – Lehrerin bereitet intensiv vor in Latein, Englisch, Französisch, Deutsch.\nTel. 308 51 17' },
        { letter: 'i', content: 'Unterricht – Nachhilfe in Mathe-Physik, auch Chemie, alle Klassen.\nTel. 089/8340440' },
        { letter: 'j', content: 'City-Reisebüro – Campomule USA/Canada, z.B. San Francisco/Los Angeles ab 35 € pro Tag.\nFrüh buchen lohnt!' },
        { letter: 'k', content: 'Kurse – Für Erwachsene und Kinder mit (Sprach-)Schwierigkeiten.\nGisela Geiger, Leopoldstraße 83, München.' },
        { letter: 'l', content: 'Sprachbörse – Deutsch als Fremdsprache, Fremdsprachen, Kindersprachkurse, Minigruppen, Einzelunterricht.' },
    ],
    fragen: [
        { id: 11, text: 'Sie möchten mit Freunden in einem Restaurant essen. Da das Wetter schön ist, möchten Sie gerne draußen sitzen.' },
        { id: 12, text: 'Sie möchten heute nicht selbst kochen, sondern lieber ein warmes Essen kaufen und mit nach Hause nehmen.' },
        { id: 13, text: 'In den Sommerferien möchten Sie gerne in die USA fliegen. Sie brauchen dort auch eine Unterkunft.' },
        { id: 14, text: 'Reisebüros bieten billigere Flüge an, wenn man in letzter Minute bucht. Sie suchen so einen Flug.' },
        { id: 15, text: 'Ihre Tochter, die studiert, möchte in die USA fliegen. Sie suchen einen billigen Flug für sie.' },
        { id: 16, text: 'Ihr Sohn ist schlecht in Mathematik und braucht deshalb noch Unterricht außerhalb der Schule.' },
        { id: 17, text: 'Das Kind Ihrer Freunde hat Probleme beim Sprechen und braucht deshalb Hilfe.' },
        { id: 18, text: 'Sie haben einen jungen Franzosen zu Besuch. Sie möchten, dass er in einen Deutschkurs geht.' },
        { id: 19, text: 'Sie möchten, dass Ihr Sohn in einen Jugendclub geht.' },
        { id: 20, text: 'Sie interessieren sich für die Probleme ausländischer Jugendlicher in Deutschland.' },
    ],
    loesungen: [
        { id: 11, correctAnswerLetter: 'b', feedbackCorrectDE: "Richtig! In Anzeige b steht ‚Bei schönem Wetter Gartenbetrieb‘ – das passt zu ‚draußen sitzen‘.", feedbackCorrectFR: "Bonne réponse ! Dans l’annonce b, on lit « jardin en plein air », ce qui correspond à la demande.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist Anzeige b. Dort steht ‚Gartenbetrieb‘.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est b. On lit « jardin en plein air » dans le texte.", relevantSnippet: 'Bei schönem Wetter Gartenbetrieb' },
        { id: 12, correctAnswerLetter: 'a', feedbackCorrectDE: "Richtig! Anzeige a bietet Gerichte 'zum Mitnehmen'.", feedbackCorrectFR: "Bonne réponse ! L'annonce a propose des plats 'à emporter'.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist Anzeige a, denn dort gibt es Gerichte 'zum Mitnehmen'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est a, car ils proposent des plats 'à emporter'.", relevantSnippet: 'Alle Gerichte auch zum Mitnehmen' },
        { id: 13, correctAnswerLetter: 'd', feedbackCorrectDE: "Richtig! Anzeige d ist ein 'Flug- und Hotelspezialist' für die USA.", feedbackCorrectFR: "Bonne réponse ! L'annonce d est un 'spécialiste des vols et hôtels' pour les États-Unis.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist d, ein 'Flug- und Hotelspezialist'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est d, un 'spécialiste des vols et hôtels'.", relevantSnippet: 'Flug- und Hotelspezialist' },
        { id: 14, correctAnswerLetter: 'x', feedbackCorrectDE: "Richtig! Keine Anzeige bietet Last-Minute-Flüge an.", feedbackCorrectFR: "Bonne réponse ! Aucune annonce ne propose de vols de dernière minute.", feedbackIncorrectDE: "Falsch! Keine Anzeige passt. Anzeige j sagt 'Früh buchen lohnt!', das Gegenteil von Last-Minute.", feedbackIncorrectFR: "Mauvaise réponse. Aucune annonce ne correspond. L'annonce j dit 'Réserver tôt en vaut la peine !', le contraire de la dernière minute.", relevantSnippet: null },
        { id: 15, correctAnswerLetter: 'e', feedbackCorrectDE: "Richtig! Anzeige e hat 'Spezialpreise für Studenten'.", feedbackCorrectFR: "Bonne réponse ! L'annonce e a des 'prix spéciaux pour étudiants'.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist e mit 'Spezialpreise für Studenten'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est e avec des 'prix spéciaux pour étudiants'.", relevantSnippet: 'Spezialpreise für Studenten/Jugendliche' },
        { id: 16, correctAnswerLetter: 'i', feedbackCorrectDE: "Richtig! Anzeige i bietet 'Nachhilfe in Mathe-Physik'.", feedbackCorrectFR: "Bonne réponse ! L'annonce i propose du 'soutien scolaire en maths-physique'.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist i mit 'Nachhilfe in Mathe-Physik'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est i avec du 'soutien scolaire en maths-physique'.", relevantSnippet: 'Nachhilfe in Mathe-Physik' },
        { id: 17, correctAnswerLetter: 'k', feedbackCorrectDE: "Richtig! Anzeige k ist für Kinder mit 'Sprach-Schwierigkeiten'.", feedbackCorrectFR: "Bonne réponse ! L'annonce k est pour les enfants ayant des 'difficultés de langage'.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist k, für Kinder mit 'Sprach-Schwierigkeiten'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est k, pour les enfants ayant des 'difficultés de langage'.", relevantSnippet: 'Kinder mit (Sprach-)Schwierigkeiten' },
        { id: 18, correctAnswerLetter: 'l', feedbackCorrectDE: "Richtig! Anzeige l bietet 'Deutsch als Fremdsprache'.", feedbackCorrectFR: "Bonne réponse ! L'annonce l propose 'l'allemand comme langue étrangère'.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist l mit 'Deutsch als Fremdsprache'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est l avec 'l'allemand comme langue étrangère'.", relevantSnippet: 'Deutsch als Fremdsprache' },
        { id: 19, correctAnswerLetter: 'x', feedbackCorrectDE: "Richtig! Keine Anzeige ist für einen Jugendclub.", feedbackCorrectFR: "Bonne réponse ! Aucune annonce ne concerne un club de jeunes.", feedbackIncorrectDE: "Falsch! Keine der Anzeigen passt zu einem 'Jugendclub'.", feedbackIncorrectFR: "Mauvaise réponse. Aucune des annonces ne correspond à un 'club de jeunes'.", relevantSnippet: null },
        { id: 20, correctAnswerLetter: 'g', feedbackCorrectDE: "Richtig! Anzeige g ist eine 'Diskussion über ausländische Jugendliche'.", feedbackCorrectFR: "Bonne réponse ! L'annonce g concerne une 'discussion sur les jeunes étrangers'.", feedbackIncorrectDE: "Falsch! Die richtige Antwort ist g, eine 'Diskussion über ausländische Jugendliche'.", feedbackIncorrectFR: "Mauvaise réponse. La bonne réponse est g, une 'discussion sur les jeunes étrangers'.", relevantSnippet: 'Diskussion über ausländische Jugendliche' },
    ]
};

const LeseverstehenTeil3Example: React.FC<LeseverstehenTeil3ExampleProps> = ({ onBack, onStartTraining, isLoading }) => {
  const [exercise, setExercise] = useState<LeseverstehenTeil3ExampleData>(initialExerciseData);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [activeHighlight, setActiveHighlight] = useState<{ adLetter: string; snippet: string } | null>(null);

  const solutionsMap = useMemo(() => {
    return new Map(exercise.loesungen.map((s: LeseverstehenTeil3ExampleLoesung) => [s.id, s]));
  }, [exercise.loesungen]);

  const loadExercise = async (isInitial = false) => {
    if (!isInitial) {
        setIsLoadingExample(true);
    }
    setError(null);
    handleReset();
    try {
      const data = isInitial ? initialExerciseData : await generateLeseverstehenTeil3Example();
      setExercise(data);
    } catch (err) {
      setError("Fehler beim Generieren des Beispiels. Bitte versuchen Sie es erneut.");
      console.error(err);
    } finally {
      if (!isInitial) {
        setIsLoadingExample(false);
      }
    }
  };
  
  const handleAnswerChange = (questionId: number, selectedLetter: string) => {
    if (userAnswers[questionId]) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: selectedLetter }));

    const solution = solutionsMap.get(questionId);
    if (!solution) return;

    if (selectedLetter !== solution.correctAnswerLetter && solution.relevantSnippet) {
        setActiveHighlight({ adLetter: solution.correctAnswerLetter, snippet: solution.relevantSnippet });
    } else {
        setActiveHighlight(null);
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setActiveHighlight(null);
  };

  const highlightedAds = useMemo(() => {
    const highlights: Record<string, string> = {};
    if (activeHighlight) {
        const { adLetter, snippet } = activeHighlight;
        const ad = exercise.anzeigen.find(a => a.letter === adLetter);
        if (ad && snippet) {
            const escapedSnippet = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedSnippet})`, 'gi');
            highlights[adLetter] = ad.content.replace(regex, `<mark class="bg-yellow-300 dark:bg-yellow-500 rounded px-1">$1</mark>`);
        }
    }
    return highlights;
  }, [activeHighlight, exercise.anzeigen]);
  
  if (!exercise) return null;

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">Explication: Leseverstehen Teil 3</h3>
      <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6 space-y-2">
        <p className="font-semibold">Lesen Sie die Situationen 11–20 und die Anzeigen a–l. Finden Sie für jede Situation die passende Anzeige. Sie können jede Anzeige nur einmal benutzen. Markieren Sie Ihre Lösungen für die Aufgaben 11–20 auf dem Antwortbogen. Wenn Sie zu einer Situation keine Anzeige finden, markieren Sie ein X.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <h4 className="font-semibold text-lg mb-2">Anzeigen (a–l)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exercise.anzeigen.map(anzeige => (
                    <div key={anzeige.letter} className={`p-3 border rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm transition-all duration-300 ${activeHighlight && activeHighlight.adLetter === anzeige.letter ? 'ring-2 ring-yellow-400' : ''}`}>
                        <p className="font-bold text-base mb-1">Anzeige {anzeige.letter.toUpperCase()}</p>
                        <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedAds[anzeige.letter] || anzeige.content }}></p>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-lg mb-2">Situationen (11-20)</h4>
            <div className="space-y-4">
                {exercise.fragen.map(frage => {
                    const solution = solutionsMap.get(frage.id);
                    const userAnswer = userAnswers[frage.id];
                    const isAnswered = !!userAnswer;
                    const isCorrect = isAnswered && solution && userAnswer === solution.correctAnswerLetter;

                    return (
                        <div key={frage.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                           <p className="font-semibold mb-2">{frage.id}. {frage.text}</p>
                           <select
                                value={userAnswer || ''}
                                onChange={e => handleAnswerChange(frage.id, e.target.value)}
                                disabled={isAnswered}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700"
                                aria-label={`Antwort für Frage ${frage.id}`}
                            >
                                <option value="" disabled>Anzeige auswählen...</option>
                                {exercise.anzeigen.map(a => <option key={a.letter} value={a.letter}>{a.letter.toUpperCase()}</option>)}
                                <option value="x">x) Keine Anzeige passt</option>
                            </select>
                            {isAnswered && solution && (
                                <div className={`mt-2 p-2 rounded-md text-sm animate-fade-in ${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                    {isCorrect ? (
                                        <div>
                                            <p><strong>{solution.feedbackCorrectDE}</strong></p>
                                            <p className="text-slate-500"><em>({solution.feedbackCorrectFR})</em></p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p><strong>{solution.feedbackIncorrectDE}</strong></p>
                                            <p className="text-slate-500"><em>({solution.feedbackIncorrectFR})</em></p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button onClick={handleReset} className="px-5 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
            🔄 Wiederholen
        </button>
        <button onClick={() => loadExercise(false)} disabled={isLoadingExample} className="px-5 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:bg-slate-400 flex items-center">
           {isLoadingExample ? <Spinner /> : '🤖 Neues Beispiel generieren'}
        </button>
      </div>
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      
      <div className="text-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-lg font-semibold mb-4">Prêt(e) à passer aux vrais exercices ?</p>
            <button
              onClick={onStartTraining}
              disabled={isLoading}
              className="px-8 py-4 rounded-lg font-bold text-white transition-colors duration-300 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-xl"
            >
              {isLoading ? <Spinner /> : '▶️ Weiter zu den echten Übungen'}
            </button>
        </div>
    </div>
  );
};

export default LeseverstehenTeil3Example;