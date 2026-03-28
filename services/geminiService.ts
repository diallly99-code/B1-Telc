

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ModuleType, SprachbausteineExerciseData, SchriftlicherAusdruckExerciseData, HoerverstehenExerciseData, Feedback, UserProfile, LeseverstehenExerciseData, LeseverstehenMiniExercise, SprachbausteineTeil2ExerciseData, LeseverstehenTeil2ExerciseData, LeseverstehenTeil2ExampleData, LeseverstehenTeil3ExerciseData, LeseverstehenTeil3ExampleData, PresentationAnswers, ChatMessage, MuendlicherAusdruckTeil2UserInput, MuendlicherAusdruckTeil2Character, MuendlicherAusdruckTeil2Thema, MuendlicherAusdruckTeil3Data, MuendlicherAusdruckTeil3Feedback, MuendlicherAusdruckTeil3ShortHelp, MuendlicherAusdruckTeil3PlanungsThema, PlanungsHilfe, GuidingPointFeedback, LinguisticHelpData, MicroExerciseType, MicroExerciseData, DetailedCorrection, MicroCorrection, HoerverstehenTeil1Question, HoerverstehenTeil2ExerciseData, HoerverstehenTeil2ShortExerciseData, HoerverstehenTeil3ExerciseData, HoerverstehenTeil3MeinungExerciseData, HoerverstehenTeil2DialogueTurn, GrammatikPunkt, GrammatikExerciseData } from '../types';

let aiInstance: GoogleGenAI | null = null;
export const ai = new Proxy({}, {
  get(target, prop) {
    if (!aiInstance) {
      // Try to get the API key from Vite's import.meta.env first, then fallback to process.env
      const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("API_KEY environment variable not set. Please configure VITE_GEMINI_API_KEY in Vercel.");
      }
      aiInstance = new GoogleGenAI({ apiKey: apiKey || 'missing_key' });
    }
    return (aiInstance as any)[prop];
  }
}) as GoogleGenAI;

const model = 'gemini-2.5-flash';

const generateExercisePrompt = (moduleType: ModuleType, part: 1 | 2 | 3 = 1): string => {
    switch(moduleType) {
        case ModuleType.Leseverstehen:
            if (part === 3) {
                return `🎯 Rôle du modèle: Tu es un concepteur d'exercices d'allemand niveau telc B1, expert du format "Leseverstehen Teil 3".

                📘 Consignes: Génère un exercice complet et unique au format JSON.
                1.  **lernstrategie**: Fournis une explication de la tâche pour l'apprenant francophone, incluant la possibilité qu'aucune annonce ne corresponde (réponse 'x').
                    - \`aufgabe\`: Description de la tâche.
                    - \`strategie1\`, \`strategie2\`, \`strategie3\`: Trois stratégies concrètes.
                    - \`tippDE\` & \`tippFR\`: Un conseil d'apprentissage en allemand et français.
                2.  **anzeigen**: Crée une liste d'EXACTEMENT 12 annonces courtes et réalistes (lettres a-l), sur des thèmes variés (voyages, restaurants, cours, services, etc.).
                3.  **fragen**: Crée une liste d'EXACTEMENT 10 questions (numérotées de 11 à 20). Chaque question est une situation.
                4.  **loesungen**: Fournis une liste de solutions pour chaque question.
                    - **Règle importante**: Pour AU MOINS UNE et jusqu'à DEUX questions, aucune annonce ne doit correspondre. La bonne réponse est alors 'x'.
                    - Pour chaque solution, fournis:
                        - \`id\`: Le numéro de la question.
                        - \`correctAnswerLetter\`: La lettre de l'annonce correcte, ou 'x' si aucune ne correspond.
                        - \`explanationDE\`: Courte explication en allemand. Si la réponse est 'x', explique pourquoi aucune annonce ne convient.
                        - \`explanationFR\`: Traduction de l'explication.
                
                Tout le contenu de l'exercice doit être en allemand, sauf les parties spécifiquement en français. Assure-toi que les distracteurs sont plausibles.`;
            }
             if (part === 2) {
                return `Génère un exercice "Leseverstehen Teil 2 (Detailverstehen)" pour le niveau telc B1, destiné à un francophone.
                Le texte doit être authentique niveau B1, environ 200–300 Wörter (thèmes : Schule, Arbeit, Reisen, Alltag, Studium, Familie).

                Fournis une réponse au format JSON qui contient :
                1. "text": Le texte.
                2. "questions": Un tableau de 5 questions (numérotées 6-10).
                Pour chaque question, fournis :
                - "id": Le numéro de la question (6 à 10).
                - "question": Le début de la phrase à compléter (ex: "An den beiden Schulen").
                - "options": Un objet avec trois fins de phrase possibles en minuscules: "a", "b", "c".
                - "correctAnswer": La lettre de la bonne réponse ('a', 'b' ou 'c').
                - "explanationDE": Une courte explication en allemand de la bonne réponse, citant la partie pertinente du texte.
                - "explanationFR": La traduction française de l'explication.

                Les questions doivent IMPÉRATIVEMENT suivre le format telc B1. Voici un exemple de structure à respecter pour une question :
                "7 Die Abiparty der Heinrich-Mann-Schule war fantastisch, weil
                a die Abiturienten einen Film über die Party gemacht haben.
                b die ganze Party im Internet gezeigt wurde.
                c es eine tolle Show gab."

                Assure-toi que tout le contenu est en allemand (sauf explanationFR) et adapté au niveau B1.`;
            }
            return `Génère un exercice "Leseverstehen Teil 1 (Globalverstehen)" pour le niveau telc B1, destiné à un francophone, conforme au format de l'examen.
            Fournis exactement :
            1.  Une liste de 10 "headings" (titres, a-j).
            2.  Une liste de 5 "texts" (textes courts, 1-5).
            3.  Un objet "answers" qui associe l'ID de chaque texte (1-5) à la lettre du titre correct (a-j).
    
            Les thèmes doivent être variés et quotidiens (voyage, culture, technologie, etc.). 5 titres doivent correspondre aux 5 textes, et les 5 autres doivent être des distracteurs plausibles. Assure-toi que tout le contenu est en allemand et adapté au niveau B1.`;
        case ModuleType.Sprachbausteine:
             if (part === 2) {
                return `Rôle du modèle :
Tu es un concepteur d’exercices d’allemand niveau telc Deutsch B1. Ta tâche est de générer des exercices du type Sprachbausteine Teil 2 conformes au format officiel.

Génère un texte court (120–200 mots) avec 10 trous numérotés de 31 à 40, utilisant le format (31).
Fournis une liste de 15 mots (a–o). Chaque mot ne peut être utilisé qu'une seule fois, et 5 mots sont des distracteurs.

La réponse JSON doit contenir :
1. \`textWithGaps\`: Le texte avec les 10 trous.
2. \`wordOptions\`: Un tableau de 15 objets, chacun avec 'letter' (a-o), 'word' (le mot en allemand), et 'translationFR' (sa traduction française précise et adaptée au contexte du texte).
3. \`solutions\`: Un tableau de 10 objets, un pour chaque trou. Chaque objet doit contenir :
    - \`gapId\`: Le numéro du trou (31 à 40).
    - \`correctWordLetter\`: La lettre du mot correct ('a' à 'o').
    - \`explanationDE\`: Une explication simple en allemand de la bonne réponse.
    - \`explanationFR\`: La traduction/clarification en français.
    - \`learningTip\`: Un conseil d'apprentissage personnalisé en allemand lié au point de grammaire/vocabulaire.

Les thèmes doivent correspondre au niveau B1 (vie quotidienne, loisirs, travail, etc.). Tout le contenu doit être en allemand, sauf \`explanationFR\` et \`translationFR\`.`;
            }
            return `Tu es un concepteur d’exercices d’allemand expert pour le niveau telc Deutsch B1. Ta tâche est de générer un exercice du type 'Sprachbausteine Teil 1' conforme au format officiel, destiné à un apprenant francophone.

Fournis une réponse au format JSON qui contient :
1.  \`textWithGaps\`: Un texte court (120–200 mots) avec 10 trous numérotés de 21 à 30, utilisant le format \`(21)\`.
2.  \`questions\`: Un tableau de 10 objets, un pour chaque trou. Chaque objet doit contenir :
    - \`id\`: Le numéro du trou (21 à 30).
    - \`options\`: Un objet avec trois choix : \`a\`, \`b\` et \`c\`.
    - \`answer\`: La bonne réponse ('a', 'b' ou 'c').
    - \`explanationDE\`: Une explication simple en allemand de la bonne réponse.
    - \`explanationFR\`: La traduction/clarification en français de l'explication.
    - \`learningTip\`: Un conseil d'apprentissage personnalisé en allemand lié au point de grammaire ou de vocabulaire.

Les thèmes doivent être adaptés au niveau B1 (vie quotidienne, travail, études, voyages, etc.). Tout le contenu doit être en allemand, sauf \`explanationFR\`.`;
        case ModuleType.SchriftlicherAusdruck:
            // This case is now handled by dedicated functions.
            return "Génère un sujet d'expression écrite ('Schriftlicher Ausdruck') pour le niveau telc B1.";
        case ModuleType.Hoerverstehen:
            if (part === 3) {
                return `Rôle: Concepteur d'exercices d'allemand expert, format telc B1, "Hörverstehen Teil 3".
                Tâche: Génère un exercice complet et unique au format JSON, inspiré des thèmes quotidiens (gare, météo, magasin, répondeur).
                Instructions:
                1. title: "Teil 3 – Kurze Texte verstehen"
                2. instructions: Fournis les 5 phrases d'instructions officielles pour cet exercice.
                3. questions: Crée un tableau de 5 objets question (ID 56-60). Pour chaque question :
                    - id: Le numéro (56-60).
                    - aussage: Une affirmation en allemand.
                    - audioText: Un texte court (10-25 secondes) et naturel pour l'audio.
                    - keywords: Un tableau de 2-4 mots-clés importants de l'audioText.
                    - correctAnswer: 'Richtig' ou 'Falsch'.
                    - feedbackDE: Un feedback explicatif en allemand qui commence par ✅ ou ❌ et cite la partie pertinente de l'audio. Ex: "✅ Richtig. Im Audio steht: '...'."
                    - feedbackFR: La traduction française exacte du feedbackDE. Ex: "✅ Correct. Dans l'audio, il est dit : '...'."
                    - voiceGender: 'female' ou 'male', en alternant.
                Assure-toi que les thèmes sont variés, le niveau est B1, et la prononciation correcte (ex: 'ICE' doit être prononçable comme 'I-Ts-E').`;
            }
            return "Génère un exercice de compréhension orale ('Hörverstehen') pour le niveau telc B1, destiné à un francophone. Crée un script audio d'environ 1 minute pour une conversation quotidienne entre deux locuteurs allemands (Hochdeutsch). Ensuite, crée 5 questions sur cet audio: 2 questions 'richtig/falsch' et 3 questions à choix multiples (3 options). Fournis le script, les questions, les options (pour les QCM) et les bonnes réponses. Tout le contenu de l'exercice doit être en allemand.";
        default:
            return `Génère un exercice de type '${moduleType}' pour le niveau telc B1.`;
    }
};

