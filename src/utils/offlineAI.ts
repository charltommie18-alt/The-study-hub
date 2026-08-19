// Client-Side Offline AI Assistant Engine
// Powers Note Summaries, Flashcard Decks, Practice Quizzes, and Tutor Chat when Offline.

export interface OfflineSummaryResult {
  title: string;
  summary: string;
  keyTakeaways: string[];
  glossary: { term: string; definition: string }[];
  studyTips: string[];
}

export interface OfflineFlashcard {
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
}

export interface OfflineQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OfflineTutorReply {
  reply: string;
  suggestedFollowups: string[];
}

export interface OfflineStudyPlan {
  planTitle: string;
  dailySchedule: {
    dayNumber: number;
    topicName: string;
    goals: string[];
    estimatedMinutes: number;
  }[];
}

// 1. Offline Note Summarizer
export function generateOfflineSummary(text: string, subjectName: string, langCode: string = 'af-ZA'): OfflineSummaryResult {
  const isAf = langCode.startsWith('af') || langCode.toLowerCase().includes('afrikaans') || /\b(die|en|is|wat|hoe|verduidelik|bereken|stel|opsomming|vraag|antwoord|wette|selle|energie|deur|hierdie)\b/i.test(text);

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const words = text.split(/\s+/);
  const titleWord = words[0] || (isAf ? 'Kernmateriaal' : 'Core Subject Material');

  if (isAf) {
    const title = `${subjectName || 'Studie'}: ${titleWord.replace(/[^a-zA-Z]/g, '')} Konsepoorsig (Vanlyn KI)`;
    const overviewSentences = sentences.slice(0, 3).join('. ');
    const summary = overviewSentences.length > 20 
      ? `${overviewSentences}. [Ontleed via Vanlyn Afrikaanse KI-enjin]`
      : `Omvattende studie-oorsig vir ${subjectName}. Dek noodsaaklike beginsels, definisies en aktiewe herroepingspunte.`;

    const keyTakeaways = sentences.slice(0, 5).map((s, idx) => `Kernpunt ${idx + 1}: ${s}.`);
    if (keyTakeaways.length === 0) {
      keyTakeaways.push(
        'Fokus eerstens op die bemeestering van fundamentele definisies.',
        'Verbind kernbeginsels met werklike eksamentoepassings.',
        'Oefen daagliks aktiewe herroeping met flitskaarte.'
      );
    }

    const capitalizedWords = Array.from(new Set(text.match(/\b[A-Z][a-z]{3,}\b/g) || []));
    const glossary = capitalizedWords.slice(0, 4).map((word) => ({
      term: word,
      definition: `Noodsaaklike konseptuele element in ${subjectName}-materiaal.`,
    }));

    if (glossary.length < 2) {
      glossary.push(
        { term: 'Kernmeganika', definition: 'Die fundamentele onderliggende reëls wat hierdie onderwerp beheer.' },
        { term: 'Sleutelreël/Formule', definition: 'Kritiese analitiese standaard wat benodig word vir probleemoplossing.' }
      );
    }

    return {
      title,
      summary,
      keyTakeaways,
      glossary,
      studyTips: [
        '⚡ Vanlyn Wenk: Toets jouself met die Flitskaarte-oortjie om aktiewe herroeping te versterk.',
        '📖 Som elke afdeling in jou eie woorde op voor die eksamen.',
        '⏱️ Koppel jou studie met 25 minute in die Fokusateljee.',
      ],
    };
  }

  const title = `${subjectName || 'Study'}: ${titleWord.replace(/[^a-zA-Z]/g, '')} Concept Overview (Offline AI)`;

  const overviewSentences = sentences.slice(0, 3).join('. ');
  const summary = overviewSentences.length > 20 
    ? `${overviewSentences}. [Analyzed via Offline AI Engine]`
    : `Comprehensive study breakdown for ${subjectName}. Covers essential principles, definitions, and active recall key points.`;

  const keyTakeaways = sentences.slice(0, 5).map((s, idx) => `Key Point ${idx + 1}: ${s}.`);
  if (keyTakeaways.length === 0) {
    keyTakeaways.push(
      'Focus on mastering fundamental definitions first.',
      'Connect core principles to real-world exam applications.',
      'Perform active recall daily with flashcards.'
    );
  }

  // Extract key terms
  const capitalizedWords = Array.from(new Set(text.match(/\b[A-Z][a-z]{3,}\b/g) || []));
  const glossary = capitalizedWords.slice(0, 4).map((word) => ({
    term: word,
    definition: `Essential conceptual element in ${subjectName} material.`,
  }));

  if (glossary.length < 2) {
    glossary.push(
      { term: 'Core Mechanics', definition: 'The fundamental underlying rules governing this topic.' },
      { term: 'Key Formula/Rule', definition: 'Critical analytical standard required for problem solving.' }
    );
  }

  return {
    title,
    summary,
    keyTakeaways,
    glossary,
    studyTips: [
      '⚡ Offline Tip: Test yourself using the Flashcards tab to reinforce active recall.',
      '📖 Summarize each section in your own words before your exam.',
      '⏱️ Pair your study with a 25-minute Pomodoro sprint in the Focus Studio.',
    ],
  };
}

