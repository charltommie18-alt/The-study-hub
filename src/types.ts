export type TabType = 
  | 'notes' 
  | 'flashcards' 
  | 'quiz' 
  | 'mockexam'
  | 'podcast'
  | 'canvas'
  | 'focus' 
  | 'tutor' 
  | 'upload' 
  | 'achievements' 
  | 'studyroom' 
  | 'analytics' 
  | 'admin' 
  | 'planner';

export interface ExamQuestion {
  id: string;
  section: string; // 'Section A: Objective' | 'Section B: Structured' | 'Section C: Extended'
  questionText: string;
  marks: number;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  options?: string[];
  correctOptionIndex?: number;
  modelAnswer: string;
  afrikaansTranslation?: string;
  rubricCriteria: string[];
}

export interface MockExamPaper {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: GradeLevel;
  durationMinutes: number;
  totalMarks: number;
  questions: ExamQuestion[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  durationSeconds: number;
  language: 'af-ZA' | 'en-US' | 'en-ZA';
  audioUrl?: string;
  transcript: string;
  afrikaansTranscript?: string;
  keyTakeaways: string[];
  createdAt: string;
}

export interface DiagramAnalysisResult {
  accuracyScore: number; // 0-100
  title: string;
  feedback: string;
  correctLabels: string[];
  missingOrIncorrectLabels: string[];
  examTips: string;
}

export interface ProjectDeadline {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  description?: string;
  isCompleted: boolean;
}

export interface PlannedSession {
  id: string;
  dayLabel: string;
  timeSlot: string;
  subjectName: string;
  topic: string;
  taskType: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  reminderAlertTime?: string;
  taskDescription?: string;
  isCompleted: boolean;
}

export type GradeLevel = 
  | 'grade-7' 
  | 'grade-8' 
  | 'grade-9' 
  | 'grade-10' 
  | 'grade-11' 
  | 'grade-12' 
  | 'tertiary';

export type CurrencyCode = 'USD' | 'ZAR' | 'EUR' | 'GBP' | 'JMD' | 'NGN' | 'CAD' | 'AUD';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'Focus' | 'Mastery' | 'Consistency' | 'Uploads' | 'AI Tutor';
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  streakDays: number;
  totalFocusMinutes: number;
  masteredCardsCount: number;
  quizzesCompleted: number;
  docsUploaded: number;
  aiQueriesCount: number;
}

export interface StudyRoomMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  badge?: string;
  sharedType?: 'note' | 'quiz' | 'challenge';
}

export interface StudyRoom {
  id: string;
  code: string;
  name: string;
  subject: string;
  gradeLevel: GradeLevel;
  membersCount: number;
  activeTopic: string;
  hostName: string;
}

export interface GradeConfig {
  id: GradeLevel;
  name: string;
  category: 'Junior Secondary' | 'Senior Secondary' | 'Tertiary / Advanced';
  description: string;
}

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText: string;
  wordCount: number;
  pageCount: number;
  uploadedAt: string;
  subjectId: string;
  gradeLevel: GradeLevel;
  summaryTitle?: string;
}

export interface SubscriberRecord {
  id: string;
  fullName: string;
  email: string;
  gradeLevel: GradeLevel;
  tier: 'Free' | 'Pro' | 'Institutional';
  currency: CurrencyCode;
  amount: number;
  status: 'Active' | 'Pending' | 'Canceled';
  joinedDate: string;
  lastActiveDate: string;
  docsUploaded: number;
}

export interface DailyAnalyticsRecord {
  date: string; // YYYY-MM-DD
  activeUsers: number;
  docUploads: number;
  aiPromptsCount: number;
  quizzesTaken: number;
  newSubscriptions: number;
  revenueUsd: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  progress: number; // 0-100
  notesCount: number;
  flashcardsCount: number;
  quizScore: number;
  gradeLevel?: GradeLevel;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  summary: string;
  keyTakeaways: string[];
  glossary: GlossaryItem[];
  studyTips: string[];
  createdAt: string;
  tags: string[];
}

export interface Flashcard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint: string;
  status: 'new' | 'learning' | 'mastered';
  lastReviewed?: string;
  nextReviewDate?: string;
  intervalDays?: number;
  easeFactor?: number;
  timesReviewed: number;
}

export interface SubscriptionState {
  status: 'free' | 'trial' | 'active';
  trialStartDate?: string;
  trialEndDate?: string;
  planName: string;
  priceMonthly: number;
  currency: CurrencyCode;
  isFireOSCompatible: boolean;
  autoRenew: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userSelectedIndex?: number;
}

export interface QuizResult {
  id: string;
  subjectId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedFollowups?: string[];
  persona?: string;
}

export interface HourlyStudyPattern {
  hour: number; // 0 - 23
  label: string; // e.g. "3 PM"
  focusMinutes: number;
  isPeak: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  permissionGranted: boolean;
  peakHourReminderEnabled: boolean;
  peakStartHour: number; // e.g. 15 for 3:00 PM
  peakEndHour: number; // e.g. 18 for 6:00 PM
  reminderOffsetMinutes: number; // 0, 15, or 30 mins before peak
  soundEnabled: boolean;
  lastTriggeredDate?: string;
  customMessage: string;
}

export interface FocusSessionLog {
  id: string;
  subjectId: string;
  durationMinutes: number;
  type: 'focus' | 'shortBreak' | 'longBreak';
  date: string;
}

export interface StudyPlanDay {
  dayNumber: number;
  topicName: string;
  goals: string[];
  estimatedMinutes: number;
  completed?: boolean;
}

export interface StudyPlan {
  planTitle: string;
  subject: string;
  dailySchedule: StudyPlanDay[];
}