const getResponseSchema = (moduleType: ModuleType, part: 1 | 2 | 3 = 1) => {
    switch(moduleType) {
        case ModuleType.Leseverstehen:
            if (part === 3) {
                return {
                    type: Type.OBJECT,
                    properties: {
                        lernstrategie: {
                            type: Type.OBJECT,
                            properties: {
                                aufgabe: { type: Type.STRING },
                                strategie1: { type: Type.STRING },
                                strategie2: { type: Type.STRING },
                                strategie3: { type: Type.STRING },
                                tippDE: { type: Type.STRING },
                                tippFR: { type: Type.STRING },
                            },
                            required: ["aufgabe", "strategie1", "strategie2", "strategie3", "tippDE", "tippFR"]
                        },
                        anzeigen: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    letter: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                },
                                required: ["letter", "content"]
                            }
                        },
                        fragen: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    text: { type: Type.STRING }
                                },
                                required: ["id", "text"]
                            }
                        },
                        loesungen: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    correctAnswerLetter: { type: Type.STRING },
                                    explanationDE: { type: Type.STRING },
                                    explanationFR: { type: Type.STRING },
                                },
                                required: ["id", "correctAnswerLetter", "explanationDE", "explanationFR"]
                            }
                        }
                    },
                    required: ["lernstrategie", "anzeigen", "fragen", "loesungen"]
                };
            }
            if (part === 2) {
                return {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING, description: "Un texte d'environ 250 mots." },
                        questions: {
                            type: Type.ARRAY,
                            description: "Tableau de 5 questions à choix multiples.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.OBJECT,
                                        properties: {
                                            a: { type: Type.STRING },
                                            b: { type: Type.STRING },
                                            c: { type: Type.STRING }
                                        },
                                        required: ["a", "b", "c"]
                                    },
                                    correctAnswer: { type: Type.STRING },
                                    explanationDE: { type: Type.STRING, description: "Courte explication de la bonne réponse en allemand." },
                                    explanationFR: { type: Type.STRING, description: "Traduction française de l'explication." }
                                },
                                required: ["id", "question", "options", "correctAnswer", "explanationDE", "explanationFR"]
                            }
                        }
                    },
                    required: ["text", "questions"]
                };
            }
            return {
                type: Type.OBJECT,
                properties: {
                    headings: {
                        type: Type.ARRAY,
                        description: "Une liste de 10 objets titre, chacun avec 'letter' (a-j) et 'title'.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                letter: { type: Type.STRING },
                                title: { type: Type.STRING }
                            },
                             required: ["letter", "title"]
                        }
                    },
                    texts: {
                        type: Type.ARRAY,
                        description: "Une liste de 5 objets texte, chacun avec 'id' (1-5) et 'content'.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.INTEGER },
                                content: { type: Type.STRING }
                            },
                            required: ["id", "content"]
                        }
                    },
                    answers: {
                        type: Type.OBJECT,
                        description: "Un objet associant l'ID du texte (string) à la lettre de la bonne réponse. Ex: {'1': 'i', '2': 'd'}",
                        properties: {
                            '1': { type: Type.STRING },
                            '2': { type: Type.STRING },
                            '3': { type: Type.STRING },
                            '4': { type: Type.STRING },
                            '5': { type: Type.STRING },
                        },
                        required: ["1", "2", "3", "4", "5"]
                    }
                },
                required: ["headings", "texts", "answers"]
            };
        case ModuleType.Sprachbausteine:
            if (part === 2) {
                return {
                    type: Type.OBJECT,
                    properties: {
                        textWithGaps: { type: Type.STRING, description: "Texte avec 10 trous, numérotés (31) à (40)." },
                        wordOptions: {
                            type: Type.ARRAY,
                            description: "Une liste de 15 objets mot, chacun avec 'letter' (a-o), 'word', et 'translationFR'.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    letter: { type: Type.STRING },
                                    word: { type: Type.STRING },
                                    translationFR: { type: Type.STRING, description: "Traduction française du mot, adaptée au contexte." }
                                },
                                required: ["letter", "word", "translationFR"]
                            }
                        },
                        solutions: {
                            type: Type.ARRAY,
                            description: "Une liste de 10 objets solution pour chaque trou.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    gapId: { type: Type.INTEGER },
                                    correctWordLetter: { type: Type.STRING },
                                    explanationDE: { type: Type.STRING },
                                    explanationFR: { type: Type.STRING },
                                    learningTip: { type: Type.STRING }
                                },
                                required: ["gapId", "correctWordLetter", "explanationDE", "explanationFR", "learningTip"]
                            }
                        }
                    },
                    required: ["textWithGaps", "wordOptions", "solutions"]
                };
            }
            return {
                type: Type.OBJECT,
                properties: {
                    textWithGaps: { type: Type.STRING, description: "Texte avec 10 trous, numérotés (21) à (30)." },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.INTEGER },
                                options: {
                                    type: Type.OBJECT,
                                    properties: {
                                        a: { type: Type.STRING },
                                        b: { type: Type.STRING },
                                        c: { type: Type.STRING }
                                    },
                                    required: ["a", "b", "c"]
                                },
                                answer: { type: Type.STRING },
                                explanationDE: { type: Type.STRING },
                                explanationFR: { type: Type.STRING },
                                learningTip: { type: Type.STRING }
                            },
                            required: ["id", "options", "answer", "explanationDE", "explanationFR", "learningTip"]
                        }
                    }
                },
                required: ["textWithGaps", "questions"]
            };
        case ModuleType.SchriftlicherAusdruck:
             return {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    guidingPoints: { type: Type.ARRAY, items: { type: Type.STRING }}
                },
                required: ["subject", "guidingPoints"]
            };
        case ModuleType.Hoerverstehen:
             if (part === 3) {
                return {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    aussage: { type: Type.STRING },
                                    audioText: { type: Type.STRING },
                                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctAnswer: { type: Type.STRING, enum: ['Richtig', 'Falsch'] },
                                    feedbackDE: { type: Type.STRING },
                                    feedbackFR: { type: Type.STRING },
                                    voiceGender: { type: Type.STRING, enum: ['female', 'male'] }
                                },
                                required: ["id", "aussage", "audioText", "keywords", "correctAnswer", "feedbackDE", "feedbackFR", "voiceGender"]
                            }
                        }
                    },
                    required: ["title", "instructions", "questions"]
                };
            }
            return {
                type: Type.OBJECT,
                properties: {
                    audioScript: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                type: { type: Type.STRING, description: "'richtig-falsch' ou 'multiple-choice'" },
                                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 options si multiple-choice" },
                                answer: { type: Type.STRING }
                            }
                        }
                    }
                }
            };
        default:
            return undefined;
    }
}

export const generateExercise = async (moduleType: ModuleType, part: 1 | 2 | 3 = 1): Promise<LeseverstehenExerciseData | SprachbausteineExerciseData | any | HoerverstehenExerciseData | SprachbausteineTeil2ExerciseData | LeseverstehenTeil2ExerciseData | LeseverstehenTeil3ExerciseData> => {
    try {
        const result = await ai.models.generateContent({
            model,
            contents: generateExercisePrompt(moduleType, part),
            config: {
                responseMimeType: 'application/json',
                responseSchema: getResponseSchema(moduleType, part)
            }
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating exercise:", error);
        throw new Error("Failed to generate exercise from Gemini API.");
    }
};

// Fix: Add missing generateGrammarExercise function to resolve import error in GrammatikExercise.tsx
export const generateGrammarExercise = async (punkt: GrammatikPunkt): Promise<GrammatikExerciseData> => {
    const prompt = `🎯 Rôle du modèle: Tu es un expert en grammaire allemande (niveau A2-B1) et un concepteur d'exercices pour francophones.

    📘 Consignes: Génère un exercice de grammaire COMPLET et UNIQUE au format JSON basé sur le point grammatical suivant :
    - **Titre**: ${punkt.title}
    - **Objectif**: ${punkt.objective}
    - **Détails de la tâche**: ${punkt.promptDetails}

    La réponse JSON doit contenir :
    1.  **title**: Le titre du point grammatical ("${punkt.title}").
    2.  **objective**: L'objectif d'apprentissage ("${punkt.objective}").
    3.  **exercise_type**: Le type d'exercice, choisi parmi 'QCM', 'Texte à trous', ou 'Reformulation', en fonction de ce qui est le plus pertinent pour la tâche.
    4.  **level**: Toujours "A2".
    5.  **content**: Un tableau de 10 objets d'exercice. Chaque objet doit contenir :
        - \`question\`: La question ou la phrase à compléter (utilise "___" pour les trous).
        - \`options\`: Uniquement pour 'QCM', un tableau de 2-3 chaînes de caractères.
        - \`answer\`: La bonne réponse (string).
        - \`explanation\`: Une explication claire en français pourquoi la réponse est correcte.
    
    Assure-toi que les questions sont variées et testent bien l'objectif. Les explications doivent être simples et utiles.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            exercise_type: { type: Type.STRING, enum: ['QCM', 'Texte à trous', 'Reformulation'] },
            level: { type: Type.STRING, enum: ['A2'] },
            content: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                    },
                    required: ["question", "answer", "explanation"]
                }
            }
        },
        required: ["title", "objective", "exercise_type", "level", "content"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating grammar exercise:", error);
        throw new Error("Failed to generate grammar exercise from Gemini API.");
    }
};


export const getFeedbackForAnswer = async (question: string, userAnswer: string, correctAnswer: string): Promise<Feedback> => {
    const prompt = `Un apprenant francophone préparant l'examen allemand B1 a fait une erreur.
    Question: "${question}"
    Sa réponse: "${userAnswer}"
    Bonne réponse: "${correctAnswer}"

    Fournis un feedback concis et utile en suivant ce format JSON. Les explications et conseils doivent être simples et adaptés à un niveau B1.

    1.  **explanationDE**: Une explication simple en allemand de pourquoi la réponse est fausse.
    2.  **explanationFR**: La traduction française de cette explication.
    3.  **tipDE**: Un conseil personnalisé en allemand pour éviter cette erreur à l'avenir (ex. "Achte auf...").
    4.  **tipFR**: La traduction française de ce conseil.`;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        explanationDE: { type: Type.STRING },
                        explanationFR: { type: Type.STRING },
                        tipDE: { type: Type.STRING },
                        tipFR: { type: Type.STRING }
                    }
                }
            }
        });

        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting feedback:", error);
        throw new Error("Failed to get feedback from Gemini API.");
    }
};

export const getFeedbackForLeseverstehen = async (text: string, incorrectHeading: string, correctHeading: string): Promise<Feedback> => {
    const prompt = `Un apprenant francophone a fait une erreur dans un exercice de Leseverstehen (allemand B1).
    Pour le texte suivant: "${text}"
    Il a choisi le titre incorrect: "${incorrectHeading}"
    Le bon titre est: "${correctHeading}"

    Fournis une réponse au format JSON avec les clés suivantes :
    1.  explanationDE: Explique brièvement et simplement en allemand pourquoi le bon titre correspond au texte.
    2.  explanationFR: Traduis l'explication en français.
    3.  tipDE: Donne un conseil général en allemand pour mieux trouver le thème principal d'un texte (par ex. "Achte auf Schlüsselwörter...").
    4.  tipFR: Traduis le conseil en français.`;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        explanationDE: { type: Type.STRING },
                        explanationFR: { type: Type.STRING },
                        tipDE: { type: Type.STRING },
                        tipFR: { type: Type.STRING }
                    }
                }
            }
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting Leseverstehen feedback:", error);
        throw new Error("Failed to get feedback from Gemini API.");
    }
};

export const generateMiniLeseverstehenExercises = async (): Promise<LeseverstehenMiniExercise[]> => {
    const prompt = `Génère 5 mini-exercices "Leseverstehen" pour le niveau B1, destinés à des francophones. Chaque exercice doit être simple et se concentrer sur l'identification du thème principal.
    Fournis une réponse au format JSON : un tableau de 5 objets.
    Chaque objet doit avoir les clés suivantes :
    1. "id": un nombre de 1 à 5.
    2. "text": un texte court en allemand (2-3 phrases).
    3. "options": un tableau de 3 objets, chacun avec "letter" ("a", "b", ou "c") et "title" (un titre en allemand). Un seul titre doit être correct.
    4. "correctAnswer": la lettre de la bonne réponse (ex: "a").
    5. "feedback": une très courte explication en allemand pour une mauvaise réponse, mentionnant les mots-clés pertinents (ex: "Wichtige Wörter = 'Wort1', 'Wort2'.").`;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
                options: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            letter: { type: Type.STRING },
                            title: { type: Type.STRING }
                        },
                        required: ["letter", "title"]
                    }
                },
                correctAnswer: { type: Type.STRING },
                feedback: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctAnswer", "feedback"]
        }
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating mini-exercises:", error);
        throw new Error("Failed to generate mini-exercises from Gemini API.");
    }
};

export const generateLeseverstehenTeil2Example = async (): Promise<LeseverstehenTeil2ExampleData> => {
    const prompt = `Crée un exercice explicatif pour "Leseverstehen Teil 2 (Detailverstehen)" pour le niveau telc B1, destiné à un francophone.
    L'objectif est d'apprendre à l'utilisateur comment trouver des informations spécifiques.

    Le JSON doit contenir :
    1. "text": Un texte authentique B1 (200-250 mots) sur un thème quotidien (travail, loisirs, voyage...).
    2. "questions": Un tableau de 5 questions (numérotées 6-10) au format telc (début de phrase à compléter). Pour chaque question :
        - "id": numéro de 6 à 10.
        - "question": Le début de la phrase.
        - "options": { "a": "...", "b": "...", "c": "..." }. Les options doivent être en minuscules.
        - "correctAnswer": "a", "b", ou "c".
        - "feedbackCorrectDE": "Hinweis: Im Text steht, dass..." (une explication simple qui cite ou paraphrase l'information clé).
        - "feedbackCorrectFR": Traduction de feedbackCorrectDE.
        - "relevantTextSnippet": La phrase ou le passage EXACT du texte qui justifie la bonne réponse. Ce snippet sera surligné.
        - "commonMistakeExplanationFR": Une explication courte et simple en français d'une erreur fréquente possible pour cette question (par exemple, pourquoi une autre option semble correcte mais est fausse, en se basant sur un mot distracteur dans le texte).`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        question: { type: Type.STRING },
                        options: {
                            type: Type.OBJECT,
                            properties: {
                                a: { type: Type.STRING },
                                b: { type: Type.STRING },
                                c: { type: Type.STRING },
                            },
                            required: ["a", "b", "c"],
                        },
                        correctAnswer: { type: Type.STRING },
                        feedbackCorrectDE: { type: Type.STRING },
                        feedbackCorrectFR: { type: Type.STRING },
                        relevantTextSnippet: { type: Type.STRING },
                        commonMistakeExplanationFR: { type: Type.STRING },
                    },
                    required: ["id", "question", "options", "correctAnswer", "feedbackCorrectDE", "feedbackCorrectFR", "relevantTextSnippet", "commonMistakeExplanationFR"],
                },
            },
        },
        required: ["text", "questions"],
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating Leseverstehen Teil 2 example:", error);
        throw new Error("Failed to generate exercise from Gemini API.");
    }
};

