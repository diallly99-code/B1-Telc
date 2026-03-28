import React, { useState, useEffect } from 'react';
import { Module, ModuleType, LeseverstehenExerciseData, LeseverstehenTeil2ExerciseData, LeseverstehenTeil3ExerciseData, SprachbausteineExerciseData, SprachbausteineTeil2ExerciseData, HoerverstehenTeil3ExerciseData } from '../types';
import { generateExercise } from '../services/geminiService';
import Spinner from './Spinner';
import SprachbausteineExercise from './exercises/SprachbausteineExercise';
import SchriftlicherAusdruckExercise from './exercises/SchriftlicherAusdruckExercise';
import HoerverstehenExercise from './exercises/HoerverstehenExercise';
import HoerverstehenTeil1Exercise from './exercises/HoerverstehenTeil1Exercise';
import HoerverstehenTeil1Example from './exercises/HoerverstehenTeil1Example';
import HoerverstehenTeil2Exercise from './exercises/HoerverstehenTeil2Exercise';
import HoerverstehenTeil2Example from './exercises/HoerverstehenTeil2Example';
import HoerverstehenTeil2ShortExample from './exercises/HoerverstehenTeil2ShortExample';
import HoerverstehenTeil3Exercise from './exercises/HoerverstehenTeil3Exercise';
import HoerverstehenTeil3MeinungExample from './exercises/HoerverstehenTeil3MeinungExample';
import LeseverstehenExercise from './exercises/LeseverstehenExercise';
import LeseverstehenTeil2Exercise from './exercises/LeseverstehenTeil2Exercise';
import LeseverstehenExample from './exercises/LeseverstehenExample';
import LeseverstehenTeil2Example from './exercises/LeseverstehenTeil2Example';
import SprachbausteineTeil2Exercise from './exercises/SprachbausteineTeil2Exercise';
import LeseverstehenTeil3Exercise from './exercises/LeseverstehenTeil3Exercise';
import LeseverstehenTeil3Example from './exercises/LeseverstehenTeil3Example';
import MuendlicherAusdruckTeil1 from './exercises/MuendlicherAusdruckTeil1';
import MuendlicherAusdruckTeil2 from './exercises/MuendlicherAusdruckTeil2';
import MuendlicherAusdruckTeil3 from './exercises/MuendlicherAusdruckTeil3';
import MuendlicherAusdruckTeil3Planen from './exercises/MuendlicherAusdruckTeil3Planen';
import GrammatikExercise from './exercises/GrammatikExercise';


interface ModuleViewProps {
  module: Module;
  addScore: (module: ModuleType, score: { correct: number, total: number }) => void;
  onNavigateHome: () => void;
  onNavigateToPrevious: () => void;
  onNavigateToNext: () => void;
}

type SubView = 'selection' | 'expl_1' | 'expl_2' | 'expl_short_2' | 'expl_3' | 'expl_meinung_3' | 'übung';

// --- Static Data for Instant Exercise Loading ---
const staticLeseverstehenTeil1Data: LeseverstehenExerciseData = {
  headings: [
    { letter: 'a', title: 'Neues Restaurant im Stadtzentrum' },
    { letter: 'b', title: 'Tipps für eine erfolgreiche Jobsuche' },
    { letter: 'c', title: 'Günstiger reisen mit der Bahn' },
    { letter: 'd', title: 'Sport im Park: Kostenlose Angebote' },
    { letter: 'e', title: 'Wie man eine neue Sprache lernt' },
    { letter: 'f', title: 'Die besten Kinofilme der Woche' },
    { letter: 'g', title: 'Sicher im Internet einkaufen' },
    { letter: 'h', title: 'Wohnungssuche in der Großstadt' },
    { letter: 'i', title: 'Kochkurs für italienische Spezialitäten' },
    { letter: 'j', title: 'Klimawandel: Was können wir tun?' }
  ],
  texts: [
    { id: 1, content: 'Die Deutsche Bahn hat ein neues Spar-Ticket eingeführt. Familien und kleine Gruppen können jetzt am Wochenende besonders günstig reisen. Das Angebot gilt für alle Regionalzüge in ganz Deutschland.' },
    { id: 2, content: 'Wer eine neue Wohnung in Berlin oder München sucht, braucht viel Geduld. Die Mieten sind hoch und es gibt nur wenige Angebote. Experten raten, auch in den Randbezirken zu suchen.' },
    { id: 3, content: 'Viele Volkshochschulen bieten jetzt wieder Sprachkurse an. Besonders beliebt sind Spanisch und Japanisch. Man kann zwischen Abendkursen und Intensivkursen am Wochenende wählen.' },
    { id: 4, content: 'Die Polizei warnt vor Betrügern im Internet. Besonders beim Online-Shopping sollte man vorsichtig sein. Achten Sie auf sichere Bezahlmethoden und lesen Sie die Bewertungen anderer Kunden.' },
    { id: 5, content: 'Jeden Samstag um 10 Uhr findet im Stadtpark ein kostenloses Yoga-Training statt. Jeder kann mitmachen, eine Anmeldung ist nicht erforderlich. Man sollte nur eine eigene Matte mitbringen.' }
  ],
  answers: {
    '1': 'c',
    '2': 'h',
    '3': 'e',
    '4': 'g',
    '5': 'd'
  }
};

