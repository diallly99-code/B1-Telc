import React from 'react';

export enum ModuleType {
  Leseverstehen = 'Leseverstehen',
  Hoerverstehen = 'Hörverstehen',
  Sprachbausteine = 'Sprachbausteine',
  SchriftlicherAusdruck = 'Schriftlicher Ausdruck',
  MuendlicherAusdruck = 'Mündlicher Ausdruck',
  Grammatik = 'Grammatik',
}

export interface Module {
  id: ModuleType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  instructions: string;
}

export interface Score {
  correct: number;
  total: number;
  date: string;
}

export interface UserProfile {
  scores: Record<ModuleType, Score[]>;
  overallAdvice: string;
}

// Exercise specific types
export interface SprachbausteineQuestion {
  id: number; // 21-30
  options: { a: string; b: string; c: string };
  answer: 'a' | 'b' | 'c';
  explanationDE: string;
  explanationFR: string;
  learningTip: string;
}

export interface SprachbausteineExerciseData {
  textWithGaps: string;
  questions: SprachbausteineQuestion[];
}

export interface SprachbausteineTeil2WordOption {
    letter: string;
    word: string;
    translationFR: string;
}

export interface SprachbausteineTeil2Solution {
    gapId: number;
    correctWordLetter: string;
    explanationDE: string;
    explanationFR: string;
    learningTip: string;
}

export interface SprachbausteineTeil2ExerciseData {
  textWithGaps: string;
  wordOptions: SprachbausteineTeil2WordOption[];
  solutions: SprachbausteineTeil2Solution[];
}

export interface SchriftlicherAusdruckExerciseData {
    subject: string;
    guidingPoints: { pointDE: string; pointFR:string }[];
    type: 'email' | 'letter';
    formality: 'formal' | 'informal' | 'halbformell';
    situation: string;
    task: string;
}

export interface GuidingPointFeedback {
    point: string;
    covered: boolean;
    explanation: string;
    quote: string;
}

export interface LinguisticHelpData {
    anrede: string[];
    einleitung: string[];
    hauptteil: {
        title: string;
        points: string[];
    }[];
    schluss: string[];
}

// Schriftlicher Ausdruck - Training Mode Types
export type WritingTrainerMode = 'selection' | 'training' | 'exam';

export enum MicroExerciseType {
    // Section II
    BRIEF_ODER_EMAIL = 'BRIEF_ODER_EMAIL',
    ANREDE_UND_GRUSS = 'ANREDE_UND_GRUSS',
    WELCHES_THEMA_PASST = 'WELCHES_THEMA_PASST',
    KURZE_MITTEILUNGEN = 'KURZE_MITTEILUNGEN',
    INTENTION_ERKENNEN = 'INTENTION_ERKENNEN',
    AUF_ANZEIGE_ANTWORTEN = 'AUF_ANZEIGE_ANTWORTEN',
    // Section III
    PERSOENLICHE_EMAIL = 'PERSOENLICHE_EMAIL',
    HALBFORMELLE_EMAIL = 'HALBFORMELLE_EMAIL',
    MEINUNG_SAGEN = 'MEINUNG_SAGEN',
    ZUSTIMMEN_ODER_WIDERSPRECHEN = 'ZUSTIMMEN_ODER_WIDERSPRECHEN',
    ANREDE_SCHLUSSFORMEL_VARIEREN = 'ANREDE_SCHLUSSFORMEL_VARIEREN',
    ETWAS_BEGRUENDEN = 'ETWAS_BEGRUENDEN',
    ABLEHNUNG_SCHREIBEN = 'ABLEHNUNG_SCHREIBEN',
    EINLADUNG_SCHREIBEN = 'EINLADUNG_SCHREIBEN',
    // Section IV
    TRAINING_AUFGABE_1 = 'TRAINING_AUFGABE_1',
    TRAINING_AUFGABE_2 = 'TRAINING_AUFGABE_2',
    TRAINING_AUFGABE_3 = 'TRAINING_AUFGABE_3',
    // Section V (Full Simulation with detailed feedback)
    SIMULATION_AUFGABE_1 = 'SIMULATION_AUFGABE_1',
    SIMULATION_AUFGABE_2 = 'SIMULATION_AUFGABE_2',
    SIMULATION_AUFGABE_3 = 'SIMULATION_AUFGABE_3'
}

export interface MicroExerciseData {
    promptDE: string;
    promptFR: string;
    taskDE: string;
    taskFR: string;
    modelPhrases: string[];
    modelSolution: string;
    fullPrompt?: SchriftlicherAusdruckExerciseData; // For exam-like tasks
}