export const generateLeseverstehenTeil3Example = async (): Promise<LeseverstehenTeil3ExampleData> => {
    const prompt = `🎯 Rôle du modèle: Tu es un concepteur d'exercices d'allemand niveau telc B1, expert du format "Leseverstehen Teil 3" pour un but pédagogique.

    📘 Consignes: Génère un exercice explicatif complet et unique au format JSON.
    1.  **anzeigen**: Crée une liste d'EXACTEMENT 12 annonces courtes et réalistes (lettres a-l).
    2.  **fragen**: Crée une liste d'EXACTEMENT 10 situations (numérotées de 11 à 20).
    3.  **loesungen**: Fournis une liste de solutions pour chaque question.
        - **Règle importante**: Pour AU MOINS UNE et jusqu'à DEUX questions, aucune annonce ne doit correspondre (réponse 'x').
        - Pour chaque solution, fournis:
            - \`id\`: Le numéro de la question.
            - \`correctAnswerLetter\`: La lettre de l'annonce correcte, ou 'x'.
            - \`relevantSnippet\`: La phrase ou le passage EXACT de l'annonce qui justifie la bonne réponse. Si la réponse est 'x', la valeur est null. Ce snippet sera surligné.
            - \`feedbackCorrectDE\`: "Richtig! In Anzeige [X] steht..." (une explication simple qui cite ou paraphrase l'information clé).
            - \`feedbackCorrectFR\`: Traduction de feedbackCorrectDE.
            - \`feedbackIncorrectDE\`: "Falsch! Die richtige Antwort ist Anzeige [X], denn dort steht..." (une explication simple qui guide l'apprenant vers la bonne réponse).
            - \`feedbackIncorrectFR\`: Traduction de feedbackIncorrectDE.
    
    Tout le contenu de l'exercice doit être en allemand, sauf les parties spécifiquement en français. Assure-toi que les distracteurs sont plausibles.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            anzeigen: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { letter: { type: Type.STRING }, content: { type: Type.STRING } },
                    required: ["letter", "content"]
                }
            },
            fragen: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { id: { type: Type.INTEGER }, text: { type: Type.STRING } },
                    required: ["id", "text"]
                }
            },
            loesungen: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        correctAnswerLetter: { type: Type.STRING },
                        relevantSnippet: { type: Type.STRING }, // Model may return null which JS will handle. Schema doesn't support explicit null type.
                        feedbackCorrectDE: { type: Type.STRING },
                        feedbackCorrectFR: { type: Type.STRING },
                        feedbackIncorrectDE: { type: Type.STRING },
                        feedbackIncorrectFR: { type: Type.STRING }
                    },
                    required: ["id", "correctAnswerLetter", "relevantSnippet", "feedbackCorrectDE", "feedbackCorrectFR", "feedbackIncorrectDE", "feedbackIncorrectFR"]
                }
            }
        },
        required: ["anzeigen", "fragen", "loesungen"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        // The model may return null for relevantSnippet. We parse and trust the structure.
        return JSON.parse(jsonString) as LeseverstehenTeil3ExampleData;
    } catch (error) {
        console.error("Error generating Leseverstehen Teil 3 example:", error);
        throw new Error("Failed to generate exercise from Gemini API.");
    }
};


export const getOverallAdvice = async (scores: UserProfile['scores']): Promise<string> => {
    const prompt = `Voici les scores d'un apprenant francophone pour l'examen telc B1. Analyse ses performances par compétence et fournis un conseil global personnalisé en français. Mets en évidence un point fort et un point faible principal, puis donne une suggestion concrète pour s'améliorer. Sois encourageant.
    Données: ${JSON.stringify(scores, null, 2)}`;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error getting overall advice:", error);
        throw new Error("Failed to get advice from Gemini API.");
    }
};

export const generateFullDialogue = async (userProfile: PresentationAnswers): Promise<ChatMessage[]> => {
    const prompt = `
    Rôle: Tu es un expert de l'examen telc B1 et un scénariste de dialogues.
    Tâche: Crée un dialogue complet, réaliste et naturel pour la partie "Einander kennenlernen" de l'examen oral telc B1.

    Contexte:
    - Le dialogue est entre "Kandidat A" (l'utilisateur) et "Kandidat B" (un personnage que tu vas créer).
    - Le niveau de langue doit être strictement B1 : phrases simples, vocabulaire courant, structure claire.
    - Le dialogue doit avoir un flux naturel d'échange de questions et de réponses. A et B doivent poser des questions à tour de rôle.
    - Le dialogue doit couvrir plusieurs des thèmes standards: Nom, Herkunft, Wohnen, Familie, Beruf, Deutsch lernen, Sprachen, Hobbys, Zukunftspläne.

    Profil de Kandidat A (utilise ces informations pour ses réponses):
    ${JSON.stringify(userProfile, null, 2)}

    Instructions:
    1.  Crée d'abord un profil complet et cohérent pour "Kandidat B". Ce profil ne doit pas être dans la réponse finale, mais tu dois l'utiliser pour générer ses réponses.
    2.  Génère un dialogue complet d'environ 6 à 10 échanges au total (3 à 5 par personne).
    3.  Commence le dialogue par Kandidat B qui se présente et pose la première question.
    4.  Assure-toi que les réponses de Kandidat A sont cohérentes avec son profil fourni.
    5.  Termine le dialogue de manière naturelle et amicale (par exemple, "Das war sehr interessant. Vielen Dank für das Gespräch!").
    6.  **Règle impérative :** Les deux candidats doivent se vouvoyer en utilisant la forme de politesse "Sie" pendant tout le dialogue. N'utilisez jamais "du".

    Format de sortie:
    Produis un tableau JSON d'objets. Chaque objet représente une réplique et doit avoir deux clés :
    - "speaker": "A" ou "B"
    - "text": La phrase dite par le locuteur.

    Exemple de sortie:
    [
      { "speaker": "B", "text": "Guten Tag, mein Name ist Thomas Müller. Und wie heißen Sie?" },
      { "speaker": "A", "text": "Guten Tag, ich heiße Maria Conte." },
      ...
    ]
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING, description: "Should be 'A' for the user or 'B' for the AI partner." },
                text: { type: Type.STRING, description: "The spoken line of dialogue." }
            },
            required: ["speaker", "text"]
        }
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating full dialogue:", error);
        throw new Error("Failed to generate full dialogue from Gemini API.");
    }
};

export const generateB1Reformulation = async (characterName: string, characterDetails: string, characterText: string): Promise<string> => {
    const prompt = `
    Rôle: Expert en allemand niveau telc B1.
    Tâche: Reformule le texte suivant à la 3e personne. Commence par présenter la personne en utilisant son nom, son âge et sa profession, puis résume son opinion. Le résultat doit être un petit paragraphe structuré (plusieurs phrases courtes).

    Exemple de structure attendue :
    "Ich habe einen Text von [Nom] gelesen. Er/Sie ist [âge] Jahre alt und [profession] von Beruf. Er/Sie sagt, dass [idée principale 1]. Außerdem meint er/sie, dass [idée principale 2]."

    Détails de la personne :
    - Nom: "${characterName}"
    - Description: "${characterDetails}"

    Texte original à reformuler :
    "${characterText}"

    Instructions :
    1. Intègre les informations de la description (âge, profession) dans la phrase d'introduction.
    2. Sépare les différentes idées du texte original en plusieurs phrases simples.
    3. Le niveau de langue doit être strictement B1.`;
    try {
        const result = await ai.models.generateContent({ model, contents: prompt });
        return result.text.trim();
    } catch (error) {
        console.error(`Error generating B1 reformulation:`, error);
        throw new Error(`Failed to generate B1 reformulation from Gemini API.`);
    }
};

export const generateB1Examples = async (
    part: 'opinion' | 'question' | 'experience',
    theme: string
): Promise<string[]> => {
    const prompt = `Rôle: Expert en allemand telc B1. Tâche: Génère 5 phrases modèles uniques et simples (niveau B1) pour la partie "${part}" d'une conversation sur le thème "${theme}". Les phrases doivent être des exemples qu'un étudiant peut utiliser directement.`;

    const schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`Error generating B1 examples for ${part}:`, error);
        throw new Error(`Failed to generate B1 examples for ${part} from Gemini API.`);
    }
};

