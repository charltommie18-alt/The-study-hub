import { Subject, Note, Flashcard, QuizQuestion, QuizResult, TutorMessage } from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'studyhub_subjects_v1',
  NOTES: 'studyhub_notes_v1',
  FLASHCARDS: 'studyhub_flashcards_v1',
  QUIZ_QUESTIONS: 'studyhub_quiz_questions_v1',
  QUIZ_RESULTS: 'studyhub_quiz_results_v1',
  TUTOR_MESSAGES: 'studyhub_tutor_messages_v1',
  FOCUS_MINUTES: 'studyhub_focus_minutes_v1',
  STREAK_DAYS: 'studyhub_streak_days_v1',
};

export const loadStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return fallback;
  }
};

export const saveStoredData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

export const loadFromStorage = loadStoredData;
export const saveToStorage = saveStoredData;

export { STORAGE_KEYS };
