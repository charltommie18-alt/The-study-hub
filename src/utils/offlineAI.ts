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
export function generateOfflineSummary(text: string, subjectName: string): OfflineSummaryResult {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const words = text.split(/\s+/);
  const titleWord = words[0] || 'Core Subject Material';

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
  count: number = 5
): OfflineFlashcard[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const cards: OfflineFlashcard[] = [];

  for (let i = 0; i < count; i++) {
    const sentence = sentences[i % sentences.length] || `Core Principle ${i + 1} of ${subjectName}`;
    const words = sentence.split(' ');
    
    let q = `What is the significance of "${words.slice(0, 3).join(' ')}..." in ${subjectName}?`;
    let a = sentence;
    let hint = `Focus on key terminology from your notes.`;

    if (i === 0) {
      q = `Define the primary concept discussed in these ${subjectName} notes.`;
      a = sentences[0] || `The main focus is understanding core mechanisms and definitions in ${subjectName}.`;
      hint = `Think about the opening summary of the material.`;
    } else if (i === 1) {
      q = `How do key principles in ${subjectName} apply to practical problem solving?`;
      a = sentences[1] || `They provide structured frameworks to analyze and solve exam questions.`;
      hint = `Recall cause-and-effect relationships.`;
    } else if (i === 2) {
      q = `What common pitfall or trap should be avoided in ${subjectName}?`;
      a = `Avoid confusing fundamental definitions with secondary edge cases; always verify formulas.`;
      hint = `Check the core formulas and rules.`;
    }

    cards.push({
      question: q,
      answer: a,
      category: subjectName || 'General',
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
  count: number = 4
): OfflineQuizQuestion[] {
  const questions: OfflineQuizQuestion[] = [];

  const topics = text.split(/\s+/).filter((w) => w.length > 5);
  const mainKeyword = topics[0] || subjectName || 'Core Material';

  for (let i = 0; i < count; i++) {
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

  return questions;
}

// 4. Offline AI Tutor Chat
export function generateOfflineTutorReply(
  userPrompt: string,
  subjectName: string,
  persona: string = 'Socratic Mentor'
): OfflineTutorReply {
  const pLower = userPrompt.toLowerCase();

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
  persona: string = 'Socratic Mentor'
) {
  const res = generateOfflineTutorReply(userPrompt, subjectName, persona);
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
