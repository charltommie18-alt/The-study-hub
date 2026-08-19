import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage, Subject, Flashcard, GradeLevel } from '../../types';
import { GRADE_CONFIGS } from '../../data/initialData';
import { generateOfflineTutorResponse } from '../../utils/offlineAI';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Layers, 
  Copy, 
  Check, 
  Lightbulb, 
  MessageSquare, 
  BrainCircuit, 
  ShieldCheck,
  MessageCircle,
  Mic,
  Volume2,
  VolumeX,
  Gauge,
  Download,
  FileText,
  Smile,
  AlertCircle,
  Target,
  Info,
  WifiOff,
  FolderPlus,
  GraduationCap,
  BookOpen,
  Globe,
  Languages,
  Plus,
  Trash2,
  RotateCcw,
  Radio
} from 'lucide-react';
import { 
  enqueueVoiceTranscript, 
  getVoiceOfflineQueue, 
  clearVoiceOfflineQueue, 
  setupVoiceAutoSync, 
  QueuedVoiceTranscript 
} from '../../utils/voiceOfflineQueue';
import { ProjectExportModal } from '../Modals/ProjectExportModal';
import { 
  SUPPORTED_LANGUAGES, 
  GENDER_VOICES,
  speakTextInLanguage, 
  stopSpeech,
  loadVoiceSettings,
  saveVoiceSettings,
  setVoiceGender,
  validateLanguageCode,
  subscribeSpeechState
} from '../../utils/multilingualSpeech';

interface AITutorTabProps {
  messages: TutorMessage[];
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject?: (subjectId: string) => void;
  currentGrade?: GradeLevel;
  onSelectGrade?: (grade: GradeLevel) => void;
  onSendMessage: (msg: TutorMessage) => void;
  onClearMessages?: () => void;
  onAddFlashcard: (card: Flashcard) => void;
  onOpenWhatsApp?: () => void;
  onOpenAddSubject?: () => void;
}