// 2. Offline Flashcard Generator
export function generateOfflineFlashcards(
  text: string,
  subjectName: string,
  count: number = 5,
  langCode: string = 'af-ZA'
): OfflineFlashcard[] {
  const isAf = langCode.startsWith('af') || langCode.toLowerCase().includes('afrikaans') || /\b(die|en|is|wat|hoe|verduidelik|bereken|stel|opsomming|vraag|antwoord|wette|selle|energie|deur|hierdie)\b/i.test(text);

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const cards: OfflineFlashcard[] = [];

  for (let i = 0; i < count; i++) {
    const sentence = sentences[i % sentences.length] || (isAf ? `Kernbeginsel ${i + 1} van ${subjectName}` : `Core Principle ${i + 1} of ${subjectName}`);
    const words = sentence.split(' ');
    
    let q = isAf 
      ? `Wat is die betekenis van "${words.slice(0, 3).join(' ')}..." in ${subjectName}?`
      : `What is the significance of "${words.slice(0, 3).join(' ')}..." in ${subjectName}?`;
    let a = sentence;
    let hint = isAf ? `Fokus op sleutelterminologie uit jou notas.` : `Focus on key terminology from your notes.`;

    if (i === 0) {
      q = isAf 
        ? `Definieer die primêre konsep wat in hierdie ${subjectName}-notas bespreek word.`
        : `Define the primary concept discussed in these ${subjectName} notes.`;
      a = sentences[0] || (isAf ? `Die hooffokus is om kernmeganismes en definisies in ${subjectName} te verstaan.` : `The main focus is understanding core mechanisms and definitions in ${subjectName}.`);
      hint = isAf ? `Dink aan die openingsopsomming van die materiaal.` : `Think about the opening summary of the material.`;
    } else if (i === 1) {
      q = isAf
        ? `Hoe word sleutelbeginsels in ${subjectName} toegepas op praktiese probleemoplossing?`
        : `How do key principles in ${subjectName} apply to practical problem solving?`;
      a = sentences[1] || (isAf ? `Hulle bied gestruktureerde raamwerke om eksamenvrae te ontleed en op te los.` : `They provide structured frameworks to analyze and solve exam questions.`);
      hint = isAf ? `Onthou oorsaak-en-gevolg verhoudings.` : `Recall cause-and-effect relationships.`;
    }

    cards.push({
      question: q,
      answer: a,
      category: subjectName || (isAf ? 'Algemeen' : 'General'),
      difficulty: i % 2 === 0 ? 'easy' : 'medium',
      hint,
    });
  }

  return cards;
}