const staticLeseverstehenTeil2Data: LeseverstehenTeil2ExerciseData = {
  text: `Immer mehr Menschen in deutschen Städten entdecken das Fahrrad als praktisches Verkehrsmittel. Es ist nicht nur umweltfreundlich, sondern oft auch schneller als das Auto, besonders im dichten Stadtverkehr. Städte wie Münster oder Freiburg gelten als Fahrrad-Hauptstädte und investieren viel in den Ausbau von Radwegen.
Ein Problem bleibt jedoch die Sicherheit. Viele Radfahrer fühlen sich unsicher, wenn sie sich die Straße mit Autos und Bussen teilen müssen. Deshalb fordert der Allgemeine Deutsche Fahrrad-Club (ADFC) breitere und klar getrennte Radwege.
Ein weiterer wichtiger Punkt ist die Möglichkeit, das Fahrrad mit öffentlichen Verkehrsmitteln zu kombinieren. In vielen Zügen ist die Mitnahme von Fahrrädern erlaubt, aber in Stoßzeiten kann es schwierig sein, einen Platz zu finden. Die Deutsche Bahn arbeitet an neuen Lösungen, wie zum Beispiel größeren Fahrradabteilen in Regionalzügen, um das Pendeln für Radfahrer einfacher zu machen.
Auch das Thema Diebstahl beschäftigt viele Radfahrer. Ein gutes Schloss ist unerlässlich, aber viele wünschen sich mehr sichere Abstellplätze an Bahnhöfen und in Wohngebieten. Initiativen für bewachte Fahrradparkhäuser, wie es sie schon in einigen Städten gibt, werden als positive Entwicklung gesehen.`,
  questions: [
    {
      id: 6,
      question: "Viele Menschen in deutschen Städten nutzen das Fahrrad, weil",
      options: { a: "es immer sicher ist.", b: "es eine umweltfreundliche und schnelle Alternative ist.", c: "es in allen Städten viele Radwege gibt." },
      correctAnswer: 'b',
      explanationDE: "Richtig! Im Text steht, dass das Fahrrad 'nicht nur umweltfreundlich, sondern oft auch schneller als das Auto' ist.",
      explanationFR: "Correct ! Le texte indique que le vélo est 'non seulement écologique, mais souvent aussi plus rapide que la voiture'."
    },
    {
      id: 7,
      question: "Ein Hauptproblem für Radfahrer ist",
      options: { a: "die fehlende Sicherheit auf den Straßen.", b: "der hohe Preis von Fahrrädern.", c: "das Verbot, Fahrräder in Zügen mitzunehmen." },
      correctAnswer: 'a',
      explanationDE: "Richtig! Der Text sagt: 'Ein Problem bleibt jedoch die Sicherheit. Viele Radfahrer fühlen sich unsicher'.",
      explanationFR: "Correct ! Le texte dit : 'Un problème demeure cependant la sécurité. De nombreux cyclistes ne se sentent pas en sécurité'."
    },
    {
      id: 8,
      question: "Der ADFC setzt sich dafür ein, dass",
      options: { a: "mehr Menschen Fahrrad fahren.", b: "die Radwege besser und sicherer werden.", c: "es mehr Fahrrad-Clubs in Deutschland gibt." },
      correctAnswer: 'b',
      explanationDE: "Richtig! Der ADFC fordert 'breitere und klar getrennte Radwege'.",
      explanationFR: "Correct ! L'ADFC demande des 'pistes cyclables plus larges et clairement séparées'."
    },
    {
      id: 9,
      question: "Die Kombination von Fahrrad und Zug",
      options: { a: "ist grundsätzlich nicht möglich.", b: "wird durch neue Lösungen der Deutschen Bahn verbessert.", c: "ist immer einfach und unkompliziert." },
      correctAnswer: 'b',
      explanationDE: "Richtig! Laut Text arbeitet die Deutsche Bahn an 'neuen Lösungen, wie zum Beispiel größeren Fahrradabteilen'.",
      explanationFR: "Correct ! Selon le texte, la Deutsche Bahn travaille sur de 'nouvelles solutions, comme par exemple des compartiments à vélos plus grands'."
    },
    {
      id: 10,
      question: "Um Fahrraddiebstahl zu vermeiden, wünschen sich viele Leute",
      options: { a: "mehr bewachte Fahrradparkhäuser.", b: "dass die Polizei mehr kontrolliert.", c: "günstigere Schlösser." },
      correctAnswer: 'a',
      explanationDE: "Richtig! Der Text erwähnt, dass Initiativen für 'bewachte Fahrradparkhäuser ... als positive Entwicklung gesehen' werden.",
      explanationFR: "Correct ! Le texte mentionne que les initiatives pour des 'parkings à vélos surveillés ... sont vues comme un développement positif'."
    }
  ]
};