export interface DetailedCorrection {
    feedbackFR: string;
    userTextTranslationFR: string;
    correctedVersionDE: string;
}

export interface MicroCorrection {
    isGood: boolean;
    feedbackTextFR: string;
    correctedTextDE: string;
}


export interface HoerverstehenExerciseData {
    audioScript: string;
    questions: {
        question: string;
        type: 'richtig-falsch' | 'multiple-choice';
        options?: string[]; // For multiple choice
        answer: string; // 'richtig', 'falsch', or the correct option text
    }[];
}

export interface HoerverstehenTeil1Question {
  id: number;
  contextDE: string;
  contextFR: string;
  audioText: string;
  keySentence: string;
  statement: string;
  phoneticKeywords: {
    de: string;
    fr: string;
    ipa: string;
  }[];
  correctAnswer: 'A' | 'B'; // A for Richtig, B for Falsch
  explanationDE: string;
  explanationFR: string;
  strategyTipDE: string;
  strategyTipFR: string;
  voiceGender?: 'female' | 'male';
}

export interface HoerverstehenTeil2DialogueTurn {
  speaker: string;
  text: string;
}

export interface HoerverstehenTeil2Question {
  id: number; // 46-55
  statement: string;
  correctAnswer: 'Richtig' | 'Falsch';
  explanationDE: string;
  explanationFR: string;
  relevantSnippet: string;
}

export interface HoerverstehenTeil2ExerciseData {
  thema: string;
  dialogue: HoerverstehenTeil2DialogueTurn[];
  questions: HoerverstehenTeil2Question[];
}

export interface HoerverstehenTeil2ShortDialogueTurn {
  speaker: string;
  text: string;
}

export interface HoerverstehenTeil2ShortQuestion {
    id: number;
    statement: string;
    correctAnswer: 'Richtig' | 'Falsch';
    keywords: string[];
    explanationDE: string;
    explanationFR: string;
}

export interface HoerverstehenTeil2ShortExerciseData {
  title: string;
  dialogue: HoerverstehenTeil2ShortDialogueTurn[];
  questions: HoerverstehenTeil2ShortQuestion[];
}

export interface HoerverstehenTeil3Question {
  id: number; // 56-60
  aussage: string;
  audioText: string;
  keywords: string[];
  correctAnswer: 'Richtig' | 'Falsch';
  feedbackDE: string;
  feedbackFR: string;
  voiceGender: 'male' | 'female';
}

export interface HoerverstehenTeil3ExerciseData {
  title: string;
  instructions: string[];
  questions: HoerverstehenTeil3Question[];
}

// Hörverstehen Teil 3 - Meinungen verstehen
export interface HoerverstehenTeil3MeinungTurn {
    speaker: string;
    text: string;
    voiceGender: 'male' | 'female';
}

export interface HoerverstehenTeil3MeinungQuestion {
    id: number; // 56-60
    speakerName: string;
}

export interface HoerverstehenTeil3MeinungAffirmation {
    letter: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
    text: string;
}

export interface HoerverstehenTeil3MeinungSolution {
    questionId: number;
    correctAffirmationLetter: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
    feedbackDE: string;
    feedbackFR: string;
    relevantSnippet: string;
}

export interface HoerverstehenTeil3MeinungExerciseData {
    thema: string;
    dialogue: HoerverstehenTeil3MeinungTurn[];
    questions: HoerverstehenTeil3MeinungQuestion[];
    affirmations: HoerverstehenTeil3MeinungAffirmation[];
    solutions: HoerverstehenTeil3MeinungSolution[];
}


export interface LeseverstehenUeberschrift {
  letter: string;
  title: string;
}

export interface LeseverstehenText {
  id: number;
  content: string;
}

export interface LeseverstehenExerciseData {
  headings: LeseverstehenUeberschrift[];
  texts: LeseverstehenText[];
  answers: Record<string, string>;
}

export interface LeseverstehenMiniExercise {
  id: number;
  text: string;
  options: LeseverstehenMiniExerciseOption[];
  correctAnswer: string;
  feedback: string;
}

export interface LeseverstehenMiniExerciseOption {
  letter: string;
  title: string;
}


export interface Feedback {
    explanationDE: string;
    explanationFR: string;
    tipDE: string;
    tipFR: string;
}

export interface LeseverstehenTeil2Question {
  id: number; // 6-10
  question: string;
  options: { a: string; b: string; c: string };
  correctAnswer: 'a' | 'b' | 'c';
  explanationDE: string;
  explanationFR: string;
}