export const generateGesprächDialogue = async (thema: string, userInput: MuendlicherAusdruckTeil2UserInput, userCharacter: MuendlicherAusdruckTeil2Character, aiCharacter: MuendlicherAusdruckTeil2Character): Promise<ChatMessage[]> => {
    const prompt = `
    Rôle: Tu es un partenaire de dialogue expert pour l'examen oral telc B1, Teil 2 "Gespräch über ein Thema". Tu joues le rôle de "Kandidat B".
    Tâche: Crée un dialogue complet, réaliste et naturel d'environ 8 tours entre "Kandidat A" (l'utilisateur) et toi ("Kandidat B"), en suivant une structure d'examen très précise.

    Contexte:
    - Thème du dialogue: "${thema}"
    - Kandidat A a choisi de parler de: ${userCharacter.name} (${userCharacter.details}).
    - Tu (Kandidat B) dois donc parler de: ${aiCharacter.name} (${aiCharacter.details}).

    Détails de l'intervention de Kandidat A (l'élève):
    - Reformulation du texte de ${userCharacter.name}: "${userInput.reformulation}"
    - Son opinion: "${userInput.opinion}"
    - Sa question: "${userInput.question}"
    - Son expérience personnelle: "${userInput.experience}"

    Instructions pour le dialogue:
    1.  **Gestion des infos manquantes**: Si une des informations de Kandidat A est vide (""), tu dois la compléter avec une phrase simple, logique et de niveau B1 qui correspond au contexte de l'étape.
    2.  **Structure PRÉCISE du dialogue**:
        - **Réplique 1 (Kandidat A)**: Commence avec la reformulation de A, suivie de son opinion, et enfin sa question.
        - **Réplique 2 (Kandidat B - TOI)**: Réponds à la question de A. Pour cela:
            a. Commence par reformuler le texte de ton personnage (${aiCharacter.name}: "${aiCharacter.text}").
            b. Donne ensuite ton opinion sur le texte de ton personnage.
            c. Termine en posant une question à A sur son expérience personnelle (par ex: "Und wie ist Ihre Erfahrung mit dem Thema?").
        - **Réplique 3 (Kandidat A)**: Partage son expérience personnelle et termine en te retournant la question (par ex: "Und Sie, was ist Ihre Erfahrung?").
        - **Réplique 4 (Kandidat B - TOI)**: Réponds à la question de A. Partage une expérience personnelle (inventée, simple, niveau B1) sur le thème. Pose ensuite une question de suivi.
        - **Réplique 5 (Kandidat A)**: Réponds à ta question de suivi.
        - **Réplique 6 (Kandidat B - TOI)**: Réagis à sa réponse et ajoute une information ou un point de vue.
        - **Réplique 7 (Kandidat A)**: Ajoute un dernier commentaire ou une question finale.
        - **Réplique 8 (Kandidat B - TOI)**: Réponds et termine la conversation de manière naturelle et amicale (par ex: "Das war sehr interessant. Vielen Dank für das Gespräch.").
    3.  **Niveau de langue**: Les phrases doivent être courtes, claires, et strictement niveau B1.
    4.  **Règle impérative**: Utilise TOUJOURS la forme de politesse "Sie". Ne jamais utiliser "du".

    Format de sortie:
    Produis un tableau JSON d'objets. Chaque objet représente une réplique.
    - Le premier objet doit être pour le "speaker": "A".
    - Les répliques doivent alterner entre "A" et "B".

    Exemple de sortie:
    [
      { "speaker": "A", "text": "Laut Jenny Waldrich möchte sie bei ihren Eltern bleiben, weil es bequemer ist. Ich finde das interessant, weil Unabhängigkeit auch wichtig ist. Und was haben Sie gelesen?" },
      { "speaker": "B", "text": "Ich habe über David Sell gelesen. Er sagt, dass er durch seinen Auszug viel selbstständiger geworden ist. Ich denke, das ist ein wichtiger Punkt im Leben. Welche Erfahrungen haben Sie persönlich mit dem Ausziehen gemacht?" },
      ...
    ]
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                speaker: { type: Type.STRING, description: "Should be 'A' for the user or 'B' for the AI partner." },
                text: { type: Type.STRING, description: "The spoken line of dialogue." }
            },
            required: ["speaker", "text"]
        }
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating Gespräch dialogue:", error);
        throw new Error("Failed to generate Gespräch dialogue from Gemini API.");
    }
};

export const generateMuendlicherAusdruckTeil2Thema = async (): Promise<MuendlicherAusdruckTeil2Thema> => {
    const prompt = `Génère un nouveau thème de discussion pour l'examen oral telc B1, Teil 2 "Gespräch über ein Thema". Le thème doit être pertinent pour le niveau B1 (par exemple, "Reisen", "Medienkonsum", "Wohnen in der Stadt vs. auf dem Land") et différent du thème "Ausziehen und alleine wohnen".
    Fournis:
    1. 'title': Un titre pour le thème en allemand.
    2. 'titleFR': La traduction française exacte du titre.
    3. 'characters': Une liste d'exactement deux personnages avec des opinions clairement opposées sur le sujet. Pour chaque personnage, fournis:
        - 'name': Un nom complet.
        - 'details': Une courte description (ex: "21 Jahre, Studentin").
        - 'text': Un texte court (2-3 phrases) à la première personne ("Ich-Form") qui exprime son opinion, SANS inclure son nom, âge ou profession.

    Le format de la réponse doit être JSON.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Le titre du thème de discussion en allemand." },
            titleFR: { type: Type.STRING, description: "La traduction française du titre." },
            characters: {
                type: Type.ARRAY,
                description: "Une liste de deux objets personnage.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        details: { type: Type.STRING, description: "Courte description du personnage, ex: '21 Jahre, Studentin'."},
                        text: { type: Type.STRING, description: "Un texte à la première personne qui exprime l'opinion du personnage." }
                    },
                    required: ["name", "details", "text"]
                }
            }
        },
        required: ["title", "titleFR", "characters"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        const data = JSON.parse(jsonString);
        // Ensure there are exactly two characters
        if (data.characters && data.characters.length === 2) {
            return data;
        } else {
            throw new Error("Generated data does not contain exactly two characters.");
        }
    } catch (error) {
        console.error("Error generating Muendlicher Ausdruck Teil 2 Thema:", error);
        throw new Error("Failed to generate new theme from Gemini API.");
    }
};

export const generateTextForReformulation = async (): Promise<MuendlicherAusdruckTeil3Data> => {
    const prompt = `Génère un exercice UNIQUE et VARIÉ pour "Text wiedergeben" au format telc B1.
Chaque exécution doit produire un thème différent des exemples ci-dessous.

**Format de sortie (JSON):**
1.  **'theme'**: Un thème quotidien en allemand (par exemple: Sport, Medien, Essen, Einkaufen, Umwelt). Le thème doit être NOUVEAU et non tiré des exemples.
2.  **'authorName'**: Un nom complet fictif, l'âge et la profession de l'auteur (format: "Vorname Nachname, XX Jahre, Beruf").
3.  **'text'**: Un texte court de 50 à 75 mots (4-6 phrases), écrit à la 1ère personne (ich-Form) par l'auteur. Le style doit être simple, authentique, et correspondre au niveau B1.

**Exemples de format et de style à suivre (NE PAS COPIER les thèmes ou les textes):**

*   **Exemple 1:**
    *   Thème: Gruppenreisen
    *   Auteur: Sabine Klostermann, 33 Jahre, Bürokauffrau
    *   Texte: "Ich verreise gern in einer Gruppe. Allein reisen macht mir keinen Spaß. Bei Gruppenreisen kann man neue Leute kennen lernen und hat immer Gesellschaft. Außerdem ist ein Reiseführer dabei, der einem die Sehenswürdigkeiten zeigt."

*   **Exemple 2:**
    *   Thème: Gruppenreisen
    *   Auteur: Jens Mühle, 39 Jahre, Physiker
    *   Texte: "Wenn man mit einer Gruppe unterwegs ist, gibt es meist ein festes Programm. Daher reise ich immer allein. Manchmal möchte ich ausschlafen, manchmal etwas besichtigen. Ganz nach Lust und Laune. In einer Gruppe wäre das nicht möglich."

*   **Exemple 3:**
    *   Thème: Ausziehen und alleine wohnen
    *   Auteur: Jenny Waldrich, 21 Jahre, Studentin
    *   Texte: "Meine Eltern hätten gar nichts dagegen, dass ich ausziehe. Sie würden mir sogar Geld für die Miete geben. Aber was soll ich denn allein in einer kleinen, ungemütlichen Wohnung? Im Haus meiner Eltern habe ich doch viel mehr Platz. Dort habe ich nicht nur mein eigenes Zimmer, sondern auch die anderen Räume und den Garten. Das ist doch viel bequemer!"

Génère un NOUVEL exercice qui respecte scrupuleusement ces consignes.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            theme: { type: Type.STRING },
            authorName: { type: Type.STRING },
            text: { type: Type.STRING }
        },
        required: ["theme", "authorName", "text"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating text for reformulation:", error);
        throw new Error("Failed to generate text from Gemini API.");
    }
};

export const generateReformulationHelp = async (authorName: string, originalText: string): Promise<string[]> => {
    const prompt = `Un étudiant de niveau B1 a besoin d'aide pour reformuler le texte suivant de ${authorName} à la 3ème personne.
Texte original: "${originalText}"
Reformule ce texte ENTIÈREMENT en allemand, phrase par phrase. Chaque phrase reformulée doit être un élément distinct dans un tableau JSON. Utilise des structures variées comme "${authorName.split(' ')[0]} sagt, dass...", "Sie/Er meint, dass...", "Außerdem erzählt sie/er...". Le résultat doit être un tableau JSON de chaînes de caractères, où chaque chaîne est une phrase de la reformulation complète en allemand.`;

    const schema = {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating reformulation help:", error);
        throw new Error("Failed to generate help from Gemini API.");
    }
};

export const getFeedbackForReformulation = async (authorName: string, originalText: string, userText: string): Promise<MuendlicherAusdruckTeil3Feedback> => {
    const prompt = `Un étudiant de niveau B1 a reformulé le texte suivant de ${authorName}.
    - Texte original (1ère personne): "${originalText}"
    - Sa reformulation (3ème personne): "${userText}"

    Évalue sa reformulation. Le plus important est de vérifier si "ich" a été correctement remplacé par "er/sie" et si les verbes sont conjugués correctement.
    Fournis un feedback concis au format JSON avec les clés suivantes :
    1. 'isCorrect': boolean (true si la reformulation est globalement bonne, même avec de petites erreurs. false si des erreurs majeures subsistent, comme l'oubli de changer la personne).
    2. 'feedbackDE': une explication simple en allemand. Si c'est correct, dis "Sehr gut! Die Umformung ist richtig." Si c'est faux, donne un conseil précis, ex: "Achte darauf, 'ich' durch 'sie/er' zu ersetzen und das Verb anzupassen."
    3. 'feedbackFR': la traduction française du feedback.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedbackDE: { type: Type.STRING },
            feedbackFR: { type: Type.STRING }
        },
        required: ["isCorrect", "feedbackDE", "feedbackFR"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting feedback for reformulation:", error);
        throw new Error("Failed to get feedback from Gemini API.");
    }
};

export const generateShortReformulationAndTips = async (authorName: string, originalText: string): Promise<MuendlicherAusdruckTeil3ShortHelp> => {
    const prompt = `Ein B1-Student benötigt Hilfe, um einen Text zusammenzufassen.
    - Autor: "${authorName}"
    - Originaltext: "${originalText}"

    Erstelle eine Antwort im JSON-Format, die dem Schüler hilft, sich auf das Wesentliche zu konzentrieren:
    1. 'example': Erstelle eine SEHR KURZE Zusammenfassung (1-2 Sätze) des Textes in der 3. Person. Fasse nur die absolute Hauptaussage zusammen.
    2. 'explanationDE': Gib eine kurze, einfache Erklärung auf Deutsch, WIE man zusammenfasst. Erkläre, dass man sich fragen sollte: "Wer spricht?", "Was ist die Kernaussage?" und "Warum?".
    3. 'explanationFR': Übersetze die Erklärung exakt ins Französische.

    Beispiel für die Erklärung: "Konzentrieren Sie sich auf die Hauptidee. Fragen Sie: Wer spricht? Was ist die Kernaussage? Fassen Sie nur diese Punkte zusammen."`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            example: { type: Type.STRING, description: "Eine sehr kurze Zusammenfassung des Textes." },
            explanationDE: { type: Type.STRING, description: "Eine Erklärung auf Deutsch, wie man zusammenfasst." },
            explanationFR: { type: Type.STRING, description: "Die französische Übersetzung der Erklärung." }
        },
        required: ["example", "explanationDE", "explanationFR"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating short reformulation help:", error);
        throw new Error("Failed to generate short help from Gemini API.");
    }
};

