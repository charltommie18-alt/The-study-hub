import React, { useState, useEffect } from 'react';
import { TabType, Subject, Note, Flashcard, QuizQuestion, QuizResult, TutorMessage, GradeLevel, SubscriptionState } from './types';
import { 
  INITIAL_SUBJECTS, 
  INITIAL_NOTES, 
  INITIAL_FLASHCARDS, 
  INITIAL_QUIZ_QUESTIONS, 
  INITIAL_TUTOR_MESSAGES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_GAMIFICATION
} from './data/initialData';

import { loadFromStorage, saveToStorage } from './utils/storage';
import { DEFAULT_NOTIFICATION_SETTINGS, sendBrowserNotification } from './utils/notificationService';
import { PushNotificationSettings } from './types';
import { calculateSpacedRepetition, RepetitionRating } from './utils/spacedRepetition';

import { Navbar } from './components/Navbar';
import { HomeScreenInstallBanner } from './components/HomeScreenInstallBanner';
import { SubjectBar } from './components/SubjectBar';
import { NotesSummarizerTab } from './components/Tabs/NotesSummarizerTab';
import { DocumentUploadTab } from './components/Tabs/DocumentUploadTab';
import { FlashcardsTab } from './components/Tabs/FlashcardsTab';
import { QuizTab } from './components/Tabs/QuizTab';
import { FocusTimerTab } from './components/Tabs/FocusTimerTab';
import { AITutorTab } from './components/Tabs/AITutorTab';
import { AchievementsTab } from './components/Tabs/AchievementsTab';
import { StudyRoomTab } from './components/Tabs/StudyRoomTab';
import { StudyPlannerTab } from './components/Tabs/StudyPlannerTab';
import { AnalyticsTab } from './components/Tabs/AnalyticsTab';
import { AdminDashboardTab } from './components/Tabs/AdminDashboardTab';
import { ExamModeTab } from './components/Tabs/ExamModeTab';
import { AudioPodcastTab } from './components/Tabs/AudioPodcastTab';
import { VisualLabCanvasTab } from './components/Tabs/VisualLabCanvasTab';
import { VoiceNarrationController } from './components/VoiceNarrationController';
import { FloatingStudyTools } from './components/FloatingStudyTools';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';

