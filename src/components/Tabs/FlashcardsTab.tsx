import React, { useState, useEffect } from 'react';
import { Flashcard, Subject } from '../../types';
import { generateOfflineFlashcards } from '../../utils/offlineAI';
import { 
  calculateSpacedRepetition, 
  isCardDueForReview, 
  getDueStatusLabel, 
  RepetitionRating 
} from '../../utils/spacedRepetition';
import { 
  Sparkles, 
  RotateCw, 
  Check, 
  X, 
  Star, 
  Volume2, 
  VolumeX, 
  Play, 
  Plus, 
  Layers, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Mic,
  MicOff,
  Flame,
  Clock,
  Tv,
  Tablet,
  Zap,
  Target
} from 'lucide-react';

interface FlashcardsTabProps {
  flashcards: Flashcard[];
  subjects: Subject[];
  selectedSubjectId: string;
  onAddFlashcards: (cards: Flashcard[]) => void;
  onUpdateFlashcardStatus: (cardId: string, status: 'new' | 'learning' | 'mastered') => void;
  onUpdateFlashcardSpacedRepetition?: (cardId: string, rating: RepetitionRating) => void;
  onDeleteFlashcard: (cardId: string) => void;
  onOpenWhatsApp?: () => void;
  onOpenSubscriptionModal?: () => void;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  flashcards,
  subjects,
  selectedSubjectId,
  onAddFlashcards,
  onUpdateFlashcardStatus,
  onUpdateFlashcardSpacedRepetition,
  onDeleteFlashcard,
  onOpenWhatsApp,
  onOpenSubscriptionModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('due');
  const [isDrillMode, setIsDrillMode] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Voice Input State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceMatchScore, setVoiceMatchScore] = useState<number | null>(null);

  // Generator modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState(6);
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [isDictatingTopic, setIsDictatingTopic] = useState(false);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  const subjectCards = flashcards.filter(
    (fc) => fc.subjectId === selectedSubjectId || selectedSubjectId === 'all'
  );

  // Filter Cards (Support 'due' filter for Spaced Repetition queue)
  const filteredCards = subjectCards.filter((fc) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'due') return isCardDueForReview(fc);
    return fc.status === filterStatus;
  });

  const activeDrillCard = filteredCards[drillIndex] || filteredCards[0];

  // D-Pad / Remote Control Keyboard listeners for Fire TV / Fire Tablet compatibility
  useEffect(() => {
    if (!isDrillMode || !activeDrillCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevDrillCard();
      } else if (e.key === 'ArrowRight') {
        nextDrillCard();
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard('again');
        if (e.key === '2') handleRateCard('hard');
        if (e.key === '3') handleRateCard('good');
        if (e.key === '4') handleRateCard('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrillMode, activeDrillCard, isFlipped, drillIndex]);

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speaking) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Input Dictation for Active Recall Answering
  const handleStartVoiceRecall = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceActive(true);
      setVoiceTranscript('');
      setVoiceMatchScore(null);
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setVoiceTranscript(current);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsVoiceActive(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.start();
  };

  // Evaluate Active Recall Match Score
  const handleEvaluateVoiceRecall = () => {
    if (!activeDrillCard || !voiceTranscript.trim()) return;

    const actualAnswer = activeDrillCard.answer.toLowerCase();
    const spokenAnswer = voiceTranscript.toLowerCase();

    // Word token match ratio
    const spokenWords = spokenAnswer.split(/\s+/);
    let matchedCount = 0;

    spokenWords.forEach((w) => {
      if (w.length > 2 && actualAnswer.includes(w)) {
        matchedCount++;
      }
    });

    const score = Math.min(100, Math.round((matchedCount / Math.max(1, spokenWords.length)) * 100));
    setVoiceMatchScore(score);
    setIsFlipped(true); // Automatically flip card to reveal full answer
  };

  // Voice Dictation for Generator Modal Topic Input
  const handleStartDictateTopic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsDictatingTopic(true);

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setGenTopic((prev) => (prev ? prev + ' ' + text : text));
    };

    recognition.onend = () => setIsDictatingTopic(false);
    recognition.start();
  };

  const handleRateCard = (rating: RepetitionRating) => {
    if (!activeDrillCard) return;

    if (onUpdateFlashcardSpacedRepetition) {
      onUpdateFlashcardSpacedRepetition(activeDrillCard.id, rating);
    } else {
      const statusMap: Record<RepetitionRating, 'learning' | 'mastered'> = {
        again: 'learning',
        hard: 'learning',
        good: 'learning',
        easy: 'mastered',
      };
      onUpdateFlashcardStatus(activeDrillCard.id, statusMap[rating]);
    }

    nextDrillCard();
  };

  const handleGenerateCards = async () => {
    if (!genTopic.trim()) {
      setGenError('Please enter a topic or concept for flashcards.');
      return;
    }
    setGenError('');
    setIsGenerating(true);

    try {
      if (!navigator.onLine) {
        throw new Error('Offline mode - generating cards with Offline AI Engine');
      }

      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: genTopic,
          subject: currentSubject?.name || 'General',
          count: genCount,
          difficulty: genDifficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate flashcards.');

      const newCards: Flashcard[] = (data.flashcards || []).map((fc: any, idx: number) => ({
        id: `fc-${Date.now()}-${idx}`,
        subjectId: selectedSubjectId,
        question: fc.question,
        answer: fc.answer,
        category: fc.category || currentSubject?.name || 'General',
        difficulty: fc.difficulty || genDifficulty,
        hint: fc.hint || '',
        status: 'new',
        timesReviewed: 0,
      }));

      onAddFlashcards(newCards);
      setShowGenModal(false);
      setGenTopic('');
    } catch (err: any) {
      console.warn('API or network offline, fallback to Offline AI Engine:', err);
      const offlineCardsData = generateOfflineFlashcards(genTopic, currentSubject?.name || 'General', genCount);
      const newCards: Flashcard[] = offlineCardsData.map((fc, idx) => ({
        id: `fc-off-${Date.now()}-${idx}`,
        subjectId: selectedSubjectId,
        question: fc.question,
        answer: fc.answer,
        category: fc.category,
        difficulty: fc.difficulty,
        hint: fc.hint,
        status: 'new',
        timesReviewed: 0,
      }));

      onAddFlashcards(newCards);
      setShowGenModal(false);
      setGenTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextDrillCard = () => {
    setIsFlipped(false);
    setShowHint(false);
    setVoiceTranscript('');
    setVoiceMatchScore(null);
    if (drillIndex < filteredCards.length - 1) {
      setDrillIndex(drillIndex + 1);
    } else {
      setDrillIndex(0);
    }
  };

  const prevDrillCard = () => {
    setIsFlipped(false);
    setShowHint(false);
    setVoiceTranscript('');
    setVoiceMatchScore(null);
    if (drillIndex > 0) {
      setDrillIndex(drillIndex - 1);
    }
  };

  const dueCount = subjectCards.filter((fc) => isCardDueForReview(fc)).length;
  const newCount = subjectCards.filter((fc) => fc.status === 'new').length;
  const learningCount = subjectCards.filter((fc) => fc.status === 'learning').length;
  const masteredCount = subjectCards.filter((fc) => fc.status === 'mastered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Banner */}
      <div className="bg-[#EBE7DF] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2C3B2E] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2EFE3] dark:bg-emerald-950/80 border border-[#C5DCC6] dark:border-emerald-700 rounded-full text-[#5A6D5B] dark:text-emerald-300 text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>SM-2 Spaced Repetition Engine</span>
              </div>

              {onOpenSubscriptionModal && (
                <button
                  onClick={onOpenSubscriptionModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 text-white rounded-full text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin-slow" />
                  <span>Pro Plan (7-Day Free Trial)</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] dark:text-white tracking-tight">
              Smart Flashcard Decks, Spaced Repetition & Voice Input
            </h1>
            <p className="text-[#7A746B] dark:text-[#A6C4A7] text-sm mt-1 max-w-2xl">
              Master core concepts with 3D flip card drills, SM-2 memory intervals, active recall voice dictation, and Fire TV remote navigation.
            </p>

            {/* Spaced Repetition Leitner / SM-2 Queues */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-[#D9D1C7]/60 dark:border-[#2F3E31]">
              <button
                onClick={() => {
                  setFilterStatus('due');
                  setDrillIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterStatus === 'due'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-white dark:bg-[#121613] text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900 hover:bg-rose-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>⚡ Due Today ({dueCount})</span>
              </button>

              <button
                onClick={() => {
                  setFilterStatus('new');
                  setDrillIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterStatus === 'new'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-[#121613] text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-50'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>New Cards ({newCount})</span>
              </button>

              <button
                onClick={() => {
                  setFilterStatus('learning');
                  setDrillIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterStatus === 'learning'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-white dark:bg-[#121613] text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900 hover:bg-blue-50'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>In Review ({learningCount})</span>
              </button>

              <button
                onClick={() => {
                  setFilterStatus('mastered');
                  setDrillIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterStatus === 'mastered'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-[#121613] text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mastered ({masteredCount})</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenWhatsApp && (
              <button
                onClick={onOpenWhatsApp}
                className="px-4 py-2 bg-[#E2EFE3] dark:bg-emerald-950/80 hover:bg-[#D3E8D5] text-[#5A6D5B] dark:text-emerald-200 font-semibold text-xs rounded-full border border-[#C5DCC6] dark:border-emerald-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                title="Share Flashcard deck on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-[#5A6D5B]/20" />
                <span>WhatsApp Share</span>
              </button>
            )}

            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generate AI Deck</span>
            </button>

            {filteredCards.length > 0 && (
              <button
                onClick={() => {
                  setIsDrillMode(!isDrillMode);
                  setDrillIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 font-bold text-xs rounded-full border flex items-center gap-2 transition-all cursor-pointer ${
                  isDrillMode
                    ? 'bg-[#B87D4B] border-[#A36C3C] text-white shadow-sm'
                    : 'bg-[#F2EFE9] dark:bg-[#202B22] border-[#D9D1C7] dark:border-[#2F3E31] text-[#2D362E] dark:text-white hover:bg-[#EBE7DF]'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isDrillMode ? 'Exit Drill Mode' : 'Start Drill Mode'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#161C18] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-[20px] p-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C857A] dark:text-[#A6C4A7] mr-2">Filter:</span>
          {[
            { id: 'due', label: `Due Today (${dueCount})` },
            { id: 'all', label: `All (${subjectCards.length})` },
            { id: 'new', label: `New (${newCount})` },
            { id: 'learning', label: `Learning (${learningCount})` },
            { id: 'mastered', label: `Mastered (${masteredCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilterStatus(item.id);
                setDrillIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterStatus === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
                  : 'bg-[#F9F7F2] dark:bg-[#1C241E] text-[#7A746B] dark:text-[#A6C4A7] border border-[#D9D1C7] dark:border-[#2A372C] hover:text-[#2D362E] dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#7A746B] dark:text-[#A6C4A7] font-medium">
          <div className="flex items-center gap-1.5 text-[11px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl text-amber-900 dark:text-amber-200">
            <Tv className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Fire TV Remote Compatible (Arrows & Space)</span>
          </div>

          <div>
            Subject: <strong className="text-[#2D362E] dark:text-white">{currentSubject?.name || 'All Subjects'}</strong>
          </div>
        </div>
      </div>

      {/* FULL DRILL MODE OR CARD GRID */}
      {isDrillMode && activeDrillCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-[#7A746B] dark:text-[#A6C4A7]">
            <span>
              Card <strong className="text-[#2D362E] dark:text-white">{drillIndex + 1}</strong> of <strong className="text-[#2D362E] dark:text-white">{filteredCards.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              {(() => {
                const dueInfo = getDueStatusLabel(activeDrillCard);
                return (
                  <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${dueInfo.colorClass}`}>
                    {dueInfo.label}
                  </span>
                );
              })()}

              <span className="px-2.5 py-0.5 bg-[#F2EFE9] dark:bg-[#202B22] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-md uppercase font-bold text-[10px] text-[#2D362E] dark:text-white">
                {activeDrillCard.difficulty}
              </span>
              <span className="px-2.5 py-0.5 bg-[#E2EFE3] dark:bg-emerald-950 border border-[#C5DCC6] dark:border-emerald-700 text-[#5A6D5B] dark:text-emerald-300 rounded-md font-semibold text-[10px]">
                {activeDrillCard.category}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#EBE7DF] dark:bg-[#2C3B2E] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-full transition-all duration-300"
              style={{ width: `${((drillIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            tabIndex={0}
            className="w-full min-h-[320px] bg-white dark:bg-[#161C18] border-2 border-emerald-500/40 dark:border-emerald-500/60 rounded-[28px] p-6 sm:p-8 shadow-lg flex flex-col justify-between cursor-pointer relative transition-transform hover:scale-[1.01] active:scale-[0.99] focus:ring-4 focus:ring-amber-400 focus:outline-none"
          >
            {/* Top Card Controls */}
            <div className="flex items-center justify-between text-xs text-[#8C857A] dark:text-[#A6C4A7]">
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 dark:text-emerald-400">
                {isFlipped ? 'ANSWER (CLICK / SPACE TO FLIP)' : 'QUESTION (CLICK / SPACE TO FLIP)'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeakText(isFlipped ? activeDrillCard.answer : activeDrillCard.question);
                  }}
                  className="p-2 bg-[#F2EFE9] dark:bg-[#202B22] hover:bg-[#EBE7DF] text-[#5A6D5B] dark:text-emerald-300 rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31] transition-colors cursor-pointer"
                  title="Speak aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(!isFlipped);
                  }}
                  className="p-2 bg-[#F2EFE9] dark:bg-[#202B22] hover:bg-[#EBE7DF] text-[#5A6D5B] dark:text-emerald-300 rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31] transition-colors cursor-pointer"
                  title="Flip card"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="my-auto text-center py-6 px-2 space-y-4">
              {!isFlipped ? (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] dark:text-white leading-relaxed">
                    {activeDrillCard.question}
                  </h2>

                  {/* Voice Active Recall Answer Input */}
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex flex-col items-center gap-2 max-w-md w-full mx-auto">
                      <button
                        onClick={handleStartVoiceRecall}
                        disabled={isVoiceActive}
                        className={`px-4 py-2 rounded-2xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          isVoiceActive
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-md'
                            : 'bg-blue-50 dark:bg-cyan-950/60 hover:bg-blue-100 text-blue-900 dark:text-cyan-200 border-blue-300 dark:border-cyan-700'
                        }`}
                      >
                        <Mic className={`w-4 h-4 ${isVoiceActive ? 'text-white' : 'text-blue-600 dark:text-cyan-300'}`} />
                        <span>{isVoiceActive ? 'Listening to Spoken Answer...' : '🎤 Speak Answer (Voice Active Recall)'}</span>
                      </button>

                      {voiceTranscript && (
                        <div className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1C241E] border border-[#D9D1C7] dark:border-[#2A372C] rounded-2xl text-xs space-y-2 text-left">
                          <p className="text-[#3C3C3B] dark:text-[#F4F1EA] italic">
                            "{voiceTranscript}"
                          </p>
                          <button
                            onClick={handleEvaluateVoiceRecall}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            Check Voice Recall Accuracy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {voiceMatchScore !== null && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 rounded-full text-emerald-900 dark:text-emerald-200 text-xs font-extrabold">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{voiceMatchScore}% Voice Answer Accuracy</span>
                    </div>
                  )}

                  <p className="text-lg sm:text-xl font-serif font-bold text-[#5A6D5B] dark:text-emerald-300 leading-relaxed">
                    {activeDrillCard.answer}
                  </p>
                  {activeDrillCard.hint && showHint && (
                    <div className="p-3 bg-[#FDF1E6] dark:bg-amber-950/40 border border-[#E8D1BE] dark:border-amber-800 rounded-xl text-[#B87D4B] dark:text-amber-200 text-xs text-left font-medium">
                      💡 <strong>Hint:</strong> {activeDrillCard.hint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Controls */}
            <div className="flex items-center justify-between border-t border-[#EBE7DF] dark:border-[#2C3B2E] pt-4 text-xs text-[#8C857A]">
              {activeDrillCard.hint && !isFlipped ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="text-[#B87D4B] dark:text-amber-300 font-semibold hover:underline cursor-pointer"
                >
                  {showHint ? 'Hide Hint' : '💡 Show Hint'}
                </button>
              ) : <div />}

              <span className="text-[11px] text-[#8C857A] dark:text-[#A6C4A7] font-medium">
                Click anywhere to flip
              </span>
            </div>
          </div>

          {/* SM-2 Spaced Repetition Rating Buttons */}
          {isFlipped && (
            <div className="space-y-2">
              <span className="block text-center text-xs font-bold uppercase tracking-wider text-[#7A746B] dark:text-[#A6C4A7]">
                How well did you recall this concept? (SM-2 Algorithm)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleRateCard('again')}
                  className="py-3 px-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Press 1 on remote"
                >
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Again (1d)</span>
                </button>

                <button
                  onClick={() => handleRateCard('hard')}
                  className="py-3 px-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Press 2 on remote"
                >
                  <RotateCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Hard (2-3d)</span>
                </button>

                <button
                  onClick={() => handleRateCard('good')}
                  className="py-3 px-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Press 3 on remote"
                >
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Good (5-7d)</span>
                </button>

                <button
                  onClick={() => handleRateCard('easy')}
                  className="py-3 px-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Press 4 on remote"
                >
                  <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600" />
                  <span>Easy (14d+)</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={prevDrillCard}
              disabled={drillIndex === 0}
              className="px-4 py-2 bg-[#F2EFE9] dark:bg-[#202B22] hover:bg-[#EBE7DF] text-[#2D362E] dark:text-white text-xs font-bold rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31] flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={nextDrillCard}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      ) : (

        /* GRID VIEW OF CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((fc) => {
            const dueInfo = getDueStatusLabel(fc);
            return (
              <div
                key={fc.id}
                className="bg-white dark:bg-[#161C18] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-[24px] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] bg-[#E2EFE3] dark:bg-emerald-950 border border-[#C5DCC6] dark:border-emerald-700 text-[#5A6D5B] dark:text-emerald-300 font-semibold rounded-md">
                      {fc.category}
                    </span>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${dueInfo.colorClass}`}>
                      {dueInfo.label}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-[#2D362E] dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {fc.question}
                  </h3>
                </div>

                <div className="p-3 bg-[#F9F7F2] dark:bg-[#1C241E] border border-[#EBE7DF] dark:border-[#2A372C] rounded-xl space-y-1">
                  <p className="text-xs text-[#3C3C3B] dark:text-[#F4F1EA] leading-relaxed font-medium line-clamp-3">
                    {fc.answer}
                  </p>
                  {fc.hint && (
                    <p className="text-[11px] text-[#B87D4B] dark:text-amber-300 italic pt-1">
                      Hint: {fc.hint}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#EBE7DF] dark:border-[#2C3B2E] pt-3 text-xs text-[#8C857A]">
                  <button
                    onClick={() => handleSpeakText(fc.question + ' Answer: ' + fc.answer)}
                    className="text-[#8C857A] dark:text-[#A6C4A7] hover:text-[#5A6D5B] dark:hover:text-white p-1 transition-colors cursor-pointer"
                    title="Listen audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateFlashcardStatus(
                          fc.id,
                          fc.status === 'mastered' ? 'learning' : 'mastered'
                        )
                      }
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        fc.status === 'mastered'
                          ? 'bg-[#E2EFE3] dark:bg-emerald-950 border-[#C5DCC6] dark:border-emerald-700 text-[#5A6D5B] dark:text-emerald-300'
                          : 'bg-[#F2EFE9] dark:bg-[#202B22] border-[#D9D1C7] dark:border-[#2F3E31] text-[#8C857A] hover:text-[#5A6D5B]'
                      }`}
                      title="Toggle Mastered"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => onDeleteFlashcard(fc.id)}
                      className="p-1.5 text-[#8C857A] dark:text-[#A6C4A7] hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCards.length === 0 && (
            <div className="col-span-full bg-white dark:bg-[#161C18] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-[24px] p-12 text-center text-[#8C857A] dark:text-[#A6C4A7] space-y-3">
              <Layers className="w-12 h-12 mx-auto text-[#8C857A] dark:text-[#A6C4A7]" />
              <h3 className="text-base font-serif font-bold text-[#2D362E] dark:text-white">No Flashcards Due or Found</h3>
              <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7] max-w-md mx-auto">
                No flashcards match your current filter. Click "Generate AI Deck" or switch filters to review cards!
              </p>
            </div>
          )}
        </div>
      )}

      {/* GENERATE DECK MODAL WITH VOICE DICTATION */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-[#2D362E]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161C18] border border-[#D9D1C7] dark:border-[#2C3B2E] rounded-[24px] p-6 max-w-lg w-full space-y-5 shadow-2xl relative text-[#3C3C3B] dark:text-[#F4F1EA]">
            
            <div className="flex items-center justify-between border-b border-[#EBE7DF] dark:border-[#2C3B2E] pb-3">
              <div className="flex items-center gap-2 text-[#2D362E] dark:text-white font-serif font-bold text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>AI Flashcard Generator</span>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-[#8C857A] hover:text-[#2D362E] dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#7A746B] dark:text-[#A6C4A7]">
                    Topic or Study Material
                  </label>
                  <button
                    onClick={handleStartDictateTopic}
                    type="button"
                    className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded-lg border ${
                      isDictatingTopic
                        ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                        : 'bg-blue-50 dark:bg-cyan-950 text-blue-700 dark:text-cyan-200 border-blue-200 dark:border-cyan-800 hover:bg-blue-100'
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isDictatingTopic ? 'Listening...' : 'Dictate Topic'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="e.g. Mitosis vs Meiosis stages, key enzymes, or dictate lecture text..."
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full bg-[#F9F7F2] dark:bg-[#1C241E] border border-[#D9D1C7] dark:border-[#2A372C] rounded-xl p-3 text-xs text-[#2D362E] dark:text-white placeholder-[#8C857A] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7A746B] dark:text-[#A6C4A7] mb-1">
                    Number of Cards
                  </label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full bg-[#F9F7F2] dark:bg-[#1C241E] border border-[#D9D1C7] dark:border-[#2A372C] rounded-xl px-3 py-2 text-xs text-[#2D362E] dark:text-white"
                  >
                    <option value={4}>4 Cards</option>
                    <option value={6}>6 Cards</option>
                    <option value={8}>8 Cards</option>
                    <option value={12}>12 Cards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7A746B] dark:text-[#A6C4A7] mb-1">
                    Target Difficulty
                  </label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value as any)}
                    className="w-full bg-[#F9F7F2] dark:bg-[#1C241E] border border-[#D9D1C7] dark:border-[#2A372C] rounded-xl px-3 py-2 text-xs text-[#2D362E] dark:text-white"
                  >
                    <option value="easy">Easy (Definitions)</option>
                    <option value="medium">Medium (Concepts)</option>
                    <option value="hard">Hard (Application)</option>
                  </select>
                </div>
              </div>

              {genError && (
                <p className="text-xs text-[#B87D4B] p-2.5 bg-[#FDF1E6] dark:bg-amber-950/40 rounded-xl border border-[#E8D1BE] dark:border-amber-800 font-medium">
                  {genError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF] dark:border-[#2C3B2E]">
              <button
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8C857A] dark:text-[#A6C4A7] hover:text-[#2D362E] dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCards}
                disabled={isGenerating || !genTopic.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Generate Deck</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