// --- Mündlicher Ausdruck Teil 3: Gemeinsam etwas planen ---

export const generatePlanungsThema = async (): Promise<MuendlicherAusdruckTeil3PlanungsThema> => {
    const prompt = `Génère un NOUVEAU thème de planification pour l'examen oral telc B1, Teil 3 "Gemeinsam etwas planen".
    Le thème doit être différent de "Abschiedsparty feiern".
    Exemples de thèmes: ein Picknick im Park organisieren, einen Kinoabend planen, eine Überraschungsparty für einen Freund vorbereiten, einen Wochenendausflug machen.

    Fournis une réponse JSON avec les clés suivantes :
    1. 'title': Le titre du thème en allemand (ex: "Ein Picknick organisieren").
    2. 'descriptionDE': La consigne en allemand pour l'élève (ex: "Sie und Ihr Partner möchten am Wochenende ein Picknick im Park machen. Planen Sie gemeinsam...").
    3. 'descriptionFR': La traduction française de la consigne.
    4. 'planningPoints': Un tableau de 5-7 questions clés en allemand à discuter (ex: ["Wann?", "Wo?", "Wer bringt was mit?", "Was machen wir bei schlechtem Wetter?"]).`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            descriptionDE: { type: Type.STRING },
            descriptionFR: { type: Type.STRING },
            planningPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "descriptionDE", "descriptionFR", "planningPoints"]
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating planning theme:", error);
        throw new Error("Failed to generate planning theme from Gemini API.");
    }
};

export const getPlanungsPartnerResponse = async (thema: MuendlicherAusdruckTeil3PlanungsThema, dialogueHistory: ChatMessage[], userInput: string): Promise<string> => {
    const prompt = `Rôle: Tu es un partenaire de dialogue pour l'examen oral telc B1, Teil 3. Ton nom est "Alex". Tu es amical, coopératif, mais tu as aussi tes propres idées et préférences. Le niveau de langue doit être strictement B1.
    Tâche: Réponds au dernier message de ton partenaire ("Kandidat A") pour planifier l'événement suivant: ${thema.title}.
    Description de la tâche: ${thema.descriptionDE}.
    Points à planifier: ${thema.planningPoints.join(', ')}.
    Historique du dialogue:
    ${dialogueHistory.map(m => `${m.speaker}: ${m.text}`).join('\n')}
    
    Dernier message de A: "${userInput}"

    Instructions:
    1. Réagis directement à la proposition de A. Tu peux accepter ("Gute Idee!", "Das passt mir gut."), refuser poliment ("Hmm, am Samstag kann ich leider nicht.", "Das ist ein guter Vorschlag, aber vielleicht könnten wir..."), ou poser une question pour avoir plus de détails ("Wann genau am Samstag?", "Was für einen Kuchen meinst du?").
    2. Fais une contre-proposition si tu n'es pas d'accord ou pour faire avancer la planification sur un autre point de la liste (${thema.planningPoints.join(', ')}).
    3. Essaie de parvenir à un accord. Sois flexible.
    4. Ta réponse doit être une seule phrase ou deux phrases courtes et naturelles. N'utilise que du vocabulaire B1.
    5. Si A propose de finaliser le plan, accepte et dis quelque chose comme "Ja, super. Dann haben wir alles geklärt." ou "Perfekt, so machen wir das.".
    
    NE fais PAS de résumé. Réponds juste comme un partenaire de conversation.`;

    try {
        const result = await ai.models.generateContent({ model, contents: prompt });
        return result.text.trim();
    } catch (error) {
        console.error("Error getting planning partner response:", error);
        throw new Error("Failed to get partner response from Gemini API.");
    }
};

export const summarizePlanung = async (dialogueHistory: ChatMessage[]): Promise<string> => {
    const prompt = `Rôle: Tu es un assistant d'examen.
    Tâche: Lis le dialogue de planification suivant et résume les points clés sur lesquels les deux personnes se sont mises d'accord.
    Dialogue:
    ${dialogueHistory.map(m => `${m.speaker}: ${m.text}`).join('\n')}

    Format de sortie: Une seule chaîne de caractères concise commençant par "Zusammenfassung:".
    Exemple de sortie: "Zusammenfassung: Die Party ist am Samstag um 18 Uhr im Garten. Wir machen ein Buffet und jeder bringt Getränke mit. Die Kosten teilen wir."
    
    Extrais uniquement les décisions finales.`;

    try {
        const result = await ai.models.generateContent({ model, contents: prompt });
        return result.text.trim();
    } catch (error) {
        console.error("Error summarizing plan:", error);
        throw new Error("Failed to summarize plan from Gemini API.");
    }
};

export const generatePlanungsHilfe = async (thema: MuendlicherAusdruckTeil3PlanungsThema): Promise<PlanungsHilfe> => {
    const prompt = `
    Rôle: Tu es un assistant linguistique pour un étudiant d'allemand niveau B1.
    Tâche: Génère des phrases d'aide CONTEXTUELLES pour une discussion de planification. Les phrases doivent être directement liées au thème et aux points de planification fournis.

    Thème de la planification: "${thema.title}" (${thema.descriptionDE})
    Points à discuter: ${thema.planningPoints.join(', ')}

    Instructions:
    1. Crée 3 à 5 phrases UNIQUES et UTILES pour chacune des catégories suivantes.
    2. Chaque phrase doit être simple, naturelle et de niveau B1.
    3. Les phrases doivent être spécifiques au thème. Par exemple, si le thème est "pique-nique", les phrases doivent parler de nourriture de pique-nique, de parcs, de météo, etc., PAS de fêtes ou de cinéma.

    Catégories:
    - "Etwas organisieren"
    - "Meinung sagen"
    - "Zustimmen / Ablehnen"
    - "Sich einigen"

    Format de sortie:
    Produis un objet JSON avec exactement les quatre clés de catégorie ci-dessus. Chaque clé doit avoir comme valeur un tableau de chaînes de caractères (les phrases d'aide).
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            "Etwas organisieren": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Meinung sagen": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Zustimmen / Ablehnen": { type: Type.ARRAY, items: { type: Type.STRING } },
            "Sich einigen": { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["Etwas organisieren", "Meinung sagen", "Zustimmen / Ablehnen", "Sich einigen"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating planning help:", error);
        throw new Error("Failed to generate planning help from Gemini API.");
    }
};


// --- Schriftlicher Ausdruck ---

export const generateWritingExercise = async (formality?: 'informal' | 'halbformell' | 'formal'): Promise<SchriftlicherAusdruckExerciseData> => {
    let formalityConstraint = '';
    if (formality) {
        formalityConstraint = `La formalité doit IMPÉRATIVEMENT être '${formality}'.`;
    }

    const prompt = `Génère un sujet d'expression écrite ('Schriftlicher Ausdruck') pour le niveau telc B1, destiné à un francophone. Le sujet doit être varié : une demande d'information, une réclamation, une invitation, une candidature, etc. Le format peut être un e-mail ou une lettre. ${formalityConstraint}

    Fournis une réponse JSON avec les clés suivantes :
    1.  'subject': Un titre court pour l'exercice (ex: "Anfrage zu einem Sprachkurs", "Einladung zur Party").
    2.  'type': 'email' ou 'letter'.
    3.  'formality': 'formal', 'informal', ou 'halbformell'.
    4.  'situation': Le contexte/la mise en situation en allemand (ex: l'e-mail reçu, la description du problème).
    5.  'task': La consigne précise pour l'utilisateur en allemand (ex: "Antworten Sie auf die E-Mail.").
    6.  'guidingPoints': Un tableau de 4 objets. Chaque objet doit contenir :
        - 'pointDE': Le point directeur en allemand.
        - 'pointFR': La traduction française exacte du point directeur.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING },
            type: { type: Type.STRING },
            formality: { type: Type.STRING },
            situation: { type: Type.STRING },
            task: { type: Type.STRING },
            guidingPoints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        pointDE: { type: Type.STRING },
                        pointFR: { type: Type.STRING }
                    },
                    required: ["pointDE", "pointFR"]
                }
            }
        },
        required: ["subject", "type", "formality", "situation", "task", "guidingPoints"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating writing exercise:", error);
        throw new Error("Failed to generate writing exercise from Gemini API.");
    }
};

export const checkWritingCoverage = async (userText: string, guidingPoints: string[]): Promise<GuidingPointFeedback[]> => {
    const prompt = `L'utilisateur a écrit le texte suivant : "${userText}".
    La consigne demandait de couvrir ces 4 points : ${JSON.stringify(guidingPoints)}.

    Pour chaque point, vérifie si le texte de l'utilisateur l'aborde CLAIREMENT. Réponds en JSON : un tableau de 4 objets. Chaque objet doit contenir :
    1. 'point': Le point directeur exact en allemand.
    2. 'covered': boolean (true si le point est clairement et spécifiquement traité, sinon false).
    3. 'explanation': Une très brève explication en français (max 15 mots) justifiant pourquoi le point est traité ou non.
    4. 'quote': La phrase ou le passage EXACT du texte de l'utilisateur qui couvre le point. Si non couvert, retourne une chaîne vide.

    Sois strict : une simple mention d'un mot-clé ne suffit pas. Le point doit être développé.`;
    
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                point: { type: Type.STRING },
                covered: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING },
                quote: { type: Type.STRING }
            },
            required: ["point", "covered", "explanation", "quote"]
        }
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error checking writing coverage:", error);
        throw new Error("Failed to check writing from Gemini API.");
    }
};

export const generateModelWritingAnswer = async (exercise: SchriftlicherAusdruckExerciseData): Promise<string> => {
    const prompt = `Génère une réponse modèle complète de niveau B1 pour le sujet suivant. La réponse doit être un(e) ${exercise.type} ${exercise.formality} qui respecte la consigne et aborde les 4 points directeurs. Le ton doit être approprié.

    Situation: "${exercise.situation}"
    Consigne: "${exercise.task}"
    Points à traiter: ${exercise.guidingPoints.map(p => p.pointDE).join(', ')}

    Produis uniquement le texte de la réponse, sans aucun commentaire supplémentaire. Commence directement par la salutation (Anrede).`;

    try {
        const result = await ai.models.generateContent({ model, contents: prompt });
        return result.text.trim();
    } catch (error) {
        console.error("Error generating model answer:", error);
        throw new Error("Failed to generate model answer from Gemini API.");
    }
};

