import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse require warning:', e);
}

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'The Study Hub',
  });
});

// 2. Note Summarize API
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, subject, format } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide note text to summarize.' });
    }

    const ai = getGeminiAI();
    if (!ai) {
      // Fallback structured result if key is not configured
      return res.json({
        title: `${subject || 'Study Notes'} Summary`,
        summary: `Here is a structured overview of your notes: ${text.slice(0, 300)}...`,
        keyTakeaways: [
          'Core concepts identified from input material.',
          'Important formulas and core principles highlighted.',
          'Ready for active recall and quiz generation.',
        ],
        glossary: [
          { term: 'Core Focus', definition: 'The primary subject matter analyzed in these notes.' },
        ],
        studyTips: [
          'Review these key points daily using spaced repetition.',
          'Convert tough terms into custom flashcard drills.',
        ],
      });
    }

    const prompt = `You are an expert AI Study Assistant for "The Study Hub". Analyze the following study notes/material for subject "${subject || 'General Studies'}".
    Provide a detailed structured breakdown with:
    1. A concise overview title
    2. Executive high-yield summary
    3. Key bullet takeaways (3-6 bullet points)
    4. Key terms & definitions glossary (3-6 items)
    5. Specific exam & memory tips.

    Note content:
    """
    ${text}
    """`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            studyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'summary', 'keyTakeaways', 'glossary', 'studyTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Summarize error:', error);
    return res.status(500).json({
      error: 'Failed to generate summary.',
      details: error?.message || 'Internal server error',
    });
  }
});

// 3. Generate Flashcards API
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { text, subject, count = 6, difficulty = 'medium' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide topic or material to generate flashcards.' });
    }

    const ai = getGeminiAI();
    if (!ai) {
      // Mock generated flashcards if key missing
      return res.json({
        flashcards: [
          {
            question: `What is the central concept of ${subject || 'this topic'}?`,
            answer: `It revolves around analyzing ${text.slice(0, 100)}...`,
            category: subject || 'General',
            difficulty: 'easy',
            hint: 'Think about the main definition.',
          },
          {
            question: `How do key components interact in ${subject || 'this context'}?`,
            answer: 'They work systematically to support core functions and processes.',
            category: subject || 'General',
            difficulty: 'medium',
            hint: 'Consider cause and effect relations.',
          },
        ],
      });
    }

    const prompt = `Generate exactly ${count} high-quality flashcards for studying "${subject || 'General Knowledge'}".
    Base them on the following content or request:
    """
    ${text}
    """
    Difficulty target: ${difficulty}.
    Ensure questions test core conceptual understanding, key terminology, or problem solving. Include a helpful hint for each.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['question', 'answer', 'category', 'difficulty', 'hint'],
              },
            },
          },
          required: ['flashcards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Flashcards error:', error);
    return res.status(500).json({ error: 'Failed to generate flashcards.', details: error?.message });
  }
});

// 4. Generate Practice Quiz API
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { text, subject, count = 5 } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide material for the quiz.' });
    }

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({
        quizTitle: `${subject || 'Study'} Mastery Quiz`,
        questions: [
          {
            id: 'q1',
            question: `Which statement accurately describes the main focus of ${subject || 'this material'}?`,
            options: [
              'It describes fundamental principles and core mechanics.',
              'It deals exclusively with unrelated secondary phenomena.',
              'It rejects standard analytical definitions.',
              'None of the above.',
            ],
            correctAnswerIndex: 0,
            explanation: 'The core material focuses on foundational principles.',
            hint: 'Look for the primary definition.',
            difficulty: 'easy',
          },
        ],
      });
    }

    const prompt = `Create an interactive practice quiz with ${count} multiple choice questions on the subject "${subject || 'General Study'}".
    Base questions on this material:
    """
    ${text}
    """
    Requirements:
    - Each question must have 4 clear option choices.
    - Exactly 1 correct option index (0, 1, 2, or 3).
    - Detailed step-by-step explanation for why the answer is correct.
    - A helpful subtle hint.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'hint'],
              },
            },
          },
          required: ['quizTitle', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Quiz error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz.', details: error?.message });
  }
});

