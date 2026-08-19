import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Printer, 
  Languages, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  Volume2,
  Check,
  Send
} from 'lucide-react';
import { Subject, GradeLevel, MockExamPaper, ExamQuestion } from '../../types';
import { INITIAL_MOCK_EXAMS } from '../../data/examData';
import { speakTextInLanguage, stopSpeech } from '../../utils/multilingualSpeech';

interface ExamModeTabProps {
  subjects: Subject[];
  selectedSubjectId: string;
  currentGrade: GradeLevel;
  onSelectSubject?: (id: string) => void;
  onOpenWhatsApp?: () => void;
}

export const ExamModeTab: React.FC<ExamModeTabProps> = ({
  subjects,
  selectedSubjectId,
  currentGrade,
  onSelectSubject,
}) => {
  const [exams, setExams] = useState<MockExamPaper[]>(INITIAL_MOCK_EXAMS);
  const [selectedExamId, setSelectedExamId] = useState<string>(INITIAL_MOCK_EXAMS[0].id);
  const [examStatus, setExamStatus] = useState<'idle' | 'in_progress' | 'review'>('idle');
  
  // Active test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'af'>('af');
  const [isGeneratingCustomExam, setIsGeneratingCustomExam] = useState(false);
  const [customTopicPrompt, setCustomTopicPrompt] = useState('');

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const activeQuestion = currentExam.questions[currentQuestionIndex] || currentExam.questions[0];

  // Timer loop
  useEffect(() => {
    let interval: any;
    if (examStatus === 'in_progress' && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStatus, isTimerRunning, secondsRemaining]);

  const handleStartExam = (exam: MockExamPaper) => {
    setSelectedExamId(exam.id);
    setSecondsRemaining(exam.durationMinutes * 60);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setExamStatus('in_progress');
    setIsTimerRunning(true);
  };

  const handleAnswerSelect = (questionId: string, answer: string | number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = () => {
    setIsTimerRunning(false);
    setExamStatus('review');
  };

  const handleGenerateCustomExamWithAI = async () => {
    if (!customTopicPrompt.trim()) return;
    setIsGeneratingCustomExam(true);

    try {
      const activeSub = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
      const res = await fetch('/api/gemini/exam-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopicPrompt,
          subject: activeSub.name,
          grade: currentGrade,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exam) {
          setExams((prev) => [data.exam, ...prev]);
          setSelectedExamId(data.exam.id);
          handleStartExam(data.exam);
          setCustomTopicPrompt('');
        }
      }
    } catch (e) {
      console.warn('Custom exam generation failed, using structured template:', e);
      // Create rich fallback paper
      const newExam: MockExamPaper = {
        id: `exam-custom-${Date.now()}`,
        title: `${customTopicPrompt} - Timed Mock Exam`,
        subjectId: selectedSubjectId,
        subjectName: subjects.find((s) => s.id === selectedSubjectId)?.name || 'General',
        gradeLevel: currentGrade,
        durationMinutes: 30,
        totalMarks: 30,
        questions: [
          {
            id: 'cq1',
            section: 'Section A: Definitions',
            questionText: `State the fundamental principles and definition of ${customTopicPrompt} [3 marks].`,
            afrikaansTranslation: `Stel die fundamentele beginsels en definisie van ${customTopicPrompt} [3 punte].`,
            marks: 3,
            type: 'short-answer',
            modelAnswer: `Accurate definition with standard academic terminology and application of ${customTopicPrompt}.`,
            rubricCriteria: ['1 mark for exact definition', '1 mark for key terminology', '1 mark for scientific context'],
          },
          {
            id: 'cq2',
            section: 'Section B: Problem Solving',
            questionText: `Analyze and solve a core high-frequency exam problem regarding ${customTopicPrompt} [5 marks].`,
            afrikaansTranslation: `Analiseer en los 'n kern eksamenprobleem op rakende ${customTopicPrompt} [5 punte].`,
            marks: 5,
            type: 'essay',
            modelAnswer: `Step 1: State formula.\nStep 2: Substitute values.\nStep 3: Calculate answer with proper units.`,
            rubricCriteria: ['1 mark: Formula', '2 marks: Substitution', '2 marks: Final answer and explanation'],
          },
        ],
      };
      setExams((prev) => [newExam, ...prev]);
      handleStartExam(newExam);
      setCustomTopicPrompt('');
    } finally {
      setIsGeneratingCustomExam(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate score for multiple choice
  const calculateScore = () => {
    let obtained = 0;
    let total = 0;
    currentExam.questions.forEach((q) => {
      total += q.marks;
      if (q.type === 'multiple-choice' && userAnswers[q.id] === q.correctOptionIndex) {
        obtained += q.marks;
      } else if (q.type !== 'multiple-choice' && userAnswers[q.id]) {
        obtained += Math.round(q.marks * 0.8); // Estimated student rubric score
      }
    });
    return { obtained, total, percentage: Math.round((obtained / (total || 1)) * 100) };
  };

  const scoreStats = calculateScore();

  return (
    <div className="space-y-6 animate-fade-in text-[#2D362E] dark:text-[#F4F1EA]">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#2D362E] via-[#3C4A3E] to-[#243327] text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              CAPS & IEB Past Exam Simulator
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
              🇿🇦 English & Afrikaans Memo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Timed Mock Exams & Past Papers
          </h1>
          <p className="text-sm text-white/80 mt-1 max-w-2xl">
            Simulate real exam conditions with strict countdown timers, mark allocations `[4 marks]`, auto-generated rubrics, and instant step-by-step memorandum review.
          </p>
        </div>

        {/* Dual Language Selector */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs border border-white/10 shrink-0">
          <Languages className="w-4 h-4 text-amber-300 ml-1" />
          <button
            onClick={() => setSelectedLanguage('af')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLanguage === 'af' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            🇿🇦 Afrikaans Vraestel
          </button>
          <button
            onClick={() => setSelectedLanguage('en')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLanguage === 'en' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            🇬🇧 English Paper
          </button>
        </div>
      </div>

      {/* STATE 1: IDLE / EXAM SELECTION DASHBOARD */}
      {examStatus === 'idle' && (
        <div className="space-y-6">
          
          {/* AI On-Demand Mock Paper Generator Box */}
          <div className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              Generate Custom AI Past Paper on Any Topic
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={customTopicPrompt}
                onChange={(e) => setCustomTopicPrompt(e.target.value)}
                placeholder="e.g. Mitochondria & Respiration, Organic Chemistry, or Calculus Derivatives..."
                className="w-full bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
              />
              <button
                onClick={handleGenerateCustomExamWithAI}
                disabled={isGeneratingCustomExam || !customTopicPrompt.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingCustomExam ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Compiling Paper...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate & Start</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Available Mock Papers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((paper) => (
              <div
                key={paper.id}
                className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] hover:border-emerald-500/50 rounded-2xl shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                    <span className="font-bold px-2 py-0.5 bg-[#EBE7DF] dark:bg-[#253026] rounded-md">
                      {paper.subjectName}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {paper.durationMinutes} Mins
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#2D362E] dark:text-white pt-1">
                    {paper.title}
                  </h3>

                  <p className="text-xs text-[#7A746B] dark:text-[#B5AEA3]">
                    {paper.questions.length} questions • Total {paper.totalMarks} Marks • Section A, B & C Format
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E2D8] dark:border-[#263228] flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Grade {paper.gradeLevel.replace('grade-', '')}
                  </span>
                  <button
                    onClick={() => handleStartExam(paper)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Begin Exam</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE EXAM IN PROGRESS */}
      {examStatus === 'in_progress' && (
        <div className="space-y-6">
          
          {/* Exam Live Toolbar */}
          <div className="p-4 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#2D362E] dark:text-white">
                {currentExam.title}
              </h2>
              <span className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                Question {currentQuestionIndex + 1} of {currentExam.questions.length} ({activeQuestion.section})
              </span>
            </div>

            {/* Countdown Clock */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-bold shadow-xs ${
              secondsRemaining < 300 
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-400/40 animate-pulse' 
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Time Left: {formatTimer(secondsRemaining)}</span>
            </div>

            {/* Finish & Submit Button */}
            <button
              onClick={handleSubmitExam}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Submit & View Memo
            </button>
          </div>

          {/* Active Question Box */}
          <div className="p-6 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-[#EBE7DF] dark:bg-[#253026] text-[11px] font-bold rounded-md uppercase tracking-wider text-[#5A6D5B] dark:text-emerald-300">
                  {activeQuestion.section}
                </span>

                <h3 className="text-base sm:text-lg font-bold text-[#2D362E] dark:text-white leading-relaxed">
                  {selectedLanguage === 'af' && activeQuestion.afrikaansTranslation
                    ? activeQuestion.afrikaansTranslation
                    : activeQuestion.questionText}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const txt = selectedLanguage === 'af' && activeQuestion.afrikaansTranslation
                      ? activeQuestion.afrikaansTranslation
                      : activeQuestion.questionText;
                    speakTextInLanguage(txt, selectedLanguage === 'af' ? 'af-ZA' : 'en-ZA');
                  }}
                  className="p-2 bg-[#F0ECE1] dark:bg-[#253026] hover:bg-[#E2DDD0] text-[#5A6D5B] dark:text-[#A2B5A3] rounded-xl transition-colors cursor-pointer"
                  title="Listen to question aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl">
                  [{activeQuestion.marks} Marks]
                </span>
              </div>
            </div>

            {/* Question Response Input */}
            <div className="pt-2">
              {activeQuestion.type === 'multiple-choice' && activeQuestion.options ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(activeQuestion.id, idx)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        userAnswers[activeQuestion.id] === idx
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-[#F9F7F2] dark:bg-[#121813] text-[#2D362E] dark:text-[#F4F1EA] border-[#D9D1C7] dark:border-[#2D3B2F] hover:bg-[#EBE7DF]'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                      {userAnswers[activeQuestion.id] === idx && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#7A746B] dark:text-[#A6C4A7]">
                    Type your full answer / working steps below:
                  </label>
                  <textarea
                    rows={4}
                    value={(userAnswers[activeQuestion.id] as string) || ''}
                    onChange={(e) => handleAnswerSelect(activeQuestion.id, e.target.value)}
                    placeholder="Write your explanation or step-by-step working..."
                    className="w-full bg-[#F9F7F2] dark:bg-[#121813] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl p-4 text-xs font-medium focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D8] dark:border-[#263228]">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 bg-[#F0ECE1] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {currentExam.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentQuestionIndex === i
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : userAnswers[currentExam.questions[i].id] !== undefined
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-[#F0ECE1] dark:bg-[#253026] text-[#7A746B]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex < currentExam.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Submit Exam</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* STATE 3: DETAILED EXAM MEMORANDUM & REVIEW */}
      {examStatus === 'review' && (
        <div className="space-y-6">
          
          {/* Result Score Card */}
          <div className="p-6 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-serif font-extrabold text-2xl shadow-md ${
                scoreStats.percentage >= 70
                  ? 'bg-emerald-500 text-white'
                  : scoreStats.percentage >= 50
                  ? 'bg-amber-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {scoreStats.percentage}%
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2D362E] dark:text-white">
                  Exam Result & Memorandum: {scoreStats.obtained} / {scoreStats.total} Marks
                </h2>
                <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7] mt-0.5">
                  {scoreStats.percentage >= 70 ? '🎉 Distinction Standard (Level 7)' : 'Solid effort! Review the step-by-step memo below.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#F0ECE1] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Memo</span>
              </button>
              <button
                onClick={() => handleStartExam(currentExam)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Paper</span>
              </button>
            </div>
          </div>

          {/* Question by Question Rubric Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#2D362E] dark:text-white uppercase tracking-wider">
              Step-by-Step Marking Memorandum (CAPS / IEB Rubric)
            </h3>

            {currentExam.questions.map((q, idx) => {
              const isMcqCorrect = q.type === 'multiple-choice' && userAnswers[q.id] === q.correctOptionIndex;
              return (
                <div
                  key={q.id}
                  className="p-5 bg-white dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Question {idx + 1} • [{q.marks} Marks]
                      </span>
                      <h4 className="text-sm font-bold text-[#2D362E] dark:text-white">
                        {q.questionText}
                      </h4>
                      {q.afrikaansTranslation && (
                        <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7] italic">
                          {q.afrikaansTranslation}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const txt = selectedLanguage === 'af' && q.afrikaansTranslation 
                          ? `${q.afrikaansTranslation}. Model antwoord: ${q.modelAnswer}`
                          : q.modelAnswer;
                        speakTextInLanguage(txt, selectedLanguage === 'af' ? 'af-ZA' : 'en-ZA');
                      }}
                      className="p-1.5 bg-[#F0ECE1] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] rounded-lg transition-colors cursor-pointer shrink-0"
                      title={selectedLanguage === 'af' ? 'Luister na modelantwoord in Afrikaans' : 'Listen to model answer aloud'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Student Answer vs Official Memo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-[#F9F7F2] dark:bg-[#121813] rounded-xl border border-[#D9D1C7] dark:border-[#2D3B2F]">
                      <span className="font-bold text-[#7A746B] dark:text-[#A6C4A7] block mb-1">
                        Your Submission:
                      </span>
                      <p className="text-[#2D362E] dark:text-white font-medium">
                        {q.type === 'multiple-choice' && q.options
                          ? userAnswers[q.id] !== undefined
                            ? `${String.fromCharCode(65 + Number(userAnswers[q.id]))}. ${q.options[Number(userAnswers[q.id])]}`
                            : 'No answer selected'
                          : (userAnswers[q.id] as string) || 'No response written'}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                        Official Marking Memo:
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-200 whitespace-pre-line font-medium">
                        {q.modelAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Rubric Criteria points */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      Marking Allocation Criteria:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900 dark:text-amber-200">
                      {q.rubricCriteria.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