export const generateLinguisticHelp = async (exercise: SchriftlicherAusdruckExerciseData): Promise<LinguisticHelpData> => {
    const prompt = `
    Rôle: Expert en didactique de l'allemand telc B1.
    Tâche: Générer des phrases-modèles (Phrases-modèles cliquables) pour un exercice d'expression écrite.
    
    Contexte de l'exercice:
    - Type: ${exercise.type}
    - Formalité: ${exercise.formality}
    - Situation: ${exercise.situation}
    - Tâche: ${exercise.task}
    - Points directeurs à couvrir: ${JSON.stringify(exercise.guidingPoints.map(p => p.pointDE))}

    Instructions:
    1.  Respecte scrupuleusement la formalité (${exercise.formality}). Utilise "Sie" pour formel/halbformell, "du" pour informel.
    2.  Génère des phrases COMPLÈTES, UTILES et VARIÉES au niveau B1.
    3.  Les phrases doivent être directement liées au sujet et aux points directeurs.
    4.  Structure la réponse au format JSON demandé.
    5.  Pour le "hauptteil", crée une section pour CHAQUE point directeur. Le titre de la section doit être le point directeur lui-même.
    6.  Pour chaque point directeur dans "hauptteil", fournis 3 à 5 phrases-modèles différentes et pertinentes.

    Exemple de qualité attendue pour un point "Welche Ausflüge Sie machen wollen" (informel):
    "Wir können zusammen die Altstadt besichtigen und eine Bootsfahrt machen.",
    "Ich möchte dir unbedingt die Berge zeigen, dort ist die Aussicht sehr schön.",
    "Wir könnten auch ins Museum gehen und danach ein Picknick im Park machen."
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            anrede: { type: Type.ARRAY, items: { type: Type.STRING } },
            einleitung: { type: Type.ARRAY, items: { type: Type.STRING } },
            hauptteil: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        points: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "points"]
                }
            },
            schluss: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["anrede", "einleitung", "hauptteil", "schluss"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating linguistic help:", error);
        throw new Error("Failed to generate linguistic help from Gemini API.");
    }
};

export const generateWritingMicroExercise = async (type: MicroExerciseType): Promise<MicroExerciseData> => {
    const promptTemplate = `
    Rôle: Tu es un concepteur de micro-exercices d'allemand telc B1 pour francophones.
    Tâche: Génère un exercice ciblé, simple et unique pour le type demandé, en respectant le format JSON.

    Type d'exercice demandé: [EXERCISE_TYPE]

    Instructions générales:
    - Le niveau doit être strictement B1.
    - Le contenu doit être adapté à des situations quotidiennes (travail, loisirs, communication).
    - Fournis TOUJOURS une réponse au format JSON avec les clés: "promptDE", "promptFR", "taskDE", "taskFR", "modelPhrases", "modelSolution". La clé "fullPrompt" est optionnelle, utilisée uniquement pour les exercices de type examen.

    Logique par type d'exercice:
    - 'BRIEF_ODER_EMAIL':
        - promptDE: "Brief oder E-Mail?"
        - promptFR: "Lettre ou e-mail ?"
        - taskDE: Crée une situation ET un court texte (2-3 phrases) qui est clairement plus adapté soit à un e-mail, soit à une lettre formelle. Par exemple: "Situation: Sie bewerben sich um eine Stelle. Text: Sehr geehrte Damen und Herren, hiermit bewerbe ich mich um die ausgeschriebene Stelle..." OU "Situation: Ihr Freund fragt nach dem Wochenende. Text: Hey, was machst du am Samstag? Lust auf Kino?". La tâche pour l'utilisateur est "Lesen Sie den Text. Wofür ist dieser Text besser geeignet?"
        - taskFR: Traduis la situation, le texte et la tâche en français.
        - modelPhrases: Doit contenir EXACTEMENT ["E-Mail", "Brief"].
        - modelSolution: La réponse correcte ("E-Mail" ou "Brief") suivie d'une courte explication en allemand. Par exemple : "Brief. Dies ist eine formelle Bewerbung, daher ist ein Brief angemessener." OU "E-Mail. Dies ist eine informelle Nachricht an einen Freund, eine E-Mail ist perfekt."
    - 'ANREDE_UND_GRUSS':
        - promptDE: "Welche Anrede und Grußformel passen am besten?"
        - promptFR: "Quelle formule de salutation et de politesse convient le mieux ?"
        - taskDE: "Crée une situation avec un niveau de formalité TRÈS CLAIR et SANS AMBIGUÏTÉ (informell, halbformell, ou formell). Par exemple : \"Sie schreiben eine E-Mail an Ihren Chef, Herrn Dr. Meier (formell).\""
        - taskFR: "Traduis la situation en français."
        - modelPhrases: "Crée une liste d'EXACTEMENT 3 options. Chaque option est une chaîne de caractères contenant une Anrede ET une Grußformel, séparées par \"...\". Une seule option doit être correcte pour la situation. Les deux autres doivent être des distracteurs plausibles mais incorrects (mauvaise formalité). Par exemple, pour une situation formelle : [\"Sehr geehrter Herr Dr. Meier, ... Mit freundlichen Grüßen\", \"Hallo Herr Dr. Meier, ... Viele Grüße\", \"Lieber Herr Meier, ... Dein Peter\"]"
        - modelSolution: "La chaîne de caractères EXACTE de \`modelPhrases\` qui est la bonne réponse, suivie d'un point, puis d'une brève explication en allemand. Par exemple : \"'Sehr geehrter Herr Dr. Meier, ... Mit freundlichen Grüßen.' Dies ist eine formelle Situation, daher ist diese Kombination korrekt.\""
    - 'WELCHES_THEMA_PASST':
        - promptDE: "Welches Thema passt zu dieser Aussage?"
        - taskDE: Crée une phrase ou deux sur un sujet clair (ex: "Ich gehe dreimal pro Woche ins Fitnessstudio und spiele am Wochenende Fußball.").
        - modelPhrases: Crée 3 thèmes possibles, dont un correct (ex: ["Sport", "Essen", "Reisen"]).
        - modelSolution: Le thème correct suivi d'une justification. (ex: "Sport. Die Person spricht über Fitnessstudio und Fußball.").
    - 'KURZE_MITTEILUNGEN':
        - promptDE: "Schreiben Sie eine kurze Mitteilung."
        - taskDE: Crée une situation simple (ex: "Sie kommen 15 Minuten zu spät zu einem Treffen mit einem Freund. Schreiben Sie eine SMS.").
        - modelPhrases: ["Hallo, ich komme leider etwas später.", "Ich bin in ca. 15 Minuten da.", "Bis gleich!"]
        - modelSolution: Une SMS complète et courte.
    - 'INTENTION_ERKENNEN':
        - promptDE: "Was möchte die Person erreichen?"
        - promptFR: "Quel est l'objectif de la personne ?"
        - taskDE: Crée un court texte avec une intention claire (demande, excuse, plainte...). (ex: "Könnten Sie mir bitte sagen, wann der Zug nach Hamburg fährt?").
        - taskFR: Traduis le texte de la tâche en français.
        - modelPhrases: Crée 3 intentions possibles. Chaque intention doit être une chaîne de caractères au format "Allemand (Français)". Par exemple : ["sich informieren (s'informer)", "sich beschweren (se plaindre)", "sich entschuldigen (s'excuser)"].
        - modelSolution: La réponse correcte (uniquement la partie allemande de l'intention) suivie d'une courte explication en allemand. Par exemple : "sich informieren. Die Person stellt eine Frage, um eine Information zu erhalten."
    - 'AUF_ANZEIGE_ANTWORTEN':
        - promptDE: "Antworten Sie auf die Anzeige."
        - taskDE: Crée une petite annonce (ex: "Suche Nachhilfe in Englisch. Biete 20€/Stunde."). "Sie können Englisch unterrichten und schreiben eine kurze Antwort."
        - modelPhrases: ["Ich habe Ihre Anzeige gelesen und interessiere mich dafür.", "Ich würde Ihnen gerne Nachhilfe geben.", "Wann hätten Sie Zeit?"]
        - modelSolution: Une courte E-Mail de réponse.
    - 'PERSOENLICHE_EMAIL' ou 'HALBFORMELLE_EMAIL':
        - promptDE: "Schreiben Sie eine kurze E-Mail."
        - taskDE: Crée une situation qui demande une E-Mail personnelle (à un ami) ou halbformell (à un collègue).
        - modelPhrases: Phrases adaptées à la situation (invitation, remerciement...).
        - modelSolution: Une E-Mail complète.
    - 'MEINUNG_SAGEN':
        - promptDE: "Sagen Sie Ihre Meinung zu diesem Thema."
        - taskDE: Donne un thème simple (ex: "Thema: Soziale Medien.")
        - modelPhrases: ["Ich finde, dass...", "Meiner Meinung nach ist...", "Ich glaube, ..."]
        - modelSolution: 1-2 phrases modèles exprimant une opinion.
    - 'ZUSTIMMEN_ODER_WIDERSPRECHEN':
        - promptDE: "Stimmen Sie zu oder widersprechen Sie?"
        - taskDE: Donne une opinion simple (ex: "Ich finde, man sollte jeden Tag Sport machen.").
        - modelPhrases: ["Ich stimme Ihnen zu, weil...", "Das sehe ich auch so.", "Ich bin anderer Meinung, denn..."]
        - modelSolution: Une phrase de réponse (accord ou désaccord).
    - 'ANREDE_SCHLUSSFORMEL_VARIEREN':
        - promptDE: "Variieren Sie Anrede und Grußformel."
        - promptFR: "Variez la salutation et la formule de politesse."
        - taskDE: "Crée DEUX situations distinctes avec des niveaux de formalité CLAIREMENT différents (ex: une informelle à un ami, une formelle à une administration). La tâche est \"Schreiben Sie für jede Situation eine passende Anrede und Grußformel.\""
        - taskFR: "Traduis les deux situations et la tâche en français."
        - modelPhrases: "Fournis une liste de 4 à 6 options (Anreden et Grußformeln variées, formelles et informelles) qui peuvent servir d'inspiration."
        - modelSolution: "Fournis la solution correcte pour LES DEUX situations, avec une brève justification de formalité pour chacune. Par exemple : \"Situation 1 (informell): 'Hallo Anna, ... Viele Grüße.' Dies ist informell, da es ein Freund ist. Situation 2 (formell): 'Sehr geehrte Damen und Herren, ... Mit freundlichen Grüßen.' Dies ist formell für eine Behörde.\""
    - 'ETWAS_BEGRUENDEN':
        - promptDE: "Begründen Sie Ihre Antwort."
        - taskDE: Pose une question simple (ex: "Warum lernen Sie Deutsch?")
        - modelPhrases: ["..., weil ich in Deutschland arbeiten möchte.", "..., denn ich finde die Sprache schön.", "Deshalb lerne ich Deutsch."]
        - modelSolution: Une phrase avec 'weil' et une avec 'denn' ou 'deshalb'.
    - 'ABLEHNUNG_SCHREIBEN':
        - promptDE: "Schreiben Sie eine höfliche Ablehnung."
        - taskDE: Crée une invitation à laquelle l'utilisateur doit répondre négativement (ex: "Einladung zur Party am Samstag. Leider haben Sie keine Zeit.").
        - modelPhrases: ["Vielen Dank für die Einladung, aber leider kann ich nicht kommen.", "Ich habe schon etwas anderes vor.", "Vielleicht klappt es beim nächsten Mal."]
        - modelSolution: Un court message de refus poli.
    - 'EINLADUNG_SCHREIBEN':
        - promptDE: "Schreiben Sie eine kurze Einladung."
        - taskDE: Donne un contexte (ex: "Sie möchten Freunde zum Geburtstag einladen.")
        - modelPhrases: ["Ich möchte dich/euch zu meiner Party einladen.", "Die Party findet am... statt.", "Ich würde mich freuen, wenn du kommst."]
        - modelSolution: Un texte d'invitation court et complet.
    - 'TRAINING_AUFGABE_1' (informell), 'TRAINING_AUFGABE_2' (halbformell), 'TRAINING_AUFGABE_3' (formell), ou 'SIMULATION_AUFGABE_1', 'SIMULATION_AUFGABE_2', 'SIMULATION_AUFGABE_3':
        - La seule différence est le niveau de formalité.
        - Crée une consigne complète de type telc B1. Stocke-la IMPÉRATIVEMENT dans la clé "fullPrompt" du JSON. Le \`fullPrompt\` doit contenir:
            - subject: Titre court.
            - type: 'email' ou 'letter'.
            - formality: 'informal', 'halbformell', ou 'formal' (selon le type d'exercice demandé).
            - situation: Un contexte détaillé et réaliste, comme un e-mail reçu, une annonce, ou une situation de la vie courante. Par exemple: "Sie haben folgende E-Mail von Ihrem Freund Paul erhalten: [...]".
            - task: La consigne précise (ex: "Antworten Sie auf die E-Mail.").
            - guidingPoints: Un tableau d'exactement 4 objets {pointDE, pointFR}.
        - promptDE: Le sujet de l'exercice (ex: "Antwort auf eine E-Mail von einem Freund").
        - promptFR: Traduction du sujet.
        - taskDE: Un résumé de la tâche (ex: "Antworten Sie auf die E-Mail und schreiben Sie etwas zu allen vier Punkten."). CELA DOIT ÊTRE UN RÉSUMÉ, la tâche complète est dans fullPrompt.
        - taskFR: Traduction de la tâche.
        - modelPhrases: Génère 4-5 phrases modèles utiles et variées adaptées aux points directeurs du \`fullPrompt\`.
        - modelSolution: Génère une réponse complète et bien structurée qui couvre tous les points du \`fullPrompt\`.

    Assure-toi que la réponse JSON est toujours complète et valide.
    `;

    const prompt = promptTemplate.replace('[EXERCISE_TYPE]', type);

    const schema = {
        type: Type.OBJECT,
        properties: {
            promptDE: { type: Type.STRING },
            promptFR: { type: Type.STRING },
            taskDE: { type: Type.STRING },
            taskFR: { type: Type.STRING },
            modelPhrases: { type: Type.ARRAY, items: { type: Type.STRING } },
            modelSolution: { type: Type.STRING },
            fullPrompt: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    type: { type: Type.STRING },
                    formality: { type: Type.STRING },
                    situation: { type: Type.STRING },
                    task: { type: Type.STRING },
                    guidingPoints: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                pointDE: { type: Type.STRING },
                                pointFR: { type: Type.STRING }
                            },
                             required: ["pointDE", "pointFR"]
                        }
                    }
                }
            }
        },
        required: ["promptDE", "promptFR", "taskDE", "taskFR", "modelPhrases", "modelSolution"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`Error generating micro-exercise of type ${type}:`, error);
        throw new Error("Failed to generate micro-exercise from Gemini API.");
    }
};