// 3. Offline Quiz Generator
export function generateOfflineQuiz(
  text: string,
  subjectName: string,
  count: number = 4,
  langCode: string = 'af-ZA'
): OfflineQuizQuestion[] {
  const isAf = langCode.startsWith('af') || langCode.toLowerCase().includes('afrikaans') || /\b(die|en|is|wat|hoe|verduidelik|bereken|stel|opsomming|vraag|antwoord|wette|selle|energie|deur|hierdie)\b/i.test(text);

  const questions: OfflineQuizQuestion[] = [];
  const topics = text.split(/\s+/).filter((w) => w.length > 5);
  const mainKeyword = topics[0] || subjectName || (isAf ? 'Kernmateriaal' : 'Core Material');

  for (let i = 0; i < count; i++) {
    if (isAf) {
      questions.push({
        id: `off-q-${Date.now()}-${i}`,
        question: `[Vanlyn Toets V${i + 1}] Watter stelling beskryf die rol van ${mainKeyword} in ${subjectName} die beste?`,
        options: [
          `Dit dien as die fundamentele beginsel vir die ontleding van sleutelbegrippe.`,
          `Dit is 'n verouderde sekondêre teorie wat selde in eksamens gevra word.`,
          `Dit funksioneer heeltemal onafhanklik van standaard ${subjectName}-reëls.`,
          `Dit is slegs van toepassing onder laboratoriumtoestande en wiskundig weglaatbaar.`
        ],
        correctAnswerIndex: 0,
        explanation: `Keuse A is korrek omdat ${mainKeyword} die primêre analitiese raamwerk vir ${subjectName} verteenwoordig.`,
        hint: `Oorweeg watter opsie die grondbeginsels en korrekte toepassing beklemtoon.`,
        difficulty: 'medium'
      });
    } else {
      questions.push({
        id: `off-q-${Date.now()}-${i}`,
        question: `[Offline Quiz Q${i + 1}] Which statement best describes the role of ${mainKeyword} in ${subjectName}?`,
        options: [
          `It serves as the foundational principle for analyzing key concepts.`,
          `It is an outdated secondary theory rarely tested on exams.`,
          `It operates completely independent of standard ${subjectName} rules.`,
          `It only applies in laboratory conditions and is mathematically negligible.`
        ],
        correctAnswerIndex: 0,
        explanation: `Statement A is correct because ${mainKeyword} represents the primary framework for ${subjectName}.`,
        hint: `Consider which option emphasizes foundational principles.`,
        difficulty: 'medium'
      });
    }
  }

  return questions;
}

