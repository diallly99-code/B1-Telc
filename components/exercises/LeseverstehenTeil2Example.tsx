import React, { useState, useMemo } from 'react';
import { LeseverstehenTeil2ExampleData } from '../../types';
import { generateLeseverstehenTeil2Example } from '../../services/geminiService';
import Spinner from '../Spinner';

interface LeseverstehenTeil2ExampleProps {
  onBack: () => void;
  onStartTraining: () => void;
  isLoading: boolean;
}

const initialExerciseData: LeseverstehenTeil2ExampleData = {
  text: `Immer mehr Menschen in deutschen Städten entdecken das Fahrrad als praktisches Verkehrsmittel. Es ist nicht nur umweltfreundlich, sondern oft auch schneller als das Auto, besonders im dichten Stadtverkehr. Städte wie Münster oder Freiburg gelten als Fahrrad-Hauptstädte und investieren viel in den Ausbau von Radwegen.
Ein Problem bleibt jedoch die Sicherheit. Viele Radfahrer fühlen sich unsicher, wenn sie sich die Straße mit Autos und Bussen teilen müssen. Deshalb fordert der Allgemeine Deutsche Fahrrad-Club (ADFC) breitere und klar getrennte Radwege.
Ein weiterer wichtiger Punkt ist die Möglichkeit, das Fahrrad mit öffentlichen Verkehrsmitteln zu kombinieren. In vielen Zügen ist die Mitnahme von Fahrrädern erlaubt, aber in Stoßzeiten kann es schwierig sein, einen Platz zu finden. Die Deutsche Bahn arbeitet an neuen Lösungen, wie zum Beispiel größeren Fahrradabteilen in Regionalzügen, um das Pendeln für Radfahrer einfacher zu machen.
Auch das Thema Diebstahl beschäftigt viele Radfahrer. Ein gutes Schloss ist unerlässlich, aber viele wünschen sich mehr sichere Abstellplätze an Bahnhöfen und in Wohngebieten. Initiativen für bewachte Fahrradparkhäuser, wie es sie schon in einigen Städten gibt, werden als positive Entwicklung gesehen.`,
  questions: [
    {
      id: 6,
      question: "Viele Menschen in deutschen Städten nutzen das Fahrrad, weil",
      options: {
        a: "es immer sicher ist.",
        b: "es eine umweltfreundliche und schnelle Alternative ist.",
        c: "es in allen Städten viele Radwege gibt."
      },
      correctAnswer: 'b',
      feedbackCorrectDE: "Richtig! Im Text steht, dass das Fahrrad 'nicht nur umweltfreundlich, sondern oft auch schneller als das Auto' ist.",
      feedbackCorrectFR: "Correct ! Le texte indique que le vélo est 'non seulement écologique, mais souvent aussi plus rapide que la voiture'.",
      relevantTextSnippet: "Es ist nicht nur umweltfreundlich, sondern oft auch schneller als das Auto, besonders im dichten Stadtverkehr.",
      commonMistakeExplanationFR: "L'option 'a' est incorrecte car le texte mentionne justement des problèmes de sécurité. L'option 'c' est fausse car seules quelques villes comme Münster sont citées comme exemples positifs."
    },
    {
      id: 7,
      question: "Ein Hauptproblem für Radfahrer ist",
      options: {
        a: "die fehlende Sicherheit auf den Straßen.",
        b: "der hohe Preis von Fahrrädern.",
        c: "das Verbot, Fahrräder in Zügen mitzunehmen."
      },
      correctAnswer: 'a',
      feedbackCorrectDE: "Richtig! Der Text sagt: 'Ein Problem bleibt jedoch die Sicherheit. Viele Radfahrer fühlen sich unsicher'.",
      feedbackCorrectFR: "Correct ! Le texte dit : 'Un problème demeure cependant la sécurité. De nombreux cyclistes ne se sentent pas en sécurité'.",
      relevantTextSnippet: "Ein Problem bleibt jedoch die Sicherheit. Viele Radfahrer fühlen sich unsicher, wenn sie sich die Straße mit Autos und Bussen teilen müssen.",
      commonMistakeExplanationFR: "L'option 'c' est fausse. Le texte dit que le transport en train est autorisé ('erlaubt'), même si c'est parfois difficile aux heures de pointe."
    },
    {
      id: 8,
      question: "Der ADFC setzt sich dafür ein, dass",
      options: {
        a: "mehr Menschen Fahrrad fahren.",
        b: "die Radwege besser und sicherer werden.",
        c: "es mehr Fahrrad-Clubs in Deutschland gibt."
      },
      correctAnswer: 'b',
      feedbackCorrectDE: "Richtig! Der ADFC fordert 'breitere und klar getrennte Radwege'.",
      feedbackCorrectFR: "Correct ! L'ADFC demande des 'pistes cyclables plus larges et clairement séparées'.",
      relevantTextSnippet: "Deshalb fordert der Allgemeine Deutsche Fahrrad-Club (ADFC) breitere und klar getrennte Radwege.",
      commonMistakeExplanationFR: "Bien que l'ADFC veuille probablement que plus de gens fassent du vélo (option a), sa demande spécifique mentionnée dans le texte concerne l'amélioration des infrastructures."
    },
    {
      id: 9,
      question: "Die Kombination von Fahrrad und Zug",
      options: {
        a: "ist grundsätzlich nicht möglich.",
        b: "wird durch neue Lösungen der Deutschen Bahn verbessert.",
        c: "ist immer einfach und unkompliziert."
      },
      correctAnswer: 'b',
      feedbackCorrectDE: "Richtig! Laut Text arbeitet die Deutsche Bahn an 'neuen Lösungen, wie zum Beispiel größeren Fahrradabteilen'.",
      feedbackCorrectFR: "Correct ! Selon le texte, la Deutsche Bahn travaille sur de 'nouvelles solutions, comme par exemple des compartiments à vélos plus grands'.",
      relevantTextSnippet: "Die Deutsche Bahn arbeitet an neuen Lösungen, wie zum Beispiel größeren Fahrradabteilen in Regionalzügen, um das Pendeln für Radfahrer einfacher zu machen.",
      commonMistakeExplanationFR: "L'option 'c' est incorrecte, car le texte précise qu'il peut être 'difficile' de trouver une place aux heures de pointe ('in Stoßzeiten')."
    },
    {
      id: 10,
      question: "Um Fahrraddiebstahl zu vermeiden, wünschen sich viele Leute",
      options: {
        a: "mehr bewachte Fahrradparkhäuser.",
        b: "dass die Polizei mehr kontrolliert.",
        c: "günstigere Schlösser."
      },
      correctAnswer: 'a',
      feedbackCorrectDE: "Richtig! Der Text erwähnt, dass Initiativen für 'bewachte Fahrradparkhäuser ... als positive Entwicklung gesehen' werden.",
      feedbackCorrectFR: "Correct ! Le texte mentionne que les initiatives pour des 'parkings à vélos surveillés ... sont vues comme un développement positif'.",
      relevantTextSnippet: "Initiativen für bewachte Fahrradparkhäuser, wie es sie schon in einigen Städten gibt, werden als positive Entwicklung gesehen.",
      commonMistakeExplanationFR: "Le texte mentionne qu'un bon cadenas ('ein gutes Schloss') est indispensable, mais le souhait pour une amélioration concerne les 'parkings sécurisés' ('sichere Abstellplätze'), pas le prix des cadenas."
    }
  ]
};