export const getDetailedWritingCorrection = async (exercise: SchriftlicherAusdruckExerciseData, userText: string): Promise<DetailedCorrection> => {
    const prompt = `
    Rôle: Tu es un correcteur expert pour l'examen telc Deutsch B1 - Schriftlicher Ausdruck, partie IV (Training).

    Tâche: Évalue le texte de l'élève pour la tâche d'examen donnée et fournis un feedback complet.

    Contexte de l'exercice:
    - Sujet: ${exercise.subject}
    - Type de tâche (formalité): ${exercise.formality}
    - Situation: ${exercise.situation}
    - Points à traiter: ${JSON.stringify(exercise.guidingPoints.map(p => p.pointDE))}

    Texte de l'élève:
    "${userText}"

    Instructions:
    Fournis une réponse au format JSON avec EXACTEMENT trois clés : "feedbackFR", "userTextTranslationFR", et "correctedVersionDE".

    1.  **feedbackFR**:
        - Doit être entièrement en FRANÇAIS.
        - Donne un feedback clair et constructif.
        - Commence par les points positifs (✅) et ensuite les points à améliorer (❌).
        - Évalue le respect de la consigne, des 4 points, de la structure (Anrede, etc.), la grammaire, et le registre de langue (du/Sie).
        - Sois bienveillant et pédagogique.
        - Exemple: "✅ Ton texte est bien structuré. ❌ Cependant, tu n'as pas parlé des vêtements et il manque une formule de conclusion."

    2.  **userTextTranslationFR**:
        - Doit être entièrement en FRANÇAIS.
        - Fournis une traduction littérale du texte original de l'élève.
        - Exemple: "Texte de l'élève : 'Ich freue mich auf deinen Besuch.' -> Traduction : 'Je me réjouis de ta visite.'"

    3.  **correctedVersionDE**:
        - Doit être entièrement en ALLEMAND.
        - Fournis une version COMPLÈTE et CORRIGÉE du texte de l'élève.
        - Cette version doit être un excellent exemple de niveau B1, respectant scrupuleusement le format telc B1.
        - Adapte le ton, le vocabulaire et les formules au type de tâche (${exercise.formality}).
        - Si l'élève a oublié des points, ajoute-les de manière logique.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            feedbackFR: { type: Type.STRING, description: "Feedback for the user in French, starting with positive (✅) and negative (❌) points." },
            userTextTranslationFR: { type: Type.STRING, description: "A French translation of the user's original text." },
            correctedVersionDE: { type: Type.STRING, description: "The complete, corrected version of the user's text in German." }
        },
        required: ["feedbackFR", "userTextTranslationFR", "correctedVersionDE"]
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting detailed writing correction:", error);
        throw new Error("Failed to get detailed correction from Gemini API.");
    }
};

export const getMicroCorrection = async (taskDE: string, userText: string): Promise<MicroCorrection> => {
    const prompt = `
    Rôle: Tu es un professeur d'allemand B1 sympathique pour un apprenant francophone.
    Tâche: Évalue le court message de l'élève en fonction de la consigne. Fournis un feedback concis et encourageant.

    Consigne: "${taskDE}"
    Message de l'élève: "${userText}"

    Réponds au format JSON avec les clés suivantes :
    1. 'isGood': boolean (true si le message est bon, complet et poli, même avec 1-2 petites fautes de grammaire. false si l'intention n'est pas claire, s'il est impoli ou s'il y a des erreurs majeures).
    2. 'feedbackTextFR': Un court feedback en français. Si c'est bon, félicite l'élève (ex: "Excellent ! Votre message est clair, poli et remplit parfaitement la consigne."). Si c'est faux, explique gentiment en 1-2 phrases ce qu'il faut améliorer (ex: "C'est un bon début, mais n'oubliez pas d'inclure la raison de votre retard." ou "Attention à la politesse, une salutation serait mieux.").
    3. 'correctedTextDE': La version corrigée et idéale du message en allemand. Si le message de l'élève était déjà parfait, répète-le simplement.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            isGood: { type: Type.BOOLEAN },
            feedbackTextFR: { type: Type.STRING },
            correctedTextDE: { type: Type.STRING }
        },
        required: ["isGood", "feedbackTextFR", "correctedTextDE"]
    };
    
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error getting micro correction:", error);
        throw new Error("Failed to get micro correction from Gemini API.");
    }
};

