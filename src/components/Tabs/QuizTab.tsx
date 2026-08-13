import React, { useState } from 'react';
import { QuizQuestion, QuizResult, Subject } from '../../types';
import { generateOfflineQuiz } from '../../utils/offlineAI';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  Lightbulb, 
  Plus, 
  Check, 
  ArrowRight, 
  X,
  FileQuestion,
  MessageCircle
} from 'lucide-react';

interface QuizTabProps {
  quizQuestions: QuizQuestion[];
  subjects: Subject[];
  selectedSubjectId: string;
  onAddQuizResult: (result: QuizResult) => void;
  onUpdateSubjectScore: (subjectId: string, score: number) => void;
  onOpenWhatsApp?: () => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  quizQuestions,
  subjects,
  selectedSubjectId,
  onAddQuizResult,
  onUpdateSubjectScore,
  onOpenWhatsApp,
}) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(quizQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Generator modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIdx,
    }));
  };

  const handleGenerateQuiz = async () => {
    if (!genTopic.trim()) {
      setGenError('Please enter a topic or notes for the quiz.');
      return;
    }
    setGenError('');
    setIsGenerating(true);

    try {
      if (!navigator.onLine) {
        throw new Error('Offline mode - building quiz with Offline AI Engine');
      }

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: genTopic,
          subject: currentSubject?.name || 'General Studies',
          count: genCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz.');

      if (data.questions && data.questions.length > 0) {
        setActiveQuestions(data.questions);
        setCurrentIndex(0);
        setUserAnswers({});
        setShowHint({});
        setIsSubmitted(false);
        setShowGenModal(false);
        setGenTopic('');
      }
    } catch (err: any) {
      console.warn('API error or offline, fallback to Offline AI Engine:', err);
      const offlineQuestions = generateOfflineQuiz(genTopic, currentSubject?.name || 'General Studies', genCount);
      setActiveQuestions(offlineQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowHint({});
      setIsSubmitted(false);
      setShowGenModal(false);
      setGenTopic('');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    activeQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });
    return Math.round((correctCount / activeQuestions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const score = calculateScore();

    const result: QuizResult = {
      id: `res-${Date.now()}`,
      subjectId: selectedSubjectId,
      quizTitle: `${currentSubject?.name || 'Practice'} Mastery Quiz`,
      score,
      totalQuestions: activeQuestions.length,
      date: new Date().toLocaleDateString(),
    };

    onAddQuizResult(result);
    onUpdateSubjectScore(selectedSubjectId, score);
  };

  const handleRestartQuiz = () => {
    setUserAnswers({});
    setShowHint({});
    setIsSubmitted(false);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Banner */}
      <div className="bg-[#EBE7DF] border border-[#D9D1C7] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2EFE3] border border-[#C5DCC6] rounded-full text-[#5A6D5B] text-xs font-semibold mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#5A6D5B]" />
              <span>Interactive Knowledge Check</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              AI Practice Quizzes & Exam Simulations
            </h1>
            <p className="text-[#7A746B] text-sm mt-1 max-w-2xl">
              Test your recall accuracy with instant feedback, detailed step-by-step reasoning, and adaptive AI question generation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-medium text-xs rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generate AI Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      {activeQuestions.length > 0 && currentQuestion ? (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header Progress Bar */}
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#7A746B]">
                Question <strong className="text-[#2D362E]">{currentIndex + 1}</strong> of <strong className="text-[#2D362E]">{activeQuestions.length}</strong>
              </span>
              <div className="w-32 sm:w-48 bg-[#EBE7DF] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#5A6D5B] h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSubmitted ? (
                <button
                  onClick={handleRestartQuiz}
                  className="px-3 py-1.5 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-xs font-semibold rounded-xl border border-[#D9D1C7] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              ) : (
                <span className="text-xs text-[#5A6D5B] font-semibold bg-[#E2EFE3] px-2.5 py-1 rounded-lg border border-[#C5DCC6]">
                  Subject: {currentSubject?.name || 'General'}
                </span>
              )}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5A6D5B]">
                MULTIPLE CHOICE QUESTION
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2D362E] leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                const isCorrect = currentQuestion.correctAnswerIndex === optIdx;

                let optionStyle = 'bg-[#F9F7F2] border-[#D9D1C7] text-[#3C3C3B] hover:border-[#5A6D5B]';

                if (isSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-[#E2EFE3] border-[#C5DCC6] text-[#5A6D5B] font-bold shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-[#FDF1E6] border-[#E8D1BE] text-[#B87D4B] font-bold';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-[#E2EFE3] border-[#5A6D5B] text-[#2D362E] font-bold ring-1 ring-[#5A6D5B]/30';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#EBE7DF] text-[#2D362E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed font-medium">{optionText}</span>
                    </div>

                    {isSubmitted && (
                      <div className="shrink-0">
                        {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#5A6D5B]" />}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#B87D4B]" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Section */}
            {currentQuestion.hint && (
              <div>
                <button
                  onClick={() =>
                    setShowHint((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }))
                  }
                  className="text-xs font-semibold text-[#B87D4B] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{showHint[currentIndex] ? 'Hide Hint' : 'Show Hint'}</span>
                </button>

                {showHint[currentIndex] && (
                  <div className="mt-2 p-3 bg-[#FDF1E6] border border-[#E8D1BE] rounded-xl text-[#B87D4B] text-xs font-medium">
                    💡 <strong>Hint:</strong> {currentQuestion.hint}
                  </div>
                )}
              </div>
            )}

            {/* Detailed Explanation (Shown after submit) */}
            {isSubmitted && (
              <div className="p-4 bg-[#E2EFE3]/50 border border-[#C5DCC6] rounded-2xl space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5A6D5B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#5A6D5B]" />
                  <span>AI Explanation & Reasoning</span>
                </div>
                <p className="text-xs text-[#2D362E] leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Bottom Question Switcher Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EBE7DF]">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-xs font-semibold rounded-xl border border-[#D9D1C7] disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {!isSubmitted ? (
                currentIndex === activeQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length < activeQuestions.length}
                    className="px-6 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-medium text-xs rounded-full shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-medium text-xs rounded-full flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % activeQuestions.length)}
                  className="px-5 py-2 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Next Question
                </button>
              )}
            </div>

          </div>

          {/* Score Summary Modal Card (When Submitted) */}
          {isSubmitted && (
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E2EFE3] border border-[#C5DCC6] text-[#5A6D5B] flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-[#2D362E]">
                  Quiz Completed! Score: {calculateScore()}%
                </h3>
                <p className="text-xs text-[#7A746B] mt-1">
                  You answered {Object.keys(userAnswers).filter((idx) => userAnswers[Number(idx)] === activeQuestions[Number(idx)].correctAnswerIndex).length} out of {activeQuestions.length} questions correctly.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenWhatsApp && (
                  <button
                    onClick={onOpenWhatsApp}
                    className="px-5 py-2.5 bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#5A6D5B] font-semibold text-xs rounded-xl border border-[#C5DCC6] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#5A6D5B]/20" />
                    <span>Share Score on WhatsApp</span>
                  </button>
                )}

                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-2.5 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] font-semibold text-xs rounded-xl border border-[#D9D1C7] transition-colors cursor-pointer"
                >
                  Retake Quiz
                </button>

                <button
                  onClick={() => setShowGenModal(true)}
                  className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-medium text-xs rounded-full shadow-sm transition-colors cursor-pointer"
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-12 text-center text-[#8C857A] space-y-3">
          <FileQuestion className="w-12 h-12 mx-auto text-[#8C857A]" />
          <h3 className="text-base font-serif font-bold text-[#2D362E]">No Questions Available</h3>
          <p className="text-xs text-[#7A746B] max-w-md mx-auto">
            Click "Generate AI Quiz" to create a custom multiple choice exam from your subject material!
          </p>
        </div>
      )}

      {/* GENERATE QUIZ MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-[#2D362E]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D1C7] rounded-[24px] p-6 max-w-lg w-full space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <div className="flex items-center gap-2 text-[#2D362E] font-serif font-bold text-lg">
                <Sparkles className="w-5 h-5 text-[#5A6D5B]" />
                <span>AI Practice Quiz Generator</span>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-[#8C857A] hover:text-[#2D362E] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7A746B] mb-1">
                  Topic, Chapter or Note Material
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Mitochondria, electron transport chain, ATP synthesis steps..."
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl p-3 text-xs text-[#2D362E] placeholder-[#8C857A] focus:outline-none focus:border-[#5A6D5B] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7A746B] mb-1">
                  Number of Questions
                </label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                >
                  <option value={3}>3 Questions (Quick Test)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={8}>8 Questions (Deep Assessment)</option>
                </select>
              </div>

              {genError && (
                <p className="text-xs text-[#B87D4B] p-2.5 bg-[#FDF1E6] rounded-xl border border-[#E8D1BE] font-medium">
                  {genError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE7DF]">
              <button
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8C857A] hover:text-[#2D362E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !genTopic.trim()}
                className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-medium text-xs rounded-full shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Building Quiz with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Generate Quiz</span>
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