const staticLeseverstehenTeil3Data: LeseverstehenTeil3ExerciseData = {
    lernstrategie: {
        aufgabe: "Finden Sie für jede Situation die passende Anzeige.",
        strategie1: "Lesen Sie zuerst die Situationen (11-20), um zu verstehen, was Sie suchen.",
        strategie2: "Überfliegen Sie dann die Anzeigen (a-l) und suchen Sie nach Schlüsselwörtern, die zu den Situationen passen.",
        strategie3: "Wenn keine Anzeige passt, wählen Sie 'x'. Es kann sein, dass nicht für jede Situation eine Lösung existiert.",
        tippDE: "Achten Sie auf Synonyme und Umschreibungen!",
        tippFR: "Faites attention aux synonymes et aux paraphrases !"
    },
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
        { id: 11, correctAnswerLetter: 'b', explanationDE: "In Anzeige b steht ‚Bei schönem Wetter Gartenbetrieb‘ – das passt zu ‚draußen sitzen‘.", explanationFR: "Dans l’annonce b, on lit « jardin en plein air », ce qui correspond à la demande." },
        { id: 12, correctAnswerLetter: 'a', explanationDE: "Anzeige a bietet Gerichte 'zum Mitnehmen'.", explanationFR: "L'annonce a propose des plats 'à emporter'." },
        { id: 13, correctAnswerLetter: 'd', explanationDE: "Anzeige d ist ein 'Flug- und Hotelspezialist' für die USA.", explanationFR: "L'annonce d est un 'spécialiste des vols et hôtels' pour les États-Unis." },
        { id: 14, correctAnswerLetter: 'x', explanationDE: "Keine Anzeige bietet Last-Minute-Flüge an. Anzeige j empfiehlt sogar, früh zu buchen.", explanationFR: "Aucune annonce ne propose de vols de dernière minute. L'annonce j recommande même de réserver tôt." },
        { id: 15, correctAnswerLetter: 'e', explanationDE: "Anzeige e hat 'Spezialpreise für Studenten' für Flüge in die USA.", explanationFR: "L'annonce e a des 'prix spéciaux pour étudiants' pour des vols vers les États-Unis." },
        { id: 16, correctAnswerLetter: 'i', explanationDE: "Anzeige i bietet 'Nachhilfe in Mathe-Physik'.", explanationFR: "L'annonce i propose du 'soutien scolaire en maths-physique'." },
        { id: 17, correctAnswerLetter: 'k', explanationDE: "Anzeige k ist für Kinder mit 'Sprach-Schwierigkeiten'.", explanationFR: "L'annonce k est pour les enfants ayant des 'difficultés de langage'." },
        { id: 18, correctAnswerLetter: 'l', explanationDE: "Anzeige l bietet Kurse für 'Deutsch als Fremdsprache' an.", explanationFR: "L'annonce l propose des cours d''allemand comme langue étrangère'." },
        { id: 19, correctAnswerLetter: 'x', explanationDE: "Keine Anzeige ist für einen Jugendclub. Anzeige g ist eine Diskussion, kein Club.", explanationFR: "Aucune annonce ne concerne un club pour jeunes. L'annonce g est une discussion, pas un club." },
        { id: 20, correctAnswerLetter: 'g', explanationDE: "Anzeige g ist eine 'Diskussion über ausländische Jugendliche'.", explanationFR: "L'annonce g concerne une 'discussion sur les jeunes étrangers'." },
    ]
};

const staticSprachbausteineTeil1Data: SprachbausteineExerciseData = {
  textWithGaps: "Liebe Maria, wie geht es dir? Ich hoffe, alles ist gut bei dir. Ich schreibe dir, (21) ich eine tolle Nachricht habe. Nächsten Monat werde ich nach Berlin ziehen! Ich habe dort einen neuen Job (22) und freue mich schon sehr darauf. Die Stadt ist so groß und es gibt so viel zu sehen. Weißt du, (23) ich eine günstige Wohnung finden kann? Vielleicht hast du einen Tipp für mich. Ich würde mich (24), wenn du mich bald besuchen kommst. Wir könnten zusammen die Stadt erkunden. (25) du Zeit am ersten Wochenende im nächsten Monat? Das wäre super. Ich muss jetzt leider Schluss machen, (26) ich noch viel zu tun habe. Ich muss meine Sachen packen und den Umzug organisieren. Es ist (27) stressig, aber auch aufregend. (28) ich in Berlin bin, melde ich mich sofort bei dir. Ich kann es kaum erwarten, dich wiederzusehen. Schreib mir bald zurück und sag mir, (29) du kommen kannst. Viele Grüße und bis bald, dein Freund, Peter. Ich hoffe, du hast eine (30) Zeit.",
  questions: [
    { id: 21, options: { a: "weil", b: "obwohl", c: "denn" }, answer: 'a', explanationDE: "'weil' leitet einen Nebensatz ein, der einen Grund angibt.", explanationFR: "'weil' (parce que) introduit une subordonnée qui indique une raison.", learningTip: "Achte auf den Unterschied zwischen 'weil' (Nebensatz, Verb am Ende) und 'denn' (Hauptsatz, Verb an Position 2)." },
    { id: 22, options: { a: "gefunden", b: "gesucht", c: "verloren" }, answer: 'a', explanationDE: "Im Kontext eines neuen Jobs ist 'gefunden' das passende Partizip II von 'finden'.", explanationFR: "Dans le contexte d'un nouvel emploi, 'gefunden' (trouvé) est le participe passé approprié.", learningTip: "Lerne die Partizip II-Formen der unregelmäßigen Verben." },
    { id: 23, options: { a: "was", b: "wer", c: "wo" }, answer: 'c', explanationDE: "'wo' fragt nach einem Ort, in diesem Fall dem Ort der Wohnung.", explanationFR: "'wo' (où) est utilisé pour demander un lieu, dans ce cas l'emplacement de l'appartement.", learningTip: "Unterscheide die W-Fragen: wo (Ort), was (Sache), wer (Person), wann (Zeit)." },
    { id: 24, options: { a: "freuen", b: "ärgern", c: "langweilen" }, answer: 'a', explanationDE: "Der Ausdruck 'sich freuen' passt positiv zum Kontext des Besuchs.", explanationFR: "L'expression 'sich freuen' (se réjouir) correspond positivement au contexte de la visite.", learningTip: "Lerne feste Ausdrücke mit Reflexivpronomen wie 'sich freuen auf/über'." },
    { id: 25, options: { a: "Hast", b: "Bist", c: "Wirst" }, answer: 'a', explanationDE: "Der Ausdruck ist 'Zeit haben'. Daher ist 'Hast' die korrekte Form von 'haben' in der 2. Person Singular.", explanationFR: "L'expression est 'Zeit haben' (avoir le temps). 'Hast' est donc la forme correcte de 'haben' à la 2ème personne du singulier.", learningTip: "Merke dir die Kollokation 'Zeit haben'." },
    { id: 26, options: { a: "aber", b: "oder", c: "denn" }, answer: 'c', explanationDE: "'denn' leitet einen Hauptsatz ein, der eine Begründung gibt, ähnlich wie 'weil'.", explanationFR: "'denn' (car) introduit une proposition principale qui donne une explication, similaire à 'weil'.", learningTip: "Nach 'denn' folgt ein Hauptsatz (Subjekt-Verb...), nach 'weil' ein Nebensatz (..., Subjekt...Verb)." },
    { id: 27, options: { a: "etwas", b: "nichts", c: "jemand" }, answer: 'a', explanationDE: "'etwas' bedeutet 'un peu' und passt hier, um den Stress zu beschreiben.", explanationFR: "'etwas' signifie 'un peu' et convient ici pour décrire le stress.", learningTip: "'etwas' kann als Adverb verwendet werden, um ein Adjektiv abzuschwächen." },
    { id: 28, options: { a: "Wenn", b: "Als", c: "Ob" }, answer: 'a', explanationDE: "'Wenn' wird für eine zukünftige, einmalige Bedingung verwendet.", explanationFR: "'Wenn' (quand, si) est utilisé pour une condition future et unique.", learningTip: "Verwende 'wenn' für zukünftige oder wiederholte Handlungen und 'als' für eine einmalige Handlung in der Vergangenheit." },
    { id: 29, options: { a: "dass", b: "ob", c: "wann" }, answer: 'b', explanationDE: "'ob' leitet einen indirekten Fragesatz ein, der eine Ja/Nein-Frage darstellt ('Kannst du kommen?').", explanationFR: "'ob' (si) introduit une question indirecte qui correspond à une question fermée (oui/non) ('Peux-tu venir ?').", learningTip: "Benutze 'ob' für indirekte Ja/Nein-Fragen." },
    { id: 30, options: { a: "gute", b: "schlechte", c: "langweilige" }, answer: 'a', explanationDE: "Am Ende eines Briefes wünscht man normalerweise etwas Positives, daher 'gute Zeit'.", explanationFR: "À la fin d'une lettre, on souhaite généralement quelque chose de positif, d'où 'gute Zeit' (du bon temps).", learningTip: "Achte auf die Adjektivdeklination: 'eine' (feminin, Akkusativ) -> 'gute'." }
  ]
};