// 5. AI Study Tutor Chat API
app.post('/api/tutor-chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], subject = 'General', persona = 'Socratic Tutor' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please enter a question or topic.' });
    }

    const ai = getGeminiAI();
    if (!ai) {
      return res.json({
        reply: `As your ${persona} for ${subject}, here is how we break this down: \n\n1. **Core Concept**: ${message}\n2. **Key Insight**: Break complex ideas into smaller components.\n\nWhat specific part would you like to explore next?`,
        suggestedFollowups: [
          'Can you give me an example?',
          'How does this show up on exams?',
          'Generate a quick quiz question on this.',
        ],
      });
    }

    const personaInstructions: Record<string, string> = {
      'Socratic Mentor': 'Guide the student through thoughtful questions, leading them to discover answers independently.',
      'ELI5 (Explain Like I\'m 5)': 'Use super simple analogies, clear everyday metaphors, and non-jargon language.',
      'Exam Coach': 'Focus heavily on high-yield exam patterns, common traps, formula shortcuts, and scoring tips.',
      'Concept Dissector': 'Break down complex topics into clear step-by-step logical bullet points and diagrams.',
    };

    const systemInstruction = `You are "StudyBot", the intelligent AI Study Tutor inside "The Study Hub".
    Active Subject: "${subject}".
    Persona: "${persona}" (${personaInstructions[persona] || personaInstructions['Socratic Mentor']}).
    
    Instructions:
    - Keep answers clear, supportive, highly structured, and engaging.
    - Use Markdown formatting for headings, bold key terms, and code/math blocks if needed.
    - End with 2-3 suggested quick follow-up questions for the student.`;

    const chatMessages = conversationHistory.map((item: any) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }],
    }));

    // Append user message
    chatMessages.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: chatMessages,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedFollowups: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['reply', 'suggestedFollowups'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    return res.status(500).json({ error: 'Failed to process AI tutor message.', details: error?.message });
  }
});

// 6. Generate Study Plan API
app.post('/api/study-plan', async (req, res) => {
  try {
    const { subject, days = 7, hoursPerDay = 2, topics = [] } = req.body;
    const ai = getGeminiAI();

    if (!ai) {
      return res.json({
        planTitle: `${subject || 'Exam'} ${days}-Day High-Yield Study Roadmap`,
        dailySchedule: Array.from({ length: Math.min(days, 7) }).map((_, idx) => ({
          dayNumber: idx + 1,
          topicName: topics[idx] || `Core Module ${idx + 1}`,
          goals: ['Review fundamental definitions', 'Complete 15 flashcards', 'Take a 5-question practice quiz'],
          estimatedMinutes: hoursPerDay * 60,
        })),
      });
    }

    const prompt = `Create a detailed ${days}-day study plan for subject "${subject}" spending ${hoursPerDay} hours per day.
    Topics covered: ${topics.length ? topics.join(', ') : 'All key modules'}.
    Output a day-by-day roadmap with specific daily study goals, active recall tasks, and target time.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            dailySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  topicName: { type: Type.STRING },
                  goals: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  estimatedMinutes: { type: Type.INTEGER },
                },
                required: ['dayNumber', 'topicName', 'goals', 'estimatedMinutes'],
              },
            },
          },
          required: ['planTitle', 'dailySchedule'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Study plan error:', error);
    return res.status(500).json({ error: 'Failed to generate study plan.', details: error?.message });
  }
});

// 7. Document & PDF Parsing API
app.post('/api/parse-document', async (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;
    if (!fileData || typeof fileData !== 'string') {
      return res.status(400).json({ error: 'Please provide valid file data string.' });
    }

    let extractedText = '';
    let pageCount = 1;

    const base64Content = fileData.replace(/^data:.*?;base64,/, '');

    if (mimeType === 'application/pdf' || (fileName && fileName.toLowerCase().endsWith('.pdf'))) {
      const buffer = Buffer.from(base64Content, 'base64');
      const parseFn = typeof pdfParse === 'function' ? pdfParse : pdfParse?.default;
      if (typeof parseFn === 'function') {
        const pdfResult = await parseFn(buffer);
        extractedText = pdfResult.text || '';
        pageCount = pdfResult.numpages || 1;
      } else {
        extractedText = buffer.toString('utf-8');
      }
    } else {
      const buffer = Buffer.from(base64Content, 'base64');
      extractedText = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace
    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    return res.json({
      fileName: fileName || 'Uploaded Document',
      extractedText,
      pageCount,
      wordCount,
      mimeType: mimeType || 'text/plain',
    });
  } catch (error: any) {
    console.error('Document parsing error:', error);
    return res.status(500).json({
      error: 'Failed to extract text from document.',
      details: error?.message || 'Invalid or corrupted document',
    });
  }
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Study Hub server running on http://localhost:${PORT}`);
  });
}

startServer();