// 4. Offline AI Tutor Chat
export function generateOfflineTutorReply(
  userPrompt: string,
  subjectName: string,
  persona: string = 'Socratic Mentor',
  langCode: string = 'af-ZA'
): OfflineTutorReply {
  const pLower = userPrompt.toLowerCase();
  const isAf = langCode.startsWith('af') || langCode.toLowerCase().includes('afrikaans') || /\b(die|en|is|wat|hoe|verduidelik|eksamen|toets|wette|selle)\b/i.test(pLower);

  if (isAf) {
    let reply = `🤖 **Vanlyn Afrikaanse KI-Leermeester (${persona})**: \n\n`;
    if (pLower.includes('verduidelik') || pLower.includes('wat is') || pLower.includes('explain') || pLower.includes('what is')) {
      reply += `Uitstekende vraag! In **${subjectName}**, handel **${userPrompt}** oor die volgende sleutelbeginsels:\n\n` +
        `• **Kern Definisie**: Die fundamentele meganisme en teorie onderliggend aan hierdie konsep.\n` +
        `• **Belangrike Funksie**: Verbind kernkonsepte met praktiese wetenskaplike of wiskundige oplossings.\n` +
        `• **Eksamenstrategie**: Onthou om altyd die korrekte terme en stappe duidelik uit te skryf vir volpunte in die eksamen.`;
    } else if (pLower.includes('eksamen') || pLower.includes('toets') || pLower.includes('wenk') || pLower.includes('exam') || pLower.includes('tip')) {
      reply += `🎯 **Hoë-Waarde Eksamenwenke vir ${subjectName}**:\n\n` +
        `1. **Aktiewe Herroeping**: Moenie net notas lees nie; toets jouself gereeld met flitskaarte.\n` +
        `2. **Presiese Woordeskat**: Memoriseer definisies presies soos in die KABV/IEB riglyne.\n` +
        `3. **Fokus-Sessies**: Gebruik die Fokusateljee vir 25 minute van ononderbroke studie.`;
    } else {
      reply += `Ek ontleed jou vraag oor **${userPrompt}** vir **${subjectName}**.\n\n` +
        `Hier is 'n gestruktureerde oorsig:\n` +
        `• **Hoofbeginsel**: Identifiseer die kernveranderlikes en formules.\n` +
        `• **Toepassing**: Pas dit toe op vorige vraestelle en modelmemo's.\n\n` +
        `*(Vanlyn Plaaslike KI-modus. Koppel aan die internet vir lewendige Gemini wolk-analise).*`;
    }

    return {
      reply,
      suggestedFollowups: [
        `Wys vir my 'n voorbeeldvraag vir ${subjectName}`,
        `Hoe word hierdie konsep in eindeksamens gevra?`,
        `Gee my 'n eenvoudige analogie in Afrikaans`
      ]
    };
  }

  let reply = `🤖 **Offline AI Tutor (${persona})**: \n\n`;

  if (pLower.includes('explain') || pLower.includes('what is')) {
    reply += `Great question! In **${subjectName}**, **${userPrompt}** revolves around key core principles:\n\n` +
      `• **Definition**: The fundamental process underlying this topic.\n` +
      `• **Key Function**: Converts core inputs into predictable outcomes.\n` +
      `• **Exam Strategy**: Always highlight the step-by-step mechanism in essay or short-answer questions.`;
  } else if (pLower.includes('exam') || pLower.includes('test') || pLower.includes('tip')) {
    reply += `🎯 **High-Yield Exam Tips for ${subjectName}**:\n\n` +
      `1. **Active Recall**: Don't just re-read notes; practice retrieving concepts from memory.\n` +
      `2. **Key Vocabulary**: Memorize core definitions accurately.\n` +
      `3. **Pacing**: Dedicate 25 minutes of uninterrupted focus in the Focus Studio.`;
  } else {
    reply += `I'm analyzing your request regarding **${userPrompt}** in **${subjectName}**.\n\n` +
      `Here is a structured breakdown:\n` +
      `• **Core Concept**: Identify the main variables and principles involved.\n` +
      `• **Application**: Connect this topic to practical problem-solving methods.\n\n` +
      `*(Note: Running on Offline Local AI Engine while offline. Connect to internet for live web AI search capabilities).*`;
  }

  return {
    reply,
    suggestedFollowups: [
      `Give me an offline flashcard on ${subjectName}`,
      `How is this tested on final exams?`,
      `Explain with a simple real-world analogy`
    ]
  };
}

export function generateOfflineTutorResponse(
  userPrompt: string,
  subjectName: string,
  persona: string = 'Socratic Mentor',
  langCode: string = 'af-ZA'
) {
  const res = generateOfflineTutorReply(userPrompt, subjectName, persona, langCode);
  return {
    text: res.reply,
    suggestedFollowups: res.suggestedFollowups,
  };
}

// 5. Offline Study Plan Generator
export function generateOfflineStudyPlan(
  subjectName: string,
  days: number = 7,
  hoursPerDay: number = 2,
  topicsInput: string = ''
): OfflineStudyPlan {
  const topicList = topicsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0);

  const dailySchedule = [];
  for (let d = 1; d <= Math.min(days, 14); d++) {
    const topic = topicList[(d - 1) % topicList.length] || `Module ${d}: ${subjectName} Core Foundations`;
    dailySchedule.push({
      dayNumber: d,
      topicName: topic,
      goals: [
        `Review key concepts for ${topic}`,
        `Complete 10 active recall flashcards`,
        `Take 1 practice quiz assessment`
      ],
      estimatedMinutes: hoursPerDay * 60
    });
  }

  return {
    planTitle: `${subjectName} ${days}-Day High-Yield Study Roadmap (Offline AI)`,
    dailySchedule
  };
}