const staticSprachbausteineTeil2Data: SprachbausteineTeil2ExerciseData = {
  textWithGaps: "Sehr geehrte Damen und Herren, ich habe Ihre Anzeige in der Zeitung gelesen und interessiere mich sehr (31) die Stelle als Büroassistent. Ich habe (32) meine Ausbildung als Kaufmann für Büromanagement abgeschlossen und suche nun eine neue Herausforderung. Zu (33) Stärken gehören Zuverlässigkeit und eine schnelle Auffassungsgabe. Ich arbeite gern im Team, kann aber (34) selbstständig Aufgaben erledigen. Ich spreche fließend Englisch und habe gute Kenntnisse in den gängigen Office-Programmen. (35) meiner bisherigen Tätigkeit war ich für die Organisation von Terminen und die Korrespondenz mit Kunden zuständig. Ich bin sehr motiviert und würde mich (36) freuen, wenn Sie mir die Gelegenheit zu einem persönlichen Gespräch (37) würden. Einem baldigen Arbeitsbeginn steht meinerseits nichts im Wege. Ich bin davon (38), dass ich Ihr Team gut ergänzen kann. Mit freundlichen (39), Max Mustermann. Ich lege meine Bewerbungsunterlagen diesem Schreiben (40).",
  wordOptions: [
    { letter: 'a', word: 'auch', translationFR: 'aussi' }, 
    { letter: 'b', word: 'für', translationFR: 'pour' }, 
    { letter: 'c', word: 'meinen', translationFR: 'mes' }, 
    { letter: 'd', word: 'Grüßen', translationFR: 'salutations' }, 
    { letter: 'e', word: 'überzeugt', translationFR: 'convaincu' }, 
    { letter: 'f', word: 'geben', translationFR: 'donner' }, 
    { letter: 'g', word: 'vor', translationFR: 'avant' }, 
    { letter: 'h', word: 'während', translationFR: 'pendant' }, 
    { letter: 'i', word: 'über', translationFR: 'sur' }, 
    { letter: 'j', word: 'aber', translationFR: 'mais' }, 
    { letter: 'k', word: 'bei', translationFR: 'ci-joint' }, 
    { letter: 'l', word: 'meinem', translationFR: 'mon' }, 
    { letter: 'm', word: 'sofort', translationFR: 'immédiatement' }, 
    { letter: 'n', word: 'gerade', translationFR: 'juste' }, 
    { letter: 'o', word: 'deshalb', translationFR: 'c\'est pourquoi' }
  ],
  solutions: [
    { gapId: 31, correctWordLetter: 'b', explanationDE: "'sich interessieren für' ist eine feste Wendung mit Präposition.", explanationFR: "'sich interessieren für' (s'intéresser à) est une expression fixe avec une préposition.", learningTip: "Lerne Verben mit festen Präpositionen, z.B. 'warten auf', 'denken an', 'sich interessieren für'." },
    { gapId: 32, correctWordLetter: 'n', explanationDE: "'gerade abgeschlossen' bedeutet 'vient de terminer', was hier zeitlich passt.", explanationFR: "'gerade abgeschlossen' signifie 'vient de terminer', ce qui correspond au contexte temporel.", learningTip: "Das Wort 'gerade' kann 'just' oder 'right now' bedeuten." },
    { gapId: 33, correctWordLetter: 'c', explanationDE: "Nach der Präposition 'zu' + Dativ Plural ist 'meinen' die korrekte Form: 'zu meinen Stärken'.", explanationFR: "Après la préposition 'zu' qui régit le datif, 'meinen' est la forme correcte pour le pluriel 'Stärken'.", learningTip: "Die Präposition 'zu' verlangt immer den Dativ. Achte auf die Deklination im Plural." },
    { gapId: 34, correctWordLetter: 'a', explanationDE: "'auch' bedeutet 'aussi' und wird hier verwendet, um eine zusätzliche Fähigkeit zu nennen.", explanationFR: "'auch' signifie 'aussi' et est utilisé ici pour ajouter une compétence supplémentaire.", learningTip: "'aber auch' ist eine häufige Kombination, um einen Kontrast und eine Ergänzung auszudrücken." },
    { gapId: 35, correctWordLetter: 'h', explanationDE: "'während' ist eine temporale Präposition, die 'pendant' bedeutet und den Genitiv verlangt.", explanationFR: "'während' est une préposition temporelle signifiant 'pendant' qui régit le génitif.", learningTip: "Die Präposition 'während' kann auch einen Nebensatz einleiten." },
    { gapId: 36, correctWordLetter: 'i', explanationDE: "'sich freuen über' wird für etwas verwendet, das bereits existiert oder geschieht (das Gespräch).", explanationFR: "'sich freuen über' est utilisé pour quelque chose qui existe déjà ou qui se produit (l'entretien).", learningTip: "Unterscheide 'sich freuen auf' (Zukunft) und 'sich freuen über' (Gegenwart/Vergangenheit)." },
    { gapId: 37, correctWordLetter: 'f', explanationDE: "Die Wendung ist 'eine Gelegenheit geben'. Im Konjunktiv II wird es zu 'geben würden'.", explanationFR: "L'expression est 'donner une opportunité'. Au subjonctif II, cela devient 'geben würden'.", learningTip: "Der Konjunktiv II ('würden' + Infinitiv) wird für höfliche Bitten verwendet." },
    { gapId: 38, correctWordLetter: 'e', explanationDE: "'überzeugt sein' ist eine feste Wendung, die 'être convaincu' bedeutet.", explanationFR: "'überzeugt sein' est une expression fixe qui signifie 'être convaincu'.", learningTip: "Achte auf Partizipien, die als Adjektive mit 'sein' verwendet werden, wie 'überzeugt sein', 'interessiert sein'." },
    { gapId: 39, correctWordLetter: 'd', explanationDE: "'Mit freundlichen Grüßen' ist die Standard-Grußformel am Ende eines formellen Briefes.", explanationFR: "'Mit freundlichen Grüßen' est la formule de politesse standard à la fin d'une lettre formelle.", learningTip: "Lerne die gängigen Grußformeln für formelle und informelle Briefe." },
    { gapId: 40, correctWordLetter: 'k', explanationDE: "Das Verb 'beilegen' wird oft getrennt verwendet: 'Ich lege ... bei'. Es bedeutet 'joindre'.", explanationFR: "Le verbe 'beilegen' (joindre) est souvent utilisé de manière séparable : 'Ich lege ... bei'.", learningTip: "Viele Verben mit der Vorsilbe 'bei-' sind trennbar, z.B. 'beibringen', 'beitreten'." }
  ]
};

