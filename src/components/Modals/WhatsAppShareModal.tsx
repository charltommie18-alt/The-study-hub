import React, { useState } from 'react';
import { MessageCircle, X, Copy, Check, ExternalLink, Share2, Phone, BookOpen, Layers, Award, Sparkles } from 'lucide-react';
import { Subject, Note, Flashcard, QuizResult } from '../../types';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  selectedSubjectId: string;
  notes?: Note[];
  flashcards?: Flashcard[];
  quizResults?: QuizResult[];
  prefilledText?: string;
  shareType?: 'note' | 'flashcard' | 'quiz' | 'plan' | 'general';
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  subjects,
  selectedSubjectId,
  notes = [],
  flashcards = [],
  quizResults = [],
  prefilledText = '',
  shareType = 'general',
}) => {
  const [activeShareTab, setActiveShareTab] = useState<'note' | 'flashcard' | 'quiz' | 'plan' | 'custom'>(
    shareType as any || 'general'
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>(prefilledText);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectNotes = notes.filter((n) => n.subjectId === selectedSubjectId || selectedSubjectId === 'all');
  const subjectFlashcards = flashcards.filter((f) => f.subjectId === selectedSubjectId || selectedSubjectId === 'all');
  const latestQuizResult = quizResults[0];

  // Helper to construct WhatsApp formatted strings (*bold*, _italic_, ~strikethrough~)
  const getFormattedMessage = (): string => {
    if (customMessage && customMessage.trim().length > 0) {
      return customMessage;
    }

    if (activeShareTab === 'note' && subjectNotes.length > 0) {
      const note = subjectNotes[0];
      return `📚 *StudyHub Note Summary - ${currentSubject.name}*\n\n` +
        `*${note.title}*\n\n` +
        `*Key Takeaways:*\n${note.summary.keyTakeaways.map((k) => `• ${k}`).join('\n')}\n\n` +
        `*Summary Overview:*\n${note.summary.overview}\n\n` +
        `⚡ _Studied on The Study Hub AI Workspace_`;
    }

    if (activeShareTab === 'flashcard' && subjectFlashcards.length > 0) {
      const sampleCards = subjectFlashcards.slice(0, 3);
      return `🎴 *StudyHub Flashcard Challenge - ${currentSubject.name}*\n\n` +
        `Can you answer these study questions?\n\n` +
        sampleCards
          .map(
            (c, i) =>
              `*Q${i + 1}:* ${c.question}\n_Answer:_ ${c.answer}`
          )
          .join('\n\n') +
        `\n\n⚡ _Mastered on The Study Hub_`;
    }

    if (activeShareTab === 'quiz' && latestQuizResult) {
      return `🏆 *StudyHub Practice Test Score Challenge!*\n\n` +
        `Subject: *${currentSubject.name}*\n` +
        `Score: *${latestQuizResult.score}%* (${latestQuizResult.correctAnswers}/${latestQuizResult.totalQuestions} Correct)\n\n` +
        `Can you beat my test score? Join my study group on StudyHub! 🚀`;
    }

    if (activeShareTab === 'plan') {
      return `🗓️ *My High-Yield Exam Study Roadmap - ${currentSubject.name}*\n\n` +
        `• *Goal:* Master ${currentSubject.name} in 7 Days\n` +
        `• *Daily Commitment:* 2 Hours Focus Sprints\n` +
        `• *Active Recall:* Flashcards & Daily Practice Quizzes\n\n` +
        `Let's study together! 📖`;
    }

    return `📚 *The Study Hub - AI Study Companion*\n\nHey! Check out my study notes and practice flashcards for *${currentSubject?.name || 'our courses'}*. Join our study group on StudyHub!`;
  };

  const finalFormattedText = getFormattedMessage();

  const handleSendToWhatsApp = () => {
    const encodedText = encodeURIComponent(finalFormattedText);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

    let url = `https://api.whatsapp.com/send?text=${encodedText}`;
    if (cleanPhone.length >= 7) {
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }

    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(finalFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#D9D1C7] rounded-[28px] p-6 max-w-lg w-full space-y-5 shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2EFE3] border border-[#C5DCC6] flex items-center justify-center text-[#5A6D5B]">
              <MessageCircle className="w-4 h-4 fill-[#5A6D5B]/20 text-[#5A6D5B]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D362E]">WhatsApp Study Companion</h2>
              <p className="text-[11px] text-[#7A746B]">Share notes, test flashcards, and group quiz scores</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#7A746B] hover:text-[#2D362E] p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F9F7F2] border border-[#D9D1C7] rounded-full overflow-x-auto scrollbar-none">
          <button
            onClick={() => { setActiveShareTab('note'); setCustomMessage(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeShareTab === 'note' ? 'bg-[#5A6D5B] text-white shadow-sm' : 'text-[#7A746B] hover:text-[#2D362E]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Note Summary</span>
          </button>

          <button
            onClick={() => { setActiveShareTab('flashcard'); setCustomMessage(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeShareTab === 'flashcard' ? 'bg-[#5A6D5B] text-white shadow-sm' : 'text-[#7A746B] hover:text-[#2D362E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => { setActiveShareTab('quiz'); setCustomMessage(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeShareTab === 'quiz' ? 'bg-[#5A6D5B] text-white shadow-sm' : 'text-[#7A746B] hover:text-[#2D362E]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Quiz Score</span>
          </button>

          <button
            onClick={() => { setActiveShareTab('plan'); setCustomMessage(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeShareTab === 'plan' ? 'bg-[#5A6D5B] text-white shadow-sm' : 'text-[#7A746B] hover:text-[#2D362E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>
        </div>

        {/* WhatsApp Formatting Preview Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#3C3C3B]">
            WhatsApp Formatted Message Preview:
          </label>
          <textarea
            rows={7}
            value={finalFormattedText}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-2xl p-3.5 text-xs text-[#2D362E] font-mono leading-relaxed focus:outline-none focus:border-[#5A6D5B]"
          />
          <p className="text-[11px] text-[#8C857A]">
            💡 Tip: Uses WhatsApp markdown syntax (<code className="bg-[#EBE7DF] px-1 rounded">*bold*</code>, <code className="bg-[#EBE7DF] px-1 rounded">_italic_</code>).
          </p>
        </div>

        {/* Optional Direct Phone Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#3C3C3B]">
            Recipient WhatsApp Phone Number (Optional):
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#8C857A] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. +1234567890 (or leave empty to pick in WhatsApp)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#EBE7DF]">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] rounded-xl text-xs font-semibold flex items-center gap-2 border border-[#D9D1C7] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#5A6D5B]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleSendToWhatsApp}
            className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </button>
        </div>

      </div>
    </div>
  );
};