const LeseverstehenTeil2Example: React.FC<LeseverstehenTeil2ExampleProps> = ({ onBack, onStartTraining, isLoading }) => {
  const [exercise, setExercise] = useState<LeseverstehenTeil2ExampleData>(initialExerciseData);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [highlightedSnippet, setHighlightedSnippet] = useState<string | null>(null);

  const loadExercise = async () => {
    setIsLoadingExample(true);
    setError(null);
    setUserAnswers({});
    setHighlightedSnippet(null);
    try {
      const data = await generateLeseverstehenTeil2Example();
      setExercise(data);
    } catch (err) {
      setError("Fehler beim Generieren des Beispiels. Bitte versuchen Sie es erneut.");
      console.error(err);
    } finally {
      setIsLoadingExample(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string, snippet: string) => {
    if (userAnswers[questionId]) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    const question = exercise.questions.find(q => q.id === questionId);
    if (question && answer !== question.correctAnswer) {
      setHighlightedSnippet(snippet);
    } else {
      setHighlightedSnippet(null); // Clear highlight on correct answer
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setHighlightedSnippet(null);
  };
  
  const highlightedText = useMemo(() => {
    if (!exercise.text) return '';
    if (!highlightedSnippet) return exercise.text;
    
    // Escape special characters for regex
    const escapedSnippet = highlightedSnippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSnippet})`, 'g');
    return exercise.text.replace(regex, `<mark class="bg-yellow-300 dark:bg-yellow-500 rounded px-1">$1</mark>`);
  }, [exercise.text, highlightedSnippet]);


  if (error) {
    return <div className="text-center p-8"><p className="text-red-500">{error}</p><button onClick={loadExercise} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Erneut versuchen</button></div>;
  }

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">Explication: Leseverstehen Teil 2 (Detailverstehen)</h3>
      <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6 space-y-2">
        <p><strong>📖 Consigne :</strong> Lisez le texte, puis pour chaque question (6–10), choisissez la bonne réponse (a, b ou c).</p>
        <p><strong>🎯 Stratégie :</strong> Lisez d'abord les questions pour savoir quelles informations chercher. Ensuite, lisez le texte en cherchant les mots-clés (noms, lieux, chiffres) liés aux questions. La bonne réponse est souvent une paraphrase de l'information du texte, pas une copie mot à mot.</p>
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6">
        <h4 className="font-bold text-lg mb-2">Text</h4>
        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedText || '' }}></div>
      </div>
      
      <div className="space-y-6">
        {exercise.questions.map(q => {
          const selectedAnswer = userAnswers[q.id];
          const isAnswered = !!selectedAnswer;
          const isCorrect = isAnswered && selectedAnswer === q.correctAnswer;

          return (
            <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <p className="font-semibold mb-3">{q.id}. {q.question}</p>
              <div className="space-y-2">
                {Object.entries(q.options).map(([key, value]) => (
                  <label key={key} className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all ${isAnswered ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700'} ${isAnswered && key === q.correctAnswer ? 'border-green-500' : isAnswered && key === selectedAnswer ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                     <input type="radio" name={`q-${q.id}`} value={key} checked={selectedAnswer === key} onChange={() => handleAnswerChange(q.id, key, q.relevantTextSnippet)} disabled={isAnswered} className="form-radio h-5 w-5 text-blue-600"/>
                     <span><strong>{key})</strong> {value}</span>
                  </label>
                ))}
              </div>

              {isAnswered && (
                <div className="mt-3 text-sm animate-fade-in">
                  {isCorrect ? (
                    <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg">
                      <p><strong>✅ Richtig!</strong> {q.feedbackCorrectDE} <em className="text-slate-500">({q.feedbackCorrectFR})</em></p>
                    </div>
                  ) : (
                    <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg space-y-2">
                      <p><strong>❌ Falsch.</strong> La bonne réponse est <strong>({q.correctAnswer})</strong>.</p>
                      <p><strong>Explication :</strong> {q.commonMistakeExplanationFR}</p>
                      <p className="font-semibold">L'information clé se trouve dans cette partie du texte (surlignée en jaune ci-dessus). 👆</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button onClick={handleReset} className="px-5 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors">
          🔄 Wiederholen
        </button>
        <button onClick={loadExercise} disabled={isLoadingExample} className="px-5 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors disabled:bg-slate-400 flex items-center">
           {isLoadingExample ? <Spinner /> : '♻️ Neues Beispiel generieren'}
        </button>
      </div>
      
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

export default LeseverstehenTeil2Example;