import { AddSubjectModal } from './components/Modals/AddSubjectModal';
import { GeneratePlanModal } from './components/Modals/GeneratePlanModal';
import { WhatsAppShareModal } from './components/Modals/WhatsAppShareModal';
import { StoreExportModal } from './components/Modals/StoreExportModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { SubscriptionModal } from './components/Modals/SubscriptionModal';
import { InstallAppModal } from './components/Modals/InstallAppModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('notes');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => loadFromStorage('cape_dark_mode', false));
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Subscription state (7-day free trial + monthly plan + Fire OS compatibility)
  const [subscription, setSubscription] = useState<SubscriptionState>(() =>
    loadFromStorage('studyhub_subscription', {
      status: 'free',
      planName: 'Free Standard Plan',
      priceMonthly: 0,
      currency: 'USD',
      isFireOSCompatible: true,
      autoRenew: false,
    })
  );
  
  // Storage state initialization
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(() => loadFromStorage('cape_grade_level', 'grade-12'));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage('cape_subjects', INITIAL_SUBJECTS));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-bio');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage('cape_notes', INITIAL_NOTES));
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => loadFromStorage('cape_flashcards', INITIAL_FLASHCARDS));
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => loadFromStorage('cape_quiz_q', INITIAL_QUIZ_QUESTIONS));
  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => loadFromStorage('cape_quiz_res', []));
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>(() => loadFromStorage('cape_tutor_msg', INITIAL_TUTOR_MESSAGES));

  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => loadFromStorage('cape_focus_mins', 125));
  const [streakDays, setStreakDays] = useState<number>(() => loadFromStorage('cape_streak_days', 5));

  const [achievements, setAchievements] = useState(() => loadFromStorage('cape_achievements', INITIAL_ACHIEVEMENTS));
  const [gamification, setGamification] = useState(() => loadFromStorage('cape_gamification', INITIAL_GAMIFICATION));

  const [notificationSettings, setNotificationSettings] = useState<PushNotificationSettings>(() =>
    loadFromStorage('cape_push_settings', DEFAULT_NOTIFICATION_SETTINGS)
  );
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('⚡ Peak Focus Hour Alert!');
  const [toastMessage, setToastMessage] = useState('');

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState<boolean>(false);
  const [isAddPlanOpen, setIsAddPlanOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);

  // Register online/offline status listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global Power-User Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();

        if (key === 'n') {
          e.preventDefault();
          setActiveTab('notes');
        } else if (key === 'f') {
          e.preventDefault();
          setActiveTab('focus');
        } else if (key === 't') {
          e.preventDefault();
          setActiveTab('tutor');
        } else if (key === 'q') {
          e.preventDefault();
          setActiveTab('quiz');
        } else if (key === 's') {
          e.preventDefault();
          setActiveTab('flashcards');
        } else if (key === 'u') {
          e.preventDefault();
          setActiveTab('upload');
        } else if (key === 'a' && e.shiftKey) {
          e.preventDefault();
          setActiveTab('analytics');
        } else if (key === '/' || key === '?') {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply Dark Mode class to document root and sync to local storage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    saveToStorage('cape_dark_mode', isDarkMode);
  }, [isDarkMode]);

  // Sync state to local storage
  useEffect(() => { saveToStorage('cape_grade_level', currentGrade); }, [currentGrade]);
  useEffect(() => { saveToStorage('cape_subjects', subjects); }, [subjects]);
  useEffect(() => { saveToStorage('cape_notes', notes); }, [notes]);
  useEffect(() => { saveToStorage('cape_flashcards', flashcards); }, [flashcards]);
  useEffect(() => { saveToStorage('cape_quiz_q', quizQuestions); }, [quizQuestions]);
  useEffect(() => { saveToStorage('cape_quiz_res', quizResults); }, [quizResults]);
  useEffect(() => { saveToStorage('cape_tutor_msg', tutorMessages); }, [tutorMessages]);
  useEffect(() => { saveToStorage('cape_focus_mins', totalFocusMinutes); }, [totalFocusMinutes]);
  useEffect(() => { saveToStorage('cape_streak_days', streakDays); }, [streakDays]);
  useEffect(() => { saveToStorage('cape_achievements', achievements); }, [achievements]);
  useEffect(() => { saveToStorage('cape_gamification', gamification); }, [gamification]);
  useEffect(() => { saveToStorage('cape_push_settings', notificationSettings); }, [notificationSettings]);
  useEffect(() => { saveToStorage('studyhub_subscription', subscription); }, [subscription]);

  // Periodic Peak Study Hour Push Notification Checker
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!notificationSettings.enabled || !notificationSettings.peakHourReminderEnabled) return;

      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().slice(0, 10);

      // Trigger if current hour matches peak start hour and hasn't been triggered today
      if (currentHour === notificationSettings.peakStartHour && notificationSettings.lastTriggeredDate !== todayStr) {
        sendBrowserNotification('⚡ Peak Study Hour Alert!', {
          body: notificationSettings.customMessage,
        }, () => setActiveTab('focus'));

        setToastTitle('⚡ Peak Focus Hour Alert!');
        setToastMessage(notificationSettings.customMessage);
        setIsToastOpen(true);

        setNotificationSettings((prev) => ({
          ...prev,
          lastTriggeredDate: todayStr,
        }));
      }
    }, 20000); // Check every 20s

    return () => clearInterval(checkInterval);
  }, [notificationSettings]);

  const handleSendTestNotification = () => {
    sendBrowserNotification(
      '⚡ Test Push Notification - Peak Focus Hour',
      {
        body: notificationSettings.customMessage || 'Your peak study window (3:00 PM - 6:00 PM) is active! Start a Pomodoro sprint.',
      },
      () => setActiveTab('focus')
    );

    setToastTitle('⚡ Test Push Notification Triggered!');
    setToastMessage(notificationSettings.customMessage || 'Your peak focus window (3:00 PM - 6:00 PM) is active! Start a Pomodoro sprint.');
    setIsToastOpen(true);
  };

  const handleClaimXp = (badgeId: string, xpAmount: number) => {
    setAchievements((prev: any[]) =>
      prev.map((a) =>
        a.id === badgeId
          ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString().slice(0, 10) }
          : a
      )
    );
    setGamification((prev: any) => ({
      ...prev,
      xp: prev.xp + xpAmount,
    }));
  };

  // Subject Handlers
  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    setSelectedSubjectId(newSubject.id);
  };

  // Note Handlers
  const handleAddNote = (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]);
    setSubjects((prev) =>
      prev.map((s) => (s.id === newNote.subjectId ? { ...s, notesCount: s.notesCount + 1 } : s))
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleConvertToFlashcards = (noteContent: string, subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveTab('flashcards');
  };

  const handleConvertToQuiz = (noteContent: string, subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveTab('quiz');
  };

  // Flashcard Handlers
  const handleAddFlashcards = (newCards: Flashcard[]) => {
    setFlashcards((prev) => [...newCards, ...prev]);
    if (newCards.length > 0) {
      const targetSubjId = newCards[0].subjectId;
      setSubjects((prev) =>
        prev.map((s) => (s.id === targetSubjId ? { ...s, flashcardsCount: s.flashcardsCount + newCards.length } : s))
      );
    }
  };

  const handleUpdateFlashcardStatus = (cardId: string, status: 'new' | 'learning' | 'mastered') => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status, timesReviewed: c.timesReviewed + 1 } : c))
    );
  };

  const handleUpdateFlashcardSpacedRepetition = (cardId: string, rating: RepetitionRating) => {
    setFlashcards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return calculateSpacedRepetition(c, rating);
        }
        return c;
      })
    );
  };

  const handleDeleteFlashcard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Quiz Handlers
  const handleAddQuizResult = (result: QuizResult) => {
    setQuizResults((prev) => [result, ...prev]);
  };

  const handleUpdateSubjectScore = (subjectId: string, score: number) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          const newProgress = Math.min(100, Math.max(s.progress, score));
          return { ...s, quizScore: score, progress: newProgress };
        }
        return s;
      })
    );
  };

  // Tutor Message Handler
  const handleSendMessage = (msg: TutorMessage) => {
    setTutorMessages((prev) => [...prev, msg]);
  };

  // Focus Session Logger
  const handleLogFocusSession = (minutes: number) => {
    setTotalFocusMinutes((prev) => prev + minutes);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      
      {/* Dynamic 1-Tap Homescreen Install Banner */}
      <HomeScreenInstallBanner onOpenInstallModal={() => setIsInstallOpen(true)} />

      {/* Top Main Navigation Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        currentGrade={currentGrade}
        onSelectGrade={(grade) => setCurrentGrade(grade)}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        onOpenAddPlan={() => setIsAddPlanOpen(true)}
        totalFocusMinutes={totalFocusMinutes}
        streakDays={streakDays}
        isOffline={isOffline}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionOpen(true)}
        onOpenInstallModal={() => setIsInstallOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Workspace Subject Pills Bar */}
      <SubjectBar
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'notes' && (
          <NotesSummarizerTab
            notes={notes}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onConvertToFlashcards={handleConvertToFlashcards}
            onConvertToQuiz={handleConvertToQuiz}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          />
        )}

        {activeTab === 'upload' && (
          <DocumentUploadTab
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            currentGrade={currentGrade}
            onSelectGrade={(g) => setCurrentGrade(g)}
            onAddNote={handleAddNote}
            onAddFlashcards={handleAddFlashcards}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'mockexam' && (
          <ExamModeTab
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            currentGrade={currentGrade}
            onSelectSubject={(id) => setSelectedSubjectId(id)}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          />
        )}

        {activeTab === 'podcast' && (
          <AudioPodcastTab
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            currentGrade={currentGrade}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          />
        )}

        {activeTab === 'canvas' && (
          <VisualLabCanvasTab
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            currentGrade={currentGrade}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsTab
            flashcards={flashcards}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onAddFlashcards={handleAddFlashcards}
            onUpdateFlashcardStatus={handleUpdateFlashcardStatus}
            onUpdateFlashcardSpacedRepetition={handleUpdateFlashcardSpacedRepetition}
            onDeleteFlashcard={handleDeleteFlashcard}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
            onOpenSubscriptionModal={() => setIsSubscriptionOpen(true)}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            quizQuestions={quizQuestions}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onAddQuizResult={handleAddQuizResult}
            onUpdateSubjectScore={handleUpdateSubjectScore}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimerTab
            onLogFocusSession={handleLogFocusSession}
            notificationSettings={notificationSettings}
            onSendTestNotification={handleSendTestNotification}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutorTab
            messages={tutorMessages}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={(id) => setSelectedSubjectId(id)}
            currentGrade={currentGrade}
            onSelectGrade={(grade) => setCurrentGrade(grade)}
            onSendMessage={handleSendMessage}
            onClearMessages={() => {
              setTutorMessages([]);
              saveToStorage('cape_tutor_msg', []);
            }}
            onAddFlashcard={(newCard) => handleAddFlashcards([newCard])}
            onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab
            achievements={achievements}
            gamification={gamification}
            onClaimXp={handleClaimXp}
          />
        )}

        {activeTab === 'studyroom' && (
          <StudyRoomTab
            currentGrade={currentGrade}
            currentSubjectName={currentSubject?.name || 'General Study'}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerTab
            subjects={subjects}
            currentSubjectName={currentSubject?.name || 'General Study'}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            subjects={subjects}
            quizResults={quizResults}
            flashcards={flashcards}
            totalFocusMinutes={totalFocusMinutes}
            streakDays={streakDays}
            notificationSettings={notificationSettings}
            onUpdateNotificationSettings={(s) => setNotificationSettings(s)}
            onSendTestNotification={handleSendTestNotification}
            onStartPomodoro={() => setActiveTab('focus')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardTab onOpenStoreModal={() => setIsStoreModalOpen(true)} />
        )}
      </main>

      {/* Global Application Footer with App Store & Policy Links */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstallModal={() => setIsInstallOpen(true)}
        currentGrade={currentGrade}
        isDarkMode={isDarkMode}
      />

      {/* Interactive Push Notification Toast Alert */}
      <NotificationToast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        onStartFocus={() => setActiveTab('focus')}
        settings={notificationSettings}
        title={toastTitle}
        message={toastMessage}
      />

      {/* Modals */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <GeneratePlanModal
        isOpen={isAddPlanOpen}
        onClose={() => setIsAddPlanOpen(false)}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
      />

      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        subjects={subjects}
        notes={notes}
        flashcards={flashcards}
      />

      <StoreExportModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(newSub) => setSubscription(newSub)}
      />

      <InstallAppModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={(enabled) => setIsDarkMode(enabled)}
        notificationSettings={notificationSettings}
        onUpdateNotificationSettings={(s) => setNotificationSettings(s)}
        currentGrade={currentGrade}
        onSelectGrade={(g) => setCurrentGrade(g)}
        isOffline={isOffline}
        onToggleOffline={(off) => setIsOffline(off)}
        onOpenInstallModal={() => setIsInstallOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Global AI Voice Audio Script Bar with Pause / Resume / Speed */}
      <VoiceNarrationController />

      {/* Floating Study Tools & Companion Widget */}
      <FloatingStudyTools currentSubjectName={currentSubject?.name || 'General Study'} />

    </div>
  );
}