export const AITutorTab: React.FC<AITutorTabProps> = ({
  messages,
  subjects,
  selectedSubjectId,
  onSelectSubject,
  currentGrade,
  onSelectGrade,
  onSendMessage,
  onClearMessages,
  onAddFlashcard,
  onOpenWhatsApp,
  onOpenAddSubject,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('Socratic Mentor');
  const [selectedTone, setSelectedTone] = useState<string>('Encouraging');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Auto Voice Talk-Back State (automatically speaks AI responses out loud)
  const [autoVoiceReplies, setAutoVoiceReplies] = useState<boolean>(() =>
    loadFromStorage('cape_auto_voice_reply', true)
  );

  // Dictation Language Mode ('auto', 'af-ZA', 'en-ZA')
  const [dictationLanguage, setDictationLanguage] = useState<string>('auto');

  // Instant Translator Modal/Box State
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [translatorInput, setTranslatorInput] = useState('');
  const [translatorResult, setTranslatorResult] = useState('');
  const [isTranslatingBox, setIsTranslatingBox] = useState(false);

  // Blue Info Popup & Project Export Modal States
  const [isBlueInfoPopupOpen, setIsBlueInfoPopupOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [offlineVoiceQueue, setOfflineVoiceQueue] = useState<QueuedVoiceTranscript[]>(() => getVoiceOfflineQueue());
  
  // Multilingual Voice & Speech State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('af-ZA'); // Afrikaans by default
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);
  const [activeVoiceGender, setActiveVoiceGender] = useState<'male' | 'female'>(() => loadVoiceSettings().voiceGender || 'male');

  useEffect(() => {
    saveToStorage('cape_auto_voice_reply', autoVoiceReplies);
  }, [autoVoiceReplies]);

  useEffect(() => {
    const unsub = subscribeSpeechState((st) => {
      const settings = loadVoiceSettings();
      setActiveVoiceGender(settings.voiceGender || 'male');
    });
    return () => unsub();
  }, []);

  // Sync & Reactive state for Offline Voice Queue
  useEffect(() => {
    const handleQueueUpdate = () => {
      setOfflineVoiceQueue(getVoiceOfflineQueue());
    };

    window.addEventListener('studyhub_voice_queue_updated', handleQueueUpdate);

    // Auto-sync listener when network connection restores
    const cleanupSync = setupVoiceAutoSync((items) => {
      if (items.length > 0) {
        items.forEach((item) => {
          const userMsg: TutorMessage = {
            id: `usr-v-sync-${Date.now()}-${Math.random()}`,
            role: 'user',
            text: `[Voice Auto-Synced]: ${item.transcript}`,
            timestamp: item.timestamp,
          };
          onSendMessage(userMsg);
        });
        clearVoiceOfflineQueue();
        setOfflineVoiceQueue([]);
      }
    });

    return () => {
      window.removeEventListener('studyhub_voice_queue_updated', handleQueueUpdate);
      cleanupSync();
    };
  }, [onSendMessage]);

  const tones = [
    { id: 'Encouraging', label: 'Encouraging & Patient', desc: 'Positive reinforcement & supportive guidance', icon: Smile },
    { id: 'Socratic', label: 'Socratic & Inquisitive', desc: 'Asks probing questions to spark discovery', icon: BrainCircuit },
    { id: 'Strict', label: 'Strict & Disciplined', desc: 'Direct, no-nonsense, demands precision', icon: AlertCircle },
    { id: 'Exam Coach', label: 'Exam Prep Coach', desc: 'Focuses on high-yield exam traps & scoring', icon: Target },
  ];

  const handleExportSession = () => {
    if (messages.length === 0) {
      alert('No chat session messages to export yet. Ask StudyBot a question first!');
      return;
    }

    const currentSubjectName = currentSubject?.name || 'General Studies';
    const content = [
      `# StudyHub AI Tutor Session Transcript`,
      `**Subject:** ${currentSubjectName}`,
      `**Date:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      `**AI Tutor Tone:** ${selectedTone} | **Persona:** ${selectedPersona}`,
      `\n---\n`,
      ...messages.map((m) => {
        const sender = m.role === 'user' ? '👤 Student' : `🤖 StudyBot (${m.persona || selectedPersona})`;
        return `### ${sender} [${m.timestamp}]\n${m.text}\n`;
      })
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyHub_${currentSubjectName.replace(/\s+/g, '_')}_Tutor_Session_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);
  const isUserMicActiveRef = useRef(false);
  const baseInputRef = useRef('');

  // Clean up active speech synthesis and recognition when unmounting
  useEffect(() => {
    return () => {
      stopSpeech();
      isUserMicActiveRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleStartVoice = () => {
    if (isListening || isUserMicActiveRef.current) {
      isUserMicActiveRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      baseInputRef.current = inputText.trim();
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Determine speech recognition language based on dictation mode or active language
      let targetLang = 'af-ZA';
      if (dictationLanguage === 'en-ZA' || dictationLanguage === 'en-US') {
        targetLang = dictationLanguage;
      } else if (dictationLanguage === 'af-ZA') {
        targetLang = 'af-ZA';
      } else {
        targetLang = validateLanguageCode(selectedLanguage || 'af-ZA');
      }

      recognition.lang = targetLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      isUserMicActiveRef.current = true;

      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        let sessionFinalAcc = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            sessionFinalAcc += item[0].transcript + ' ';
          } else {
            sessionInterim += item[0].transcript;
          }
        }

        const spoken = (sessionFinalAcc + sessionInterim).replace(/\s+/g, ' ').trim();
        if (spoken) {
          const base = baseInputRef.current;
          setInputText(base ? `${base} ${spoken}` : spoken);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition status:', err?.error);
        if (err?.error === 'not-allowed' || err?.error === 'service-not-allowed') {
          isUserMicActiveRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If user still wants to dictate, restart seamlessly
        if (isUserMicActiveRef.current) {
          setTimeout(() => {
            if (isUserMicActiveRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.warn('Auto-restart recognition exception:', e);
              }
            }
          }, 150);
          return;
        }
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition exception:', e);
      isUserMicActiveRef.current = false;
      setIsListening(false);
    }
  };

  // Multilingual Speech Synthesis & Talk-Back Handler
  const handleToggleListen = (msgId: string, text: string, langCode: string = selectedLanguage) => {
    // If already speaking this message, cancel/stop it
    if (speakingMsgId === msgId) {
      stopSpeech();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    speakTextInLanguage(
      text,
      langCode,
      () => setSpeakingMsgId(msgId),
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null),
      speechRate
    );
  };

  // AI Translate & Read Aloud in Selected Language
  const handleTranslateAndTalkBack = async (msgId: string, text: string) => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
    setTranslatingMsgId(msgId);

    try {
      const response = await fetch('/api/translate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: langObj.name,
          sourceLanguage: 'Auto-Detect',
          subject: currentSubject?.name || 'General',
        }),
      });

      const data = await response.json();
      const translated = data.translatedText || text;

      // Speak back the translated text in the target language (e.g. Afrikaans)
      handleToggleListen(msgId, translated, selectedLanguage);
    } catch (e) {
      console.warn('Translation warning, falling back to direct voice read:', e);
      handleToggleListen(msgId, text, selectedLanguage);
    } finally {
      setTranslatingMsgId(null);
    }
  };

  // Instant Translator Tool Handler
  const handleRunTranslatorBox = async () => {
    if (!translatorInput.trim()) return;
    setIsTranslatingBox(true);
    setTranslatorResult('');
    try {
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
      const response = await fetch('/api/translate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translatorInput,
          targetLanguage: langObj.name,
          sourceLanguage: 'Auto-Detect',
          subject: currentSubject?.name || 'General',
        }),
      });
      const data = await response.json();
      setTranslatorResult(data.translatedText || 'Unable to complete translation.');
    } catch (e) {
      setTranslatorResult('Error performing translation.');
    } finally {
      setIsTranslatingBox(false);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const personas = [
    { name: 'Socratic Mentor', desc: 'Asks guiding questions to help you discover solutions.' },
    { name: 'ELI5 (Explain Like I\'m 5)', desc: 'Uses simple analogies and zero complex jargon.' },
    { name: 'Exam Coach', desc: 'Focuses on high-yield exam patterns and scoring traps.' },
    { name: 'Concept Dissector', desc: 'Breaks complex topics into step-by-step logical bullet points.' },
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    // Turn off active microphone immediately upon sending
    const wasUsingVoice = isListening || isUserMicActiveRef.current;
    isUserMicActiveRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);

    const userMsg: TutorMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSendMessage(userMsg);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      if (!navigator.onLine) {
        throw new Error('Offline mode - answering with Offline AI Engine');
      }

      const res = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversationHistory: messages.map((m) => ({ role: m.role, text: m.text })),
          subject: currentSubject?.name || 'General Studies',
          persona: selectedPersona,
          tone: selectedTone,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get tutor reply');

      const botMsg: TutorMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || (selectedLanguage.startsWith('af') ? 'Ek verduidelik met graagte hierdie konsep verder!' : 'I am happy to explain this concept further!'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: data.suggestedFollowups || [],
        persona: `${selectedPersona} • ${selectedTone} Tone`,
      };

      onSendMessage(botMsg);

      // If user used voice dictation or Auto Voice Replies is enabled, speak response out loud immediately!
      if (wasUsingVoice || autoVoiceReplies) {
        setTimeout(() => {
          handleToggleListen(botMsg.id, botMsg.text, selectedLanguage);
        }, 100);
      }
    } catch (err: any) {
      console.warn('API error or offline mode, fallback to Offline AI Engine:', err);
      const offlineReply = generateOfflineTutorResponse(
        textToSend.trim(),
        currentSubject?.name || 'General Studies',
        selectedPersona,
        selectedLanguage
      );

      const botMsg: TutorMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: offlineReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: offlineReply.suggestedFollowups,
        persona: `${selectedPersona} (Offline Engine)`,
      };

      onSendMessage(botMsg);

      if (wasUsingVoice || autoVoiceReplies) {
        setTimeout(() => {
          handleToggleListen(botMsg.id, botMsg.text, selectedLanguage);
        }, 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFlashcardFromMessage = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const question = lines[0]?.slice(0, 100) || `Key Insight for ${currentSubject?.name}`;
    const answer = lines.slice(1, 4).join(' ') || text.slice(0, 200);

    const newCard: Flashcard = {
      id: `fc-tutor-${Date.now()}`,
      subjectId: selectedSubjectId,
      question: `[Tutor Note] ${question.replace(/^#+|\*+/g, '')}`,
      answer: answer.replace(/\*+/g, ''),
      category: currentSubject?.name || 'General',
      difficulty: 'medium',
      hint: 'Saved directly from AI Tutor chat',
      status: 'new',
      timesReviewed: 0,
    };

    onAddFlashcard(newCard);
    alert('Key insight saved as a new Flashcard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-[#EBE7DF] border border-[#D9D1C7] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2EFE3] border border-[#C5DCC6] rounded-full text-[#5A6D5B] text-xs font-semibold">
                <BrainCircuit className="w-3.5 h-3.5 text-[#5A6D5B]" />
                <span>Personal 24/7 AI Academic Mentor</span>
              </div>

              {/* Blue Info Pop-up Icon Button */}
              <button
                type="button"
                onClick={() => setIsBlueInfoPopupOpen(!isBlueInfoPopupOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer relative ${
                  isBlueInfoPopupOpen
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                title="Click blue info icon to open curriculum & system info pop-up"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Curriculum Info</span>
                {offlineVoiceQueue.length > 0 && (
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                )}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              Interactive AI Study Tutor & Project Hub
            </h1>
            <p className="text-[#7A746B] text-sm mt-1 max-w-2xl">
              All grades K-12 to University/Ph.D., curriculum standards, past test papers, offline voice queue, and school project export mandates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Clear Chat Button */}
            {onClearMessages && messages.length > 0 && (
              <button
                onClick={() => setIsClearConfirmOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold text-xs rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Clear previous chat messages and start fresh"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>{selectedLanguage.startsWith('af') ? 'Vee Klets Uit' : 'Clear Chat'}</span>
              </button>
            )}

            {/* School & University Project Hub Button */}
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              title="Setup & Export School or University Final Projects"
            >
              <FolderPlus className="w-4 h-4 text-blue-200" />
              <span>Project Export Hub</span>
            </button>

            <button
              onClick={handleExportSession}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              title="Export complete session transcript as Markdown file"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Export Session</span>
            </button>

            {onOpenWhatsApp && (
              <button
                onClick={onOpenWhatsApp}
                className="px-4 py-2 bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#5A6D5B] font-semibold text-xs rounded-full border border-[#C5DCC6] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Share AI Tutor Q&A on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-[#5A6D5B]/20" />
                <span>WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        {isClearConfirmOpen && (
          <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200 font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                {selectedLanguage.startsWith('af')
                  ? 'Is jy seker jy wil alle vorige kletsboodskappe uitvee en van voor af begin?'
                  : 'Are you sure you want to clear all previous chat messages and start fresh?'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 cursor-pointer"
              >
                {selectedLanguage.startsWith('af') ? 'Kanselleer' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  stopSpeech();
                  setSpeakingMsgId(null);
                  onClearMessages?.();
                  setIsClearConfirmOpen(false);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{selectedLanguage.startsWith('af') ? 'Ja, Vee Uit' : 'Yes, Clear All'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Blue Info Pop-up Overlay Card */}
        {isBlueInfoPopupOpen && (
          <div className="mt-4 p-4 bg-blue-900 text-white rounded-2xl border border-blue-700 shadow-xl space-y-3 animate-in fade-in duration-200 relative z-20">
            <div className="flex items-center justify-between border-b border-blue-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-blue-200 text-sm">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Universal Grade Curriculum & Knowledge System Info</span>
              </div>
              <button
                onClick={() => setIsBlueInfoPopupOpen(false)}
                className="px-2.5 py-1 bg-blue-950 hover:bg-blue-800 text-blue-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Pop-up
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-950/80 rounded-xl border border-blue-800 space-y-1">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>All Grades & Curriculum</span>
                </div>
                <p className="text-blue-100 text-[11px] leading-relaxed">
                  Covers Elementary, Middle, High School, AP/IB, Undergraduate, and Master's/Ph.D. degree mandates with grade-appropriate standards.
                </p>
              </div>

              <div className="p-3 bg-blue-950/80 rounded-xl border border-blue-800 space-y-1">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Past Test Papers & Marking</span>
                </div>
                <p className="text-blue-100 text-[11px] leading-relaxed">
                  AI is trained on high-yield exam patterns, past question papers, marking schemes, and step-by-step problem solutions.
                </p>
              </div>

              <div className="p-3 bg-blue-950/80 rounded-xl border border-blue-800 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span>Offline Voice Queue</span>
                </div>
                <p className="text-blue-100 text-[11px] leading-relaxed">
                  {offlineVoiceQueue.length === 0
                    ? 'Offline voice transcripts automatically queue when offline and auto-sync when online.'
                    : `${offlineVoiceQueue.length} transcript(s) stored in local offline queue ready for sync.`}
                </p>
                {offlineVoiceQueue.length > 0 && (
                  <button
                    onClick={() => {
                      if (navigator.onLine) {
                        offlineVoiceQueue.forEach((item) => {
                          onSendMessage({
                            id: `usr-sync-${Date.now()}-${Math.random()}`,
                            role: 'user',
                            text: `[Voice Auto-Synced]: ${item.transcript}`,
                            timestamp: item.timestamp,
                          });
                        });
                        clearVoiceOfflineQueue();
                        setOfflineVoiceQueue([]);
                        alert('Synced offline voice queue!');
                      } else {
                        alert('Still offline. Will auto-sync as soon as connection is re-established.');
                      }
                    }}
                    className="mt-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Sync Voice Queue Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject, Grade & Instant Translator Header Bar */}
      <div className="bg-[#F4F1EA] dark:bg-[#18221A] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subject & Grade Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white dark:bg-[#101711] border border-[#D9D1C7] dark:border-[#2F3E31] px-3 py-1.5 rounded-xl shadow-2xs">
              <BookOpen className="w-4 h-4 text-[#5A6D5B] dark:text-[#9EC49F]" />
              <span className="text-xs font-bold text-[#7A746B] dark:text-[#A2B5A3]">Active Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => onSelectSubject && onSelectSubject(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-extrabold text-[#2D362E] dark:text-[#E2EFE3] focus:outline-none cursor-pointer pr-2"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-[#1A231C] text-[#2D362E] dark:text-[#E2EFE3]">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              {onOpenAddSubject && (
                <button
                  type="button"
                  onClick={onOpenAddSubject}
                  className="p-1 hover:bg-[#EBE7DF] dark:hover:bg-[#2A372C] text-[#5A6D5B] dark:text-[#9EC49F] rounded-lg transition-colors cursor-pointer"
                  title="Add Custom Subject"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grade Selector */}
            {currentGrade && onSelectGrade && (
              <div className="flex items-center gap-2 bg-white dark:bg-[#101711] border border-[#D9D1C7] dark:border-[#2F3E31] px-3 py-1.5 rounded-xl shadow-2xs">
                <GraduationCap className="w-4 h-4 text-[#5A6D5B] dark:text-[#9EC49F]" />
                <span className="text-xs font-bold text-[#7A746B] dark:text-[#A2B5A3]">Grade:</span>
                <select
                  value={currentGrade}
                  onChange={(e) => onSelectGrade(e.target.value as GradeLevel)}
                  className="bg-transparent text-xs sm:text-sm font-extrabold text-[#2D362E] dark:text-[#E2EFE3] focus:outline-none cursor-pointer"
                >
                  {GRADE_CONFIGS.map((g) => (
                    <option key={g.id} value={g.id} className="bg-white dark:bg-[#1A231C] text-[#2D362E] dark:text-[#E2EFE3]">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Instant Language Translation & Voice Controls Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#101711] border border-[#D9D1C7] dark:border-[#2F3E31] px-3 py-1.5 rounded-xl shadow-2xs">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-[#7A746B] dark:text-[#A2B5A3]">Taal:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#2D362E] dark:text-[#E2EFE3] focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Dedicated Voice Gender Selector (1 Voice for Men & 1 Voice for Women) */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#101711] border border-[#D9D1C7] dark:border-[#2F3E31] p-1 rounded-xl shadow-2xs">
              <span className="text-xs font-bold text-[#7A746B] dark:text-[#A2B5A3] px-1.5">🎙️ Stem:</span>
              <button
                type="button"
                onClick={() => {
                  setActiveVoiceGender('male');
                  setVoiceGender('male');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeVoiceGender === 'male'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#2D362E] dark:text-[#E2EFE3] hover:bg-gray-100 dark:hover:bg-[#1E2A20]'
                }`}
                title="Kies Afrikaanse Manlike Stem (Man)"
              >
                <span>👨 Manlik</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveVoiceGender('female');
                  setVoiceGender('female');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeVoiceGender === 'female'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#2D362E] dark:text-[#E2EFE3] hover:bg-gray-100 dark:hover:bg-[#1E2A20]'
                }`}
                title="Kies Afrikaanse Vroulike Stem (Vrou)"
              >
                <span>👩 Vroulik</span>
              </button>
            </div>

            {/* Auto Voice Replies Toggle */}
            <button
              type="button"
              onClick={() => setAutoVoiceReplies(!autoVoiceReplies)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                autoVoiceReplies
                  ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400/30'
                  : 'bg-white dark:bg-[#101711] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50'
              }`}
              title="Automatically read StudyBot's replies out loud"
            >
              <Radio className={`w-3.5 h-3.5 ${autoVoiceReplies ? 'animate-pulse text-emerald-200' : 'text-gray-400'}`} />
              <span>{autoVoiceReplies ? '🔊 Auto-Stem Aan' : '🔇 Auto-Stem Af'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTranslatorOpen(!isTranslatorOpen)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Open Instant Multilingual Translator Tool"
            >
              <Languages className="w-4 h-4 text-blue-200" />
              <span>{isTranslatorOpen ? 'Maak Vertaler Toe' : 'Vertaal- & Woordeboek'}</span>
            </button>
          </div>
        </div>

        {/* Instant Translation Slide-Down Box */}
        {isTranslatorOpen && (
          <div className="mt-3 p-4 bg-white dark:bg-[#101711] border border-blue-200 dark:border-blue-900 rounded-2xl shadow-md space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-200">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Blits-Vertaler & Term-Woordeboek ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag} {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTranslatorOpen(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                ✕ Maak Toe
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                    Teks of Vraag om te Vertaal:
                  </label>
                  {translatorInput && (
                    <button
                      type="button"
                      onClick={() => setTranslatorInput('')}
                      className="text-[10px] text-red-500 hover:underline cursor-pointer"
                    >
                      Maak skoon
                    </button>
                  )}
                </div>
                <textarea
                  value={translatorInput}
                  onChange={(e) => setTranslatorInput(e.target.value)}
                  placeholder="Tik of plak enige Afrikaans/Engels teks, eksamenvraag of vakbegrip hier..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-[#F9F7F2] dark:bg-[#1A231C] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunTranslatorBox}
                    disabled={isTranslatingBox || !translatorInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>{isTranslatingBox ? 'Vertaal tans...' : `Vertaal na ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Vertaalde Resultaat ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}):
                </label>
                <div className="p-3 min-h-[80px] bg-[#F4F1EA] dark:bg-[#18221A] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {translatorResult || (
                    <span className="text-gray-400 italic">
                      Vertaalde teks sal hier verskyn met direkte Afrikaanse/meertalige uitspraak...
                    </span>
                  )}
                </div>
                {translatorResult && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakTextInLanguage(translatorResult, selectedLanguage)}
                      className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Luister Hardop</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInputText(translatorResult);
                        setIsTranslatorOpen(false);
                      }}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 text-blue-900 dark:text-blue-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Stuur na Klets Invoerveld</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Tutor Tone & Persona Selector Bar */}
      <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-sm space-y-4">
        
        {/* Tone Selector Row */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C857A] block mb-2">
            🎭 Select AI Tutor Tone / Teaching Style:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {tones.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTone === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTone(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-600 text-emerald-900 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#7A746B] hover:text-[#2D362E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#7A746B]'}`} />
                  <div>
                    <h4 className="font-bold text-xs text-[#2D362E] dark:text-[#F4F1EA]">{t.label}</h4>
                    <p className="text-[11px] text-[#7A746B] mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Switcher Row */}
        <div className="pt-2 border-t border-[#EBE7DF]">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C857A] block mb-2">
            🧠 Select AI Academic Persona:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {personas.map((p) => {
              const isSelected = selectedPersona === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPersona(p.name)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E2EFE3] border-[#5A6D5B] text-[#2D362E] shadow-sm font-bold'
                      : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#7A746B] hover:text-[#2D362E]'
                  }`}
                >
                  <h4 className="font-bold text-xs text-[#5A6D5B]">{p.name}</h4>
                  <p className="text-[11px] text-[#7A746B] mt-0.5 line-clamp-1">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-4 sm:p-6 shadow-sm flex flex-col h-[520px]">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                    isUser
                      ? 'bg-[#5A6D5B]'
                      : 'bg-[#B87D4B]'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#5A6D5B] border-[#4A5D4B] text-white shadow-sm'
                      : 'bg-[#F9F7F2] border-[#EBE7DF] text-[#3C3C3B] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-1.5 text-[10px] opacity-80">
                    <span className="font-bold">
                      {isUser ? 'You' : `StudyBot (${msg.persona || selectedPersona})`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

                  {/* AI Assistant Toolbar & Suggested Followups */}
                  {!isUser && (
                    <div className="pt-2 border-t border-[#EBE7DF] dark:border-[#2C3B2E] space-y-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-[#7A746B] dark:text-[#A6C4A7]">
                        
                        {/* Prominent Listen Button */}
                        <button
                          onClick={() => handleToggleListen(msg.id, msg.text)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            speakingMsgId === msg.id
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-md'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          }`}
                          title={speakingMsgId === msg.id ? 'Klik om te stop' : 'Luister hardop na hierdie antwoord'}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-white" />
                              <span>{selectedLanguage.startsWith('af') ? 'Stop Luister' : 'Stop Listening'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                              <span>{selectedLanguage.startsWith('af') ? 'Luister (Manlik)' : 'Listen'}</span>
                            </>
                          )}
                        </button>

                        {/* Translate & Talk Back in Selected Language */}
                        <button
                          onClick={() => handleTranslateAndTalkBack(msg.id, msg.text)}
                          disabled={translatingMsgId === msg.id}
                          className="px-2.5 py-1.5 bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Translate AI response to active target language and speak back"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{translatingMsgId === msg.id ? 'Vertaal...' : `Vertaal & Praat (${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag || '🇿🇦'})`}</span>
                        </button>

                        {/* Speech Speed Selector */}
                        <div className="flex items-center gap-1 bg-[#EBE7DF] dark:bg-[#1A231C] px-2 py-1 rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31]">
                          <Gauge className="w-3 h-3 text-[#7A746B] dark:text-[#A6C4A7]" />
                          <select
                            value={speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                            className="bg-transparent text-[10px] font-bold text-[#3C3C3B] dark:text-[#F4F1EA] focus:outline-none cursor-pointer"
                            title="Adjust Speech Rate Speed"
                          >
                            <option value={0.8} className="bg-white dark:bg-[#1A231C]">0.8x</option>
                            <option value={1.0} className="bg-white dark:bg-[#1A231C]">1.0x</option>
                            <option value={1.25} className="bg-white dark:bg-[#1A231C]">1.25x</option>
                            <option value={1.5} className="bg-white dark:bg-[#1A231C]">1.5x</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleCreateFlashcardFromMessage(msg.text)}
                          className="text-[#5A6D5B] dark:text-emerald-300 hover:underline flex items-center gap-1 font-bold cursor-pointer ml-auto sm:ml-0"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#5A6D5B] dark:text-emerald-300" />
                          <span>{selectedLanguage.startsWith('af') ? 'Stoor Flitskaart' : 'Save Flashcard'}</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-[#8C857A] dark:text-[#B5AEA3] hover:text-[#2D362E] dark:hover:text-white flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Gekopieer' : 'Kopieer'}</span>
                        </button>
                      </div>

                      {/* Follow-up chips */}
                      {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedFollowups.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(chip)}
                              className="px-2.5 py-1 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#5A6D5B] border border-[#D9D1C7] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              💬 {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-9 h-9 rounded-xl bg-[#B87D4B] flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 bg-[#F9F7F2] border border-[#EBE7DF] rounded-2xl text-xs text-[#7A746B] flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#5A6D5B]/30 border-t-[#5A6D5B] rounded-full animate-spin" />
                <span>{selectedLanguage.startsWith('af') ? 'StudyBot dink en genereer Afrikaanse antwoord...' : 'StudyBot is reasoning and generating response...'}</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Starter Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-[#EBE7DF] mt-2">
          <span className="text-[10px] font-bold uppercase text-[#8C857A] shrink-0">
            {selectedLanguage.startsWith('af') ? 'Vinnige Vrae:' : 'Quick Prompts:'}
          </span>
          {(selectedLanguage.startsWith('af') ? [
            `Verduidelik ${currentSubject?.name || 'hierdie onderwerp'} met 'n eenvoudige voorbeeld`,
            'Gee my 3 hoë-waarde eksamenwenke vir my toets',
            'Breek die kernformule en stappe logies af',
            'Toets my begrip met \'n vinnige vraag',
          ] : [
            `Explain ${currentSubject?.name || 'this topic'} with a real-world analogy`,
            'Give me 3 high-yield exam tips for my test',
            'Break down the core formula step-by-step',
            'Test me with a quick Socratic question',
          ]).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-[#F9F7F2] border border-[#D9D1C7] hover:border-[#5A6D5B] text-[#2D362E] rounded-full text-[11px] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              ✨ {prompt}
            </button>
          ))}
        </div>

        {/* Multilingual Voice & Dictation Control Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#EBE7DF]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-[#8C857A]">
                AI Reply Language:
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1 bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-xl text-xs font-bold text-[#2C352E] dark:text-[#E2EFE3] cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Dictation Speech-to-Text Language Selection */}
            <div className="flex items-center gap-1 bg-[#F9F7F2] dark:bg-[#1A231C] px-2.5 py-1 rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31]">
              <Mic className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] font-bold text-[#7A746B] dark:text-[#A6C4A7]">
                Praat-Taal (STT):
              </span>
              <select
                value={dictationLanguage}
                onChange={(e) => setDictationLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#2D362E] dark:text-[#E2EFE3] focus:outline-none cursor-pointer"
                title="Select language for microphone speech-to-text"
              >
                <option value="auto">🌐 Outomaties ({selectedLanguage.startsWith('af') ? 'Afrikaans' : 'English'})</option>
                <option value="af-ZA">🇿🇦 Afrikaans (af-ZA)</option>
                <option value="en-ZA">🇿🇦 English (South Africa)</option>
                <option value="en-US">🇺🇸 English (US)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isListening && (
              <span className="text-[11px] font-bold text-rose-600 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{selectedLanguage.startsWith('af') ? 'Mikrofoon luister... praat nou' : 'Mic is listening... speak now'}</span>
              </span>
            )}
            <span className="text-[10px] font-semibold text-[#7A746B] hidden md:inline">
              🎤 Voice & AI in <strong className="text-blue-700 dark:text-blue-300">{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}</strong>
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 pt-2">
          <textarea
            rows={1}
            placeholder={isListening ? (selectedLanguage.startsWith('af') ? '🎤 Mikrofoon luister... praat nou' : '🎤 Listening to your voice input... speak now') : `Ask StudyBot anything about ${currentSubject?.name || 'your studies'}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className={`flex-1 bg-[#F9F7F2] border rounded-2xl px-4 py-3 text-xs text-[#2D362E] placeholder-[#8C857A] focus:outline-none transition-all resize-none leading-relaxed ${
              isListening ? 'border-rose-500 bg-rose-50 text-rose-900 font-semibold shadow-sm' : 'border-[#D9D1C7] focus:border-[#5A6D5B]'
            }`}
          />

          {/* Voice Microphone Dictation */}
          <button
            type="button"
            onClick={handleStartVoice}
            className={`p-3 rounded-2xl border font-bold transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md ring-2 ring-rose-400/50'
                : 'bg-[#F2EFE9] text-[#5A6D5B] border-[#D9D1C7] hover:bg-[#EBE7DF]'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak Question (Voice Dictation)'}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'text-white' : ''}`} />
          </button>

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className="px-5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Project Export Modal */}
      <ProjectExportModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentSubjectName={currentSubject?.name}
      />

    </div>
  );
};