const staticHoerverstehenTeil3Data: HoerverstehenTeil3ExerciseData = {
  title: 'Teil 3 – Kurze Texte verstehen',
  instructions: [
    'Sie hören nun fünf kurze Texte.',
    'Dazu sollen Sie fünf Aufgaben lösen.',
    'Sie hören jeden Text zweimal.',
    'Entscheiden Sie beim Hören, ob die Aussagen 56–60 richtig oder falsch sind.',
    'Markieren Sie PLUS (+) gleich richtig und MINUS (–) gleich falsch.'
  ],
  questions: [
    { id: 56, aussage: 'Das Büro ist in der Schillerstraße.', correctAnswer: 'Richtig', audioText: 'Also, wenn Sie aus dem Bahnhof rauskommen, sind Sie in der Schillerstraße. Gehen Sie dann nach rechts und immer geradeaus, bis Sie zur Kreuzung kommen. Das ist die Königstraße. Überqueren Sie die Königstraße, bleiben Sie aber in der Schillerstraße. Wir sind dann ein Stückchen weiter, gegenüber vom Kino Gloria.', keywords: ['Schillerstraße', 'Königstraße', 'Kino Gloria'], feedbackDE: '✅ Richtig. Im Audio wird gesagt: "wenn Sie aus dem Bahnhof rauskommen, sind Sie in der Schillerstraße". Das bestätigt die Aussage.', feedbackFR: '✅ Correct. Dans l\'audio, il est dit : "quand vous sortez de la gare, vous êtes dans la Schillerstraße". Cela confirme l\'affirmation.', voiceGender: 'male' },
    { id: 57, aussage: 'Der Film „Sommer“ läuft im Filmcasino.', correctAnswer: 'Richtig', audioText: 'Guten Tag, meine Damen und Herren. Filmcasino: ‘Frühstück bei Tiffany’, 18:30 und 20:30. ‘Sommer’, 18:45 und 21 Uhr. Starke Jungs, 18:15 und 19:45.', keywords: ['Filmcasino', 'Sommer', 'Uhr'], feedbackDE: '✅ Richtig. Im Programm wird angesagt: "Filmcasino: ... ‘Sommer’, 18:45 und 21 Uhr".', feedbackFR: '✅ Correct. Le programme annonce : "Filmcasino: ... « Sommer », 18h45 et 21h".', voiceGender: 'female' },
    { id: 58, aussage: 'Im Süden Bayerns wird es am Nachmittag schön und nicht sehr warm.', correctAnswer: 'Richtig', audioText: 'Südbayern: Anfangs noch etwas Regen, später zunehmend sonnig mit Höchsttemperaturen bis 18 Grad.', keywords: ['Südbayern', 'sonnig', '18 Grad'], feedbackDE: '✅ Richtig. Die Wettervorhersage lautet: "später zunehmend sonnig mit Höchsttemperaturen bis 18 Grad", was "schön und nicht sehr warm" entspricht.', feedbackFR: '✅ Correct. Le bulletin météo annonce : "plus tard, de plus en plus ensoleillé avec des températures maximales jusqu\'à 18 degrés", ce qui correspond à "beau et pas très chaud".', voiceGender: 'male' },
    { id: 59, aussage: 'Im Zugrestaurant können Sie auch Zeitungen kaufen.', correctAnswer: 'Falsch', audioText: 'Willkommen im ICE Riemenschneider von Hamburg nach Nürnberg. Unser Zugrestaurant befindet sich zwischen der ersten und zweiten Klasse. Zeitungen können Sie dort leider nicht kaufen.', keywords: ['ICE', 'Zugrestaurant', 'Zeitungen', 'leider nicht'], feedbackDE: '❌ Falsch. Die Durchsage sagt klar: "Zeitungen können Sie dort leider nicht kaufen".', feedbackFR: '❌ Faux. L\'annonce dit clairement : "vous ne pouvez malheureusement pas y acheter de journaux".', voiceGender: 'female' },
    { id: 60, aussage: 'Damenröcke kosten heute 39 Euro.', correctAnswer: 'Richtig', audioText: 'Sommerschlussverkauf! Damenröcke nur 39 Euro, Pullover 19 Euro, Herrenhemden 5 Euro.', keywords: ['Damenröcke', '39 Euro', 'Sommerschlussverkauf'], feedbackDE: '✅ Richtig. Die Werbung sagt: "Damenröcke nur 39 Euro".', feedbackFR: '✅ Correct. La publicité annonce : "Jupes pour femmes seulement 39 euros".', voiceGender: 'male' }
  ]
};