export interface LeseverstehenTeil2ExerciseData {
  text: string;
  questions: LeseverstehenTeil2Question[];
}

export interface LeseverstehenTeil2ExampleQuestion {
  id: number; // 6-10
  question: string;
  options: { a: string; b: string; c: string };
  correctAnswer: 'a' | 'b' | 'c';
  feedbackCorrectDE: string;
  feedbackCorrectFR: string;
  relevantTextSnippet: string;
  commonMistakeExplanationFR: string;
}

export interface LeseverstehenTeil2ExampleData {
  text: string;
  questions: LeseverstehenTeil2ExampleQuestion[];
}

export interface LeseverstehenTeil3Anzeige {
  letter: string;
  content: string;
}

export interface LeseverstehenTeil3Frage {
  id: number;
  text: string;
}

export interface LeseverstehenTeil3Loesung {
  id: number;
  correctAnswerLetter: string;
  explanationDE: string;
  explanationFR: string;
}

export interface LeseverstehenTeil3Lernstrategie {
  aufgabe: string;
  strategie1: string;
  strategie2: string;
  strategie3: string;
  tippDE: string;
  tippFR: string;
}

export interface LeseverstehenTeil3ExerciseData {
  lernstrategie: LeseverstehenTeil3Lernstrategie;
  anzeigen: LeseverstehenTeil3Anzeige[];
  fragen: LeseverstehenTeil3Frage[];
  loesungen: LeseverstehenTeil3Loesung[];
}

export interface LeseverstehenTeil3ExampleLoesung {
  id: number;
  correctAnswerLetter: string;
  relevantSnippet: string | null;
  feedbackCorrectDE: string;
  feedbackCorrectFR: string;
  feedbackIncorrectDE: string;
  feedbackIncorrectFR: string;
}

export interface LeseverstehenTeil3ExampleData {
  anzeigen: LeseverstehenTeil3Anzeige[];
  fragen: LeseverstehenTeil3Frage[];
  loesungen: LeseverstehenTeil3ExampleLoesung[];
}

// Mündlicher Ausdruck Types
export type MuendlichAnswerKey =
  | 'name'
  | 'nameDetails'
  | 'origin'
  | 'cityDescription'
  | 'personalDetails'
  | 'familie'
  | 'wohnSituation'
  | 'residence'
  | 'profession'
  | 'education'
  | 'germanLearning'
  | 'languages'
  | 'motherTongue'
  | 'hobbies'
  | 'futurePlans';

export type PresentationAnswers = Partial<Record<MuendlichAnswerKey, string>>;

export type KandidatBProfile = PresentationAnswers;

export interface ChatMessage {
    speaker: 'A' | 'B';
    text: string;
}

// Mündlicher Ausdruck Teil 2 Types
export interface MuendlicherAusdruckTeil2Character {
  name: string;
  details: string;
  text: string;
}

export interface MuendlicherAusdruckTeil2Thema {
  title: string;
  titleFR: string;
  characters: MuendlicherAusdruckTeil2Character[];
}

export interface MuendlicherAusdruckTeil2UserInput {
  reformulation: string;
  opinion: string;
  question: string;
  experience: string;
}

// Mündlicher Ausdruck - Text Reformulation (used to be Teil 3)
export interface MuendlicherAusdruckTeil3Data {
  theme: string;
  authorName: string;
  text: string;
}

export interface MuendlicherAusdruckTeil3Feedback {
  isCorrect: boolean;
  feedbackDE: string;
  feedbackFR: string;
}

export interface MuendlicherAusdruckTeil3ShortHelp {
  example: string;
  explanationDE: string;
  explanationFR: string;
}

// Mündlicher Ausdruck Teil 3 - Gemeinsam etwas planen
export interface MuendlicherAusdruckTeil3PlanungsThema {
    title: string;
    descriptionDE: string;
    descriptionFR: string;
    planningPoints: string[];
}

export interface PlanungsHilfe {
    "Etwas organisieren": string[];
    "Meinung sagen": string[];
    "Zustimmen / Ablehnen": string[];
    "Sich einigen": string[];
}

// New types for Grammatik module
export interface GrammatikPunkt {
    id: number;
    title: string;
    objective: string;
    explanation: string;
    promptDetails: string; // The specific instructions for Gemini for this point
}

export interface GrammatikExerciseContent {
    question: string;
    options?: string[]; // For QCM
    answer: string;
    explanation: string;
}

export interface GrammatikExerciseData {
    title: string;
    objective: string;
    exercise_type: 'QCM' | 'Texte à trous' | 'Reformulation';
    level: 'A2';
    content: GrammatikExerciseContent[];
}