export const generateHoerverstehenTeil1Exercise = async (): Promise<HoerverstehenTeil1Question[]> => {
    const prompt = `
    Rôle: Tu es un formateur d'allemand certifié telc, expert en prononciation Hochdeutsch niveau B1.
    Tâche: Génère un exercice "Hörverstehen Teil 1" complet avec 5 textes audio, en prêtant une attention extrême à la qualité et au réalisme de la prononciation.

    Consignes:
    1. Crée un tableau JSON de 5 objets, un pour chaque question (41-45).
    2. Pour chaque objet, fournis les clés suivantes:
        - \`id\`: Nombre de 41 à 45.
        - \`contextDE\`: La mise en situation en allemand.
        - \`contextFR\`: La traduction française de la mise en situation.
        - \`audioText\`: Un texte court (2-4 phrases) en allemand. Le texte doit être naturel, comme une annonce radio ou un message téléphonique. **Règle de prononciation :** intègre des noms propres (ex: Basel, Zürich), des sigles (ex: ICE) ou des nombres complexes pour que la prononciation soit un défi réaliste.
        - \`keySentence\`: Une phrase complète et importante extraite de l'audioText, qui servira à l'entraînement à la prononciation.
        - \`statement\`: L'affirmation à évaluer (richtig/falsch).
        - \`phoneticKeywords\`: Un tableau de 2-3 objets mots-clés. Chaque objet doit contenir:
            - \`de\`: Le mot ou l'expression en allemand.
            - \`fr\`: Sa traduction française.
            - \`ipa\`: Sa transcription phonétique (API) simple. Ex: pour "Bahnhof", utilise "[ˈbaːnhoːf]".
        - \`correctAnswer\`: 'A' pour 'richtig', 'B' pour 'falsch'.
        - \`explanationDE\`: Explication simple en allemand citant le passage clé.
        - \`explanationFR\`: Traduction de l'explication.
        - \`strategyTipDE\`: Conseil stratégique court en allemand.
        - \`strategyTipFR\`: Traduction du conseil.
        - \`voiceGender\`: Alterne entre "female" et "male".

    Exemple de prononciation à respecter pour la génération du texte :
    - "ICE" doit être écrit comme "ICE" dans le texte, mais le contexte doit suggérer une prononciation allemande [iː tseː eː].
    - Noms de lieux : Utilise des noms comme "Lörrach", "Bad Säckingen".
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.INTEGER },
                contextDE: { type: Type.STRING },
                contextFR: { type: Type.STRING },
                audioText: { type: Type.STRING },
                keySentence: { type: Type.STRING },
                statement: { type: Type.STRING },
                phoneticKeywords: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            de: { type: Type.STRING },
                            fr: { type: Type.STRING },
                            ipa: { type: Type.STRING }
                        },
                        required: ["de", "fr", "ipa"]
                    }
                },
                correctAnswer: { type: Type.STRING, enum: ['A', 'B'] },
                explanationDE: { type: Type.STRING },
                explanationFR: { type: Type.STRING },
                strategyTipDE: { type: Type.STRING },
                strategyTipFR: { type: Type.STRING },
                voiceGender: { type: Type.STRING, enum: ['female', 'male'] }
            },
            required: ["id", "contextDE", "contextFR", "audioText", "keySentence", "statement", "phoneticKeywords", "correctAnswer", "explanationDE", "explanationFR", "strategyTipDE", "strategyTipFR", "voiceGender"]
        }
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating Hörverstehen Teil 1 exercise:", error);
        throw new Error("Failed to generate Hörverstehen Teil 1 exercise from Gemini API.");
    }
};

export const getHoerverstehenPersonalizedTip = async (results: { statement: string, isCorrect: boolean }[]): Promise<string> => {
    const prompt = `
    Rôle: Tu es un coach d'allemand encourageant.
    Tâche: Analyse les résultats d'un élève à un exercice de Hörverstehen Teil 1 et donne un conseil personnalisé et actionnable en FRANÇAIS.

    Résultats de l'élève:
    ${JSON.stringify(results.map(r => ({ question: r.statement, resultat: r.isCorrect ? 'Correct' : 'Incorrect' })), null, 2)}

    Instructions:
    1. Regarde les questions où l'élève a fait des erreurs.
    2. Essaie d'identifier une tendance (ex: problèmes avec les négations, les chiffres, les mots qui se ressemblent). Si aucune tendance n'est claire, donne un conseil général.
    3. Donne UN SEUL conseil concret et facile à appliquer.
    4. Termine par une phrase positive et encourageante.
    5. La réponse doit être courte (2-3 phrases maximum) et entièrement en français.
    
    Exemple de réponse: "C'est un bon entraînement ! Il semble que les négations ('nicht', 'kein') soient un point à surveiller. Essaie de te concentrer sur ces petits mots lors de la prochaine écoute. Continue comme ça, tu progresses !"`

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error getting personalized tip:", error);
        throw new Error("Failed to get tip from Gemini API.");
    }
};

export const generateHoerverstehenTeil2Exercise = async (): Promise<HoerverstehenTeil2ExerciseData> => {
    const prompt = `
    Rôle: Concepteur d'exercices d'allemand expert, format telc B1, "Hörverstehen Teil 2".
    Tâche: Génère un exercice complet et unique au format JSON, en respectant les règles suivantes pour le dialogue.

    Règles de génération pour le dialogue:
    1.  **Attribution des locuteurs**: Le dialogue doit se dérouler entre EXACTEMENT DEUX locuteurs (par exemple, un journaliste et une experte, ou deux amis). Chaque réplique dans le tableau "dialogue" doit avoir un locuteur clairement identifié dans la clé "speaker" (ex: "Moderator", "Frau Herz").
    2.  **Contenu du texte**: La clé "text" doit contenir UNIQUEMENT la phrase dite, SANS le nom du locuteur. La structure JSON \`{ "speaker": "Nom", "text": "Phrase." }\` sépare déjà ces informations.
    3.  **Cohérence du genre**: Assigne des noms masculins et féminins de manière cohérente. Par exemple, si "Frau Herz" est une locutrice, elle doit avoir une voix féminine. Si "Marco" parle, il doit avoir une voix masculine.
    4.  **Structure claire**: Le dialogue doit être fluide, naturel, et adapté à un niveau B1.

    Instructions pour le JSON:
    1.  **thema**: Crée un titre court et pertinent pour l'exercice en allemand (ex: "Ein Gespräch im Reisebüro").
    2.  **dialogue**: Crée un tableau d'objets réplique, chacun avec \`speaker\` et \`text\`. Le dialogue doit être suffisamment long pour répondre à 10 questions.
    3.  **questions**: Crée un tableau de 10 objets question (ID 46-55). Pour chaque question:
        -   \`id\`: Le numéro (46-55).
        -   \`statement\`: Une affirmation (richtig/falsch).
        -   \`correctAnswer\`: 'Richtig' ou 'Falsch'.
        -   \`explanationDE\`: Explication en ALLEMAND, commençant par \`🔑 Schlüsselwörter: ...\`.
        -   \`explanationFR\`: Explication en FRANÇAIS, commençant par \`🔑 Mots-clés : ...\`.
        -   \`relevantSnippet\`: La phrase EXACTE du dialogue qui justifie la réponse.

    Assure-toi que les affirmations testent une écoute détaillée et que les distracteurs sont plausibles.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            thema: { type: Type.STRING, description: "Un titre court et pertinent pour l'exercice en allemand." },
            dialogue: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        speaker: { type: Type.STRING },
                        text: { type: Type.STRING }
                    },
                    required: ["speaker", "text"]
                }
            },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        statement: { type: Type.STRING },
                        correctAnswer: { type: Type.STRING, enum: ['Richtig', 'Falsch'] },
                        explanationDE: { type: Type.STRING },
                        explanationFR: { type: Type.STRING },
                        relevantSnippet: { type: Type.STRING }
                    },
                    required: ["id", "statement", "correctAnswer", "explanationDE", "explanationFR", "relevantSnippet"]
                }
            }
        },
        required: ["thema", "dialogue", "questions"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating Hörverstehen Teil 2 exercise:", error);
        throw new Error("Failed to generate Hörverstehen Teil 2 exercise from Gemini API.");
    }
};

export const generateHoerverstehenTeil2ShortExercise = async (): Promise<HoerverstehenTeil2ShortExerciseData> => {
    const prompt = `
    Rôle: Concepteur de mini-exercices d'allemand, format telc B1, "Hörverstehen Teil 2".
    Tâche: Génère un mini-exercice unique et complet au format JSON, en respectant les règles suivantes pour le dialogue.

    Règles de génération pour le dialogue:
    1.  **Attribution des locuteurs**: Chaque réplique doit avoir un locuteur clairement identifié dans la clé "speaker" (ex: 'Mann', 'Frau', 'Sprecher').
    2.  **Contenu du texte**: La clé "text" doit contenir UNIQUEMENT la phrase dite. La structure JSON \`{ "speaker": "Nom", "text": "Phrase." }\` sépare déjà ces informations.
    3.  **Cohérence du genre**: Assigne des rôles masculins et féminins de manière cohérente (ex: 'Mann' et 'Frau').
    4.  **Structure claire**: Le dialogue doit être court, simple, naturel, et de niveau B1.

    Instructions pour le JSON:
    1.  **title**: Donne un titre court au dialogue.
    2.  **dialogue**: Crée un tableau de 4 à 6 répliques très courtes entre deux locuteurs.
    3.  **questions**: Crée un tableau de 2 à 3 objets "question" basés sur l'extrait. Pour chaque question :
        - \`id\`: Un numéro d'identification (1, 2, 3...).
        - \`statement\`: UNE SEULE affirmation (richtig/falsch).
        - \`correctAnswer\`: 'Richtig' ou 'Falsch'.
        - \`keywords\`: Un tableau de 2-4 mots-clés importants.
        - \`explanationDE\`: Une explication courte et claire en allemand.
        - \`explanationFR\`: La traduction française de l'explication.

    Assure-toi que l'exercice est autonome et facile à comprendre.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            dialogue: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        speaker: { type: Type.STRING },
                        text: { type: Type.STRING }
                    },
                    required: ["speaker", "text"]
                }
            },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        statement: { type: Type.STRING },
                        correctAnswer: { type: Type.STRING, enum: ['Richtig', 'Falsch'] },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        explanationDE: { type: Type.STRING },
                        explanationFR: { type: Type.STRING },
                    },
                    required: ["id", "statement", "correctAnswer", "keywords", "explanationDE", "explanationFR"]
                }
            }
        },
        required: ["title", "dialogue", "questions"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating Hörverstehen Teil 2 short exercise:", error);
        throw new Error("Failed to generate Hörverstehen Teil 2 short exercise from Gemini API.");
    }
};

export const generateHoerverstehenTeil3MeinungExercise = async (): Promise<HoerverstehenTeil3MeinungExerciseData> => {
    const prompt = `Rôle: Concepteur d'exercices expert, format telc B1, "Hörverstehen Teil 3 - Meinungen verstehen".
    Tâche: Génère un exercice complet et unique au format JSON. L'exercice doit simuler une discussion radio où plusieurs personnes donnent leur opinion sur un thème.

    Instructions:
    1.  thema: Crée un thème de discussion pertinent pour le niveau B1 (ex: Umwelt, Gesundheit, Arbeit, Reisen, Medien).
    2.  dialogue: Crée un script audio complet. Il doit commencer par une "Sprecherin" (présentatrice) qui introduit le thème et les 5 participants. Ensuite, chaque participant (alterner hommes/femmes avec des prénoms allemands) donne son opinion en 2-4 phrases. La présentatrice intervient brièvement entre chaque opinion.
        - Chaque tour de parole doit être un objet avec "speaker" (nom), "text", et "voiceGender" ('male' ou 'female').
    3.  questions: Crée un tableau de 5 objets, un pour chaque participant (numérotés 56-60). Chaque objet doit contenir "id" et "speakerName".
    4.  affirmations: Crée un tableau de 6 affirmations (a-f). 5 doivent correspondre aux opinions des participants, et 1 est un distracteur. Chaque objet doit contenir "letter" et "text".
    5.  solutions: Crée un tableau de 5 objets solution. Chaque objet doit contenir:
        - "questionId": Le numéro de la question (56-60).
        - "correctAffirmationLetter": La lettre de l'affirmation correcte (a-f).
        - "feedbackDE": Feedback en allemand expliquant pourquoi c'est correct.
        - "feedbackFR": Traduction du feedback.
        - "relevantSnippet": La phrase ou le passage EXACT du dialogue qui justifie la réponse.

    Assure-toi que les opinions sont claires, distinctes, et que les affirmations sont des paraphrases (pas des copies exactes). Le niveau de langue doit être B1.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            thema: { type: Type.STRING },
            dialogue: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        speaker: { type: Type.STRING },
                        text: { type: Type.STRING },
                        voiceGender: { type: Type.STRING, enum: ['male', 'female'] }
                    },
                    required: ["speaker", "text", "voiceGender"]
                }
            },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        speakerName: { type: Type.STRING }
                    },
                    required: ["id", "speakerName"]
                }
            },
            affirmations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        letter: { type: Type.STRING },
                        text: { type: Type.STRING }
                    },
                    required: ["letter", "text"]
                }
            },
            solutions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        questionId: { type: Type.INTEGER },
                        correctAffirmationLetter: { type: Type.STRING },
                        feedbackDE: { type: Type.STRING },
                        feedbackFR: { type: Type.STRING },
                        relevantSnippet: { type: Type.STRING }
                    },
                    required: ["questionId", "correctAffirmationLetter", "feedbackDE", "feedbackFR", "relevantSnippet"]
                }
            }
        },
        required: ["thema", "dialogue", "questions", "affirmations", "solutions"]
    };

     try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating Hörverstehen Teil 3 Meinung exercise:", error);
        throw new Error("Failed to generate Hörverstehen Teil 3 Meinung exercise from Gemini API.");
    }
};

// --- Hörverstehen Teil 2 Audio Generation ---

export const generateHoerverstehenTeil2Audio = async (dialogue: HoerverstehenTeil2DialogueTurn[]): Promise<string> => {
    // Dynamic voice selection for variety
    const MALE_VOICES = ['Kore', 'Orus', 'Achird'].sort(() => 0.5 - Math.random());
    const FEMALE_VOICES = ['Puck', 'Leda', 'Laomedeia'].sort(() => 0.5 - Math.random());
    const NARRATOR_VOICE = 'Charon';

    const isMaleKeyword = (s: string) => ['herr', 'sprecher', 'erzähler', 'mann', 'journalist', 'marco', 'ben', 'thomas', 'alex', 'julius'].some(kw => s.toLowerCase().includes(kw));
    const isFemaleKeyword = (s: string) => ['frau', 'sprecherin', 'erzählerin', 'laura', 'sabine', 'lena', 'kristin'].some(kw => s.toLowerCase().includes(kw));
    const isNarratorKeyword = (s: string) => s.toLowerCase().includes('erzähler') || s.toLowerCase().includes('erzählerin');

    const uniqueSpeakers = [...new Set(dialogue.map(turn => turn.speaker))];

    // Single speaker fallback for simple cases
    if (uniqueSpeakers.length <= 1) {
        const singlePrompt = dialogue.map(turn => turn.text).join(' \n');
        const speaker = uniqueSpeakers[0] || 'Sprecherin'; // Default
        let voiceName = FEMALE_VOICES[0];
        if (isNarratorKeyword(speaker)) {
            voiceName = NARRATOR_VOICE;
        } else if (isMaleKeyword(speaker)) {
            voiceName = MALE_VOICES[0];
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: singlePrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned from API for single speaker.");
        return base64Audio;
    }

    // Multi-speaker logic
    const speakerVoiceConfigs = [];
    let maleVoiceIndex = 0;
    let femaleVoiceIndex = 0;

    // Separate narrators to always assign Charon
    const narrators = uniqueSpeakers.filter(isNarratorKeyword);
    const otherSpeakers = uniqueSpeakers.filter(s => !isNarratorKeyword(s));

    for (const speaker of narrators) {
        speakerVoiceConfigs.push({
            speaker: speaker,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: NARRATOR_VOICE } }
        });
    }

    // Assign voices to other speakers based on gender
    const maleSpeakers = otherSpeakers.filter(isMaleKeyword);
    // Default unknown speakers to female
    const femaleSpeakers = otherSpeakers.filter(s => isFemaleKeyword(s) || !isMaleKeyword(s));

    for (const speaker of maleSpeakers) {
        const voiceName = MALE_VOICES[maleVoiceIndex % MALE_VOICES.length];
        maleVoiceIndex++;
        speakerVoiceConfigs.push({
            speaker: speaker,
            voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        });
    }

    for (const speaker of femaleSpeakers) {
        const voiceName = FEMALE_VOICES[femaleVoiceIndex % FEMALE_VOICES.length];
        femaleVoiceIndex++;
        speakerVoiceConfigs.push({
            speaker: speaker,
            voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        });
    }
    
    // The prompt now uses the original speaker names
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
    if (!base64Audio) {
        throw new Error("No audio data returned from API for multi-speaker.");
    }
    return base64Audio;
};


const getVoiceNameForSpeaker = (speaker: string): string => {
    const lower = speaker.toLowerCase();
    
    if (lower.includes('erzähler')) return 'Charon';

    const MALE_KEYWORDS = ['herr', 'mann', 'sprecher', 'journalist', 'marco', 'ben', 'alex', 'julius'];
    if (MALE_KEYWORDS.some(kw => lower.includes(kw))) return 'Kore';
    
    // Default to a female voice for any other case
    return 'Puck';
};


export const generateSingleSnippetAudio = async (text: string, speaker: string): Promise<string> => {
    const voiceName = getVoiceNameForSpeaker(speaker);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
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
    if (!base64Audio) {
        throw new Error("No audio data for snippet returned from API.");
    }
    return base64Audio;
};