const ModuleView: React.FC<ModuleViewProps> = ({ module, addScore, onNavigateHome, onNavigateToPrevious, onNavigateToNext }) => {
  const [exerciseData, setExerciseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<1 | 2 | 3 | 4 | null>(null);
  const [subView, setSubView] = useState<SubView | null>(null);

  useEffect(() => {
    setExerciseData(null);
    setError(null);
    setIsLoading(false);
    setSelectedPart(null);
    if (module.id === ModuleType.Leseverstehen || module.id === ModuleType.Sprachbausteine || module.id === ModuleType.MuendlicherAusdruck || module.id === ModuleType.Hoerverstehen) {
      setSubView('selection');
    } else {
      setSubView(null);
    }
  }, [module.id]);

  const handleGenerateExercise = async (part: 1 | 2 | 3) => {
    setIsLoading(true);
    setError(null);
    setExerciseData(null);
    setSelectedPart(part);
    setSubView('übung');
    try {
      const data = await generateExercise(module.id, part);
      setExerciseData(data);
    } catch (err) {
      setError('Impossible de générer l\'exercice. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStaticExercise = (part: 1 | 2 | 3) => {
    setIsLoading(false);
    setError(null);
    setExerciseData(null);
    setSelectedPart(part);
    setSubView('übung');

    if (module.id === ModuleType.Leseverstehen) {
        switch (part) {
        case 1:
            setExerciseData(staticLeseverstehenTeil1Data);
            break;
        case 2:
            setExerciseData(staticLeseverstehenTeil2Data);
            break;
        case 3:
            setExerciseData(staticLeseverstehenTeil3Data);
            break;
        }
    } else if (module.id === ModuleType.Sprachbausteine) {
        switch (part) {
            case 1:
                setExerciseData(staticSprachbausteineTeil1Data);
                break;
            case 2:
                setExerciseData(staticSprachbausteineTeil2Data);
                break;
        }
    } else if (module.id === ModuleType.Hoerverstehen) {
        if (part === 3) {
            setExerciseData(staticHoerverstehenTeil3Data);
        }
    }
  };
  
  const handleBackToSelection = () => {
    setSubView('selection');
    setExerciseData(null);
    setSelectedPart(null);
    setError(null);
  };

  const renderContent = () => {
    if (module.id === ModuleType.Grammatik) {
        return <GrammatikExercise addScore={(score) => addScore(module.id, score)} />;
    }
    if (module.id === ModuleType.SchriftlicherAusdruck) {
        return <SchriftlicherAusdruckExercise />;
    }

    if (subView) {
      switch (subView) {
        case 'selection':
            if (module.id === ModuleType.Hoerverstehen) {
                return (
                    <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{module.instructions}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                                <h4 className="font-bold text-lg mb-3">Apprendre la stratégie</h4>
                                <p className="text-sm mb-4">Commencez par une explication interactive pour maîtriser la méthode.</p>
                                <div className="flex flex-col gap-3 w-full">
                                    <button onClick={() => setSubView('expl_1')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">Explication Teil 1</button>
                                    <button onClick={() => setSubView('expl_2')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-700 hover:bg-green-800 transition-colors">Explication Teil 2 (détaillée)</button>
                                    <button onClick={() => setSubView('expl_short_2')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-800 hover:bg-green-900 transition-colors">Explication Teil 2 (courte)</button>
                                    <button onClick={() => setSubView('expl_meinung_3')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-900 hover:bg-opacity-90 transition-colors">🎯 Explication Teil 3 (Meinungen)</button>
                                </div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                                <h4 className="font-bold text-lg mb-3">S'entraîner (type examen)</h4>
                                <p className="text-sm mb-4">Générez un exercice complet dans les conditions de l'examen.</p>
                                <div className="flex flex-col gap-3 w-full">
                                    <button onClick={() => { setSelectedPart(1); setSubView('übung'); }} className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors bg-green-500 hover:bg-green-600`}>Teil 1: Kurze Mitteilungen</button>
                                    <button onClick={() => { setSelectedPart(2); setSubView('übung'); }} className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors bg-green-600 hover:bg-green-700`}>Teil 2: Ein Gespräch verstehen</button>
                                    <button onClick={() => { setSelectedPart(3); setSubView('übung'); handleStartStaticExercise(3); }} className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors bg-green-700 hover:bg-green-800`}>Teil 3: Kurze Texte verstehen</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            if (module.id === ModuleType.MuendlicherAusdruck) {
                return (
                    <div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{module.instructions}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button onClick={() => { setSelectedPart(1); setSubView('übung'); }} className={`px-4 py-8 rounded-lg font-semibold text-white text-xl transition-colors shadow-lg transform hover:-translate-y-1 bg-red-500 hover:bg-red-600 flex flex-col items-center justify-center`}>
                                <span className="text-2xl mb-2">🤝</span> Teil 1: Einander kennenlernen
                            </button>
                            <button onClick={() => { setSelectedPart(2); setSubView('übung'); }} className={`px-4 py-8 rounded-lg font-semibold text-white text-xl transition-colors shadow-lg transform hover:-translate-y-1 bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center`}>
                                <span className="text-2xl mb-2">🗣️</span> Teil 2: Gespräch über ein Thema
                            </button>
                             <button onClick={() => { setSelectedPart(3); setSubView('übung'); }} className={`px-4 py-8 rounded-lg font-semibold text-white text-xl transition-colors shadow-lg transform hover:-translate-y-1 bg-red-700 hover:bg-red-800 flex flex-col items-center justify-center`}>
                                <span className="text-2xl mb-2">📖</span> Réformulez un Text
                            </button>
                             <button onClick={() => { setSelectedPart(4); setSubView('übung'); }} className={`px-4 py-8 rounded-lg font-semibold text-white text-xl transition-colors shadow-lg transform hover:-translate-y-1 bg-red-800 hover:bg-red-900 flex flex-col items-center justify-center`}>
                                <span className="text-2xl mb-2">🗓️</span> Teil 3: Gemeinsam etwas planen
                            </button>
                        </div>
                    </div>
                );
            }
            const part1Title = module.id === ModuleType.Leseverstehen ? 'Teil 1: Globalverstehen' : 'Teil 1: Multiple-Choice';
            const part2Title = module.id === ModuleType.Leseverstehen ? 'Teil 2: Detailverstehen' : 'Teil 2: Text mit Lücken';
            const part3Title = 'Teil 3: Anzeigen & Situationen';
            
            return (
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{module.instructions}</p>
                {module.id === ModuleType.Sprachbausteine ? (
                   <div className="flex flex-col md:flex-row gap-6">
                        <button onClick={() => handleStartStaticExercise(1)} disabled={isLoading} className={`flex-1 px-4 py-8 rounded-lg font-semibold text-white text-xl transition-colors shadow-lg transform hover:-translate-y-1 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-400`}>
                            {part1Title}
                        </button>
                        <button onClick={() => handleStartStaticExercise(2)} disabled={isLoading} className={`flex-1 px-4 py-8 rounded-lg font-semibold text-white text-xl transition-colors shadow-lg transform hover:-translate-y-1 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-400`}>
                            {part2Title}
                        </button>
                    </div>
                ) : (
                    // Leseverstehen layout
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                        <h4 className="font-bold text-lg mb-3">Apprendre la stratégie</h4>
                        <p className="text-sm mb-4">Commencez par une explication interactive pour maîtriser la méthode.</p>
                        <div className="flex flex-col gap-3 w-full">
                            <button onClick={() => setSubView('expl_1')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">Explication Teil 1</button>
                            <button onClick={() => setSubView('expl_2')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-700 hover:bg-green-800 transition-colors">Explication Teil 2</button>
                            <button onClick={() => setSubView('expl_3')} className="w-full px-4 py-2 rounded-lg font-semibold text-white bg-green-800 hover:bg-green-900 transition-colors">Explication Teil 3</button>
                        </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                        <h4 className="font-bold text-lg mb-3">S'entraîner (type examen)</h4>
                        <p className="text-sm mb-4">Générez un exercice complet dans les conditions de l'examen.</p>
                        <div className="flex flex-col gap-3 w-full">
                            <button onClick={() => handleStartStaticExercise(1)} disabled={isLoading} className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400`}>{part1Title}</button>
                            <button onClick={() => handleStartStaticExercise(2)} disabled={isLoading} className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400`}>{part2Title}</button>
                            <button onClick={() => handleStartStaticExercise(3)} disabled={isLoading} className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors bg-blue-900 hover:bg-opacity-90 disabled:bg-slate-400`}>{part3Title}</button>
                        </div>
                        </div>
                    </div>
                )}
              </div>
            );
        
        case 'expl_1':
          if (module.id === ModuleType.Leseverstehen) return <LeseverstehenExample onStartTraining={() => handleStartStaticExercise(1)} onBack={handleBackToSelection} isLoading={isLoading} />;
          if (module.id === ModuleType.Hoerverstehen) return <HoerverstehenTeil1Example onStartTraining={() => { setSelectedPart(1); setSubView('übung'); }} onBack={handleBackToSelection} />;
          return null;

        case 'expl_2':
          if (module.id === ModuleType.Leseverstehen) return <LeseverstehenTeil2Example onBack={handleBackToSelection} onStartTraining={() => handleStartStaticExercise(2)} isLoading={isLoading} />;
          if (module.id === ModuleType.Hoerverstehen) return <HoerverstehenTeil2Example onBack={handleBackToSelection} onStartTraining={() => { setSelectedPart(2); setSubView('übung'); }} />;
          return null;

        case 'expl_short_2':
          if (module.id === ModuleType.Hoerverstehen) return <HoerverstehenTeil2ShortExample onBack={handleBackToSelection} onStartTraining={() => { setSelectedPart(2); setSubView('übung'); }} />;
          return null;

        case 'expl_3':
            if (module.id === ModuleType.Leseverstehen) return <LeseverstehenTeil3Example onBack={handleBackToSelection} onStartTraining={() => handleStartStaticExercise(3)} isLoading={isLoading} />;
            return null;

        case 'expl_meinung_3':
            if (module.id === ModuleType.Hoerverstehen) return <HoerverstehenTeil3MeinungExample onBack={handleBackToSelection} />;
            return null;

        case 'übung':
          if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
          if (error) return <p className="mt-4 text-red-500">{error}</p>;

          if (module.id === ModuleType.MuendlicherAusdruck) {
              if (selectedPart === 1) return <MuendlicherAusdruckTeil1 />;
              if (selectedPart === 2) return <MuendlicherAusdruckTeil2 />;
              if (selectedPart === 3) return <MuendlicherAusdruckTeil3 />;
              if (selectedPart === 4) return <MuendlicherAusdruckTeil3Planen />;
              return null;
          }
          
          if (module.id === ModuleType.Hoerverstehen) {
            if (selectedPart === 1) {
              return <HoerverstehenTeil1Exercise onComplete={(score) => addScore(module.id, score)} />;
            }
            if (selectedPart === 2) {
              return <HoerverstehenTeil2Exercise onComplete={(score) => addScore(module.id, score)} />;
            }
            if (selectedPart === 3 && exerciseData) {
              return <HoerverstehenTeil3Exercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(3)} isLoading={isLoading} />;
            }
          }
          
          if (!exerciseData) return null;

          switch (module.id) {
            case ModuleType.Leseverstehen:
              if (selectedPart === 1) return <LeseverstehenExercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(1)} isLoading={isLoading} />;
              if (selectedPart === 2) return <LeseverstehenTeil2Exercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(2)} isLoading={isLoading} />;
              if (selectedPart === 3) return <LeseverstehenTeil3Exercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(3)} isLoading={isLoading} />;
              return null;
            case ModuleType.Sprachbausteine:
              if (selectedPart === 1) return <SprachbausteineExercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(1)} isLoading={isLoading} />;
              if (selectedPart === 2) return <SprachbausteineTeil2Exercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(2)} isLoading={isLoading} />;
              return null;
            case ModuleType.Hoerverstehen:
                 if (selectedPart === 3) {
                     return <HoerverstehenTeil3Exercise data={exerciseData} onComplete={(score) => addScore(module.id, score)} onGenerateNew={() => handleGenerateExercise(3)} isLoading={isLoading} />;
                 }
                 return null;
          }
      }
    }
    
    // For modules without sub-parts originally, now deprecated path
    return (
        <>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{module.instructions}</p>
          <button
              onClick={() => handleGenerateExercise(1)}
              disabled={isLoading}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300 bg-${module.color}-500 hover:bg-${module.color}-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center`}
          >
              {isLoading ? <Spinner /> : 'Générer un exercice'}
          </button>
        </>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-start justify-between">
        <h2 className={`text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-${module.color}-500 to-${module.color}-700`}>{module.title}</h2>
        {subView && subView !== 'selection' && module.id !== ModuleType.Grammatik && (
          <button onClick={handleBackToSelection} className="text-sm px-3 py-1 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
            ⬅️ Zurück
          </button>
        )}
      </div>
      
      <div className="mt-6">
        {renderContent()}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
                onClick={onNavigateToPrevious}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors w-full sm:w-auto"
                aria-label="Retour à la leçon précédente"
            >
                <span role="img" aria-label="précédent">⬅️</span>
                <span>Précédent</span>
            </button>
            <button
                onClick={onNavigateHome}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors w-full sm:w-auto"
                aria-label="Retour au menu principal"
            >
                <span role="img" aria-label="accueil">🏠</span>
                <span>Menu Principal</span>
            </button>
            <button
                onClick={onNavigateToNext}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors w-full sm:w-auto"
                aria-label="Aller à la leçon suivante"
            >
                <span>Suivant</span>
                <span role="img" aria-label="suivant">➡️</span>
            </button>
        </div>
    </div>
  );
};

export default ModuleView;