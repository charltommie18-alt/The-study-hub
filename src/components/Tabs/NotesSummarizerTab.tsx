import React, { useState, useRef, useEffect } from 'react';
import { Note, Subject } from '../../types';
import { generateOfflineSummary } from '../../utils/offlineAI';
import { 
  SUPPORTED_LANGUAGES, 
  speakTextInLanguage, 
  stopSpeech,
  loadVoiceSettings
} from '../../utils/multilingualSpeech';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  Lightbulb, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  Plus,
  ArrowRight,
  FileText,
  MessageCircle,
  Mic,
  Volume2,
  VolumeX,
  Globe
} from 'lucide-react';

interface NotesSummarizerTabProps {
  notes: Note[];
  subjects: Subject[];
  selectedSubjectId: string;
  onAddNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onConvertToFlashcards: (noteContent: string, subjectId: string) => void;
  onConvertToQuiz: (noteContent: string, subjectId: string) => void;
  onOpenWhatsApp?: () => void;
}

export const NotesSummarizerTab: React.FC<NotesSummarizerTabProps> = ({
  notes,
  subjects,
  selectedSubjectId,
  onAddNote,
  onDeleteNote,
  onConvertToFlashcards,
  onConvertToQuiz,
  onOpenWhatsApp,
}) => {
  const [inputText, setInputText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDictatingNotes, setIsDictatingNotes] = useState(false);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => loadVoiceSettings().preferredLanguage || 'af-ZA');

  const recognitionRef = useRef<any>(null);
  const isDictatingRef = useRef<boolean>(false);
  const baseTextRef = useRef<string>('');

  useEffect(() => {
    return () => {
      stopSpeech();
      isDictatingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleStartVoiceDictation = () => {
    if (isDictatingNotes || isDictatingRef.current) {
      isDictatingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsDictatingNotes(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      baseTextRef.current = inputText.trim();
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = selectedLanguage || 'af-ZA';
      recognition.continuous = true;
      recognition.interimResults = true;

      isDictatingRef.current = true;

      recognition.onstart = () => setIsDictatingNotes(true);

      recognition.onresult = (event: any) => {
        let currentFinalAcc = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinalAcc += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        const combined = (currentFinalAcc + currentInterim).replace(/\s+/g, ' ').trim();
        if (combined) {
          const base = baseTextRef.current;
          setInputText(base ? `${base} ${combined}` : combined);
        }
      };

      recognition.onerror = (err: any) => {
        if (err?.error === 'not-allowed' || err?.error === 'service-not-allowed') {
          isDictatingRef.current = false;
          setIsDictatingNotes(false);
        }
      };

      recognition.onend = () => {
        if (isDictatingRef.current) {
          setTimeout(() => {
            if (isDictatingRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.warn('Dictation auto-restart failed:', e);
              }
            }
          }, 150);
          return;
        }
        setIsDictatingNotes(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      isDictatingRef.current = false;
      setIsDictatingNotes(false);
    }
  };

  const handleToggleReadSummary = (text: string) => {
    if (isSpeakingSummary) {
      stopSpeech();
      setIsSpeakingSummary(false);
      return;
    }

    setIsSpeakingSummary(true);
    speakTextInLanguage(
      text,
      selectedLanguage,
      () => setIsSpeakingSummary(true),
      () => setIsSpeakingSummary(false),
      () => setIsSpeakingSummary(false)
    );
  };

  const currentSubjectNotes = notes.filter(
    (n) => n.subjectId === selectedSubjectId || selectedSubjectId === 'all'
  );

  const activeNote = notes.find((n) => n.id === activeNoteId) || currentSubjectNotes[0] || notes[0];

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) {
      setErrorMsg(selectedLanguage.startsWith('af') ? 'Voer asseblief studienotas of teks in om te ontleed.' : 'Please enter or paste study notes/text to analyze.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

    try {
      if (!navigator.onLine) {
        throw new Error('Offline mode active - generating summary using Local AI Engine...');
      }

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          subject: currentSubject?.name || 'General Studies',
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      const isAf = selectedLanguage.startsWith('af');
      const defaultTitle = isAf ? `${currentSubject?.name || 'Studie'} KI-Opsomming` : 'AI Generated Note Summary';

      const newNote: Note = {
        id: `note-${Date.now()}`,
        subjectId: selectedSubjectId,
        title: noteTitle.trim() || data.title || defaultTitle,
        content: inputText,
        summary: data.summary || '',
        keyTakeaways: data.keyTakeaways || [],
        glossary: data.glossary || [],
        studyTips: data.studyTips || [],
        createdAt: new Date().toISOString().split('T')[0],
        tags: [currentSubject?.name || 'Study Notes', isAf ? 'Afrikaans KI' : 'AI Summary'],
      };

      onAddNote(newNote);
      setActiveNoteId(newNote.id);
      setInputText('');
      setNoteTitle('');
    } catch (err: any) {
      console.warn('API error or offline mode, falling back to Local Offline AI:', err);
      // Fallback to Offline AI Engine
      const offlineRes = generateOfflineSummary(inputText, currentSubject?.name || 'General Studies', selectedLanguage);

      const isAf = selectedLanguage.startsWith('af');
      const offlineNote: Note = {
        id: `note-${Date.now()}`,
        subjectId: selectedSubjectId,
        title: noteTitle.trim() || offlineRes.title,
        content: inputText,
        summary: offlineRes.summary,
        keyTakeaways: offlineRes.keyTakeaways,
        glossary: offlineRes.glossary,
        studyTips: offlineRes.studyTips,
        createdAt: new Date().toISOString().split('T')[0],
        tags: [currentSubject?.name || 'Study Notes', isAf ? 'Vanlyn Afrikaans KI' : 'Offline AI Summary'],
      };

      onAddNote(offlineNote);
      setActiveNoteId(offlineNote.id);
      setInputText('');
      setNoteTitle('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!activeNote) return;
    const textToCopy = `# ${activeNote.title}\n\n## Summary\n${activeNote.summary}\n\n## Key Takeaways\n${activeNote.keyTakeaways.map((k) => `- ${k}`).join('\n')}\n\n## Glossary\n${activeNote.glossary.map((g) => `- ${g.term}: ${g.definition}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-800 dark:from-emerald-950 dark:via-teal-900 dark:to-cyan-950 text-white border border-blue-500/30 dark:border-emerald-500/30 rounded-[28px] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 dark:bg-emerald-500/20 border border-white/20 dark:border-emerald-400/30 backdrop-blur-md rounded-full text-emerald-200 dark:text-emerald-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>AI Executive Note Condenser & Afrikaans Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              AI Note Summarizer & Key Insight Extractor
            </h1>
            <p className="text-blue-100 dark:text-emerald-200 text-sm mt-1 max-w-2xl">
              Plak lesingnotas, handboekgedeeltes of opsommings. Gemini KI ontleed en genereer outomaties hoë-waarde opsommings, sleutelbegrippe en eksamenwenke in egte Afrikaans en Engels.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 shrink-0">
            <Globe className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-white">Taal / Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-emerald-900/80 text-white border border-emerald-400/40 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Note Input / Generator Form & History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Note Input Card */}
          <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-bold text-[#2D362E] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5A6D5B]" />
                <span>New Note Input</span>
              </h2>
              <span className="text-xs text-[#8C857A]">
                Subject: <strong className="text-[#2D362E]">{subjects.find((s) => s.id === selectedSubjectId)?.name}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7A746B] mb-1">
                Note Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 4 - Cell Membrane Transport"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3.5 py-2 text-xs text-[#3C3C3B] placeholder-[#8C857A] focus:outline-none focus:border-[#5A6D5B] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#7A746B]">
                  Raw Notes / Lecture Transcript
                </label>
                <button
                  type="button"
                  onClick={handleStartVoiceDictation}
                  className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-xl border transition-all ${
                    isDictatingNotes
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-xs'
                      : 'bg-[#F2EFE9] text-[#5A6D5B] border-[#D9D1C7] hover:bg-[#EBE7DF]'
                  }`}
                  title="Dictate Notes with Microphone"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isDictatingNotes ? 'Listening...' : 'Dictate Notes'}</span>
                </button>
              </div>
              <textarea
                rows={6}
                placeholder={isDictatingNotes ? '🎤 Dictating... speak clearly into your microphone...' : 'Paste raw lecture notes, textbook passages, transcriptions, or subject outlines here...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`w-full bg-[#F9F7F2] border rounded-xl p-3.5 text-xs text-[#3C3C3B] placeholder-[#8C857A] focus:outline-none transition-all resize-none leading-relaxed ${
                  isDictatingNotes ? 'border-rose-500 bg-rose-50 font-medium text-rose-900' : 'border-[#D9D1C7] focus:border-[#5A6D5B]'
                }`}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FDF1E6] border border-[#E8D1BE] rounded-xl text-[#B87D4B] text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateSummary}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-blue-500/20 dark:shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing & Condensing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Summarize Notes with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Note History List */}
          <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 shadow-sm space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C857A]">
              Saved Notes ({currentSubjectNotes.length})
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentSubjectNotes.map((n) => {
                const isSelected = activeNote?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#F2EFE9] border-[#5A6D5B] text-[#2D362E] shadow-sm font-medium'
                        : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#7A746B] hover:bg-[#F2EFE9] hover:text-[#2D362E]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs truncate text-[#2D362E]">{n.title}</h4>
                      <p className="text-[11px] text-[#8C857A] truncate mt-0.5">{n.summary}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(n.id);
                      }}
                      className="text-[#8C857A] hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {currentSubjectNotes.length === 0 && (
                <p className="text-xs text-[#8C857A] italic text-center py-4">
                  No saved notes for this subject yet. Generate one above!
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Note Summary View */}
        <div className="lg:col-span-7">
          {activeNote ? (
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Note Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBE7DF] pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#2D362E]">{activeNote.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#8C857A]">{activeNote.createdAt}</span>
                    {activeNote.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] bg-[#E2EFE3] border border-[#C5DCC6] text-[#5A6D5B] rounded-md font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReadSummary(activeNote.summary)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSpeakingSummary
                        ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                        : 'bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#5A6D5B] border-[#C5DCC6]'
                    }`}
                    title="Listen to Executive Summary read aloud"
                  >
                    {isSpeakingSummary ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingSummary ? 'Stop Listening' : 'Listen'}</span>
                  </button>

                  {onOpenWhatsApp && (
                    <button
                      onClick={onOpenWhatsApp}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#5A6D5B] text-xs font-semibold rounded-xl border border-[#C5DCC6] transition-colors cursor-pointer"
                      title="Share Note to WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-[#5A6D5B]/20" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#3C3C3B] text-xs font-semibold rounded-xl border border-[#D9D1C7] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#7A746B]" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Summary Paragraph */}
              <div className="bg-[#E2EFE3]/50 border border-[#C5DCC6] rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#5A6D5B] text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-[#5A6D5B]" />
                  <span>Executive Summary</span>
                </div>
                <p className="text-sm text-[#2D362E] leading-relaxed font-normal">
                  {activeNote.summary}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C857A] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5A6D5B]" />
                  <span>Key Takeaways & High-Yield Points</span>
                </h3>
                <div className="space-y-2">
                  {activeNote.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-[#F9F7F2] border border-[#EBE7DF] rounded-xl"
                    >
                      <div className="w-5 h-5 rounded-md bg-[#5A6D5B] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-[#3C3C3B] leading-relaxed">{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glossary Terms */}
              {activeNote.glossary.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C857A] flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#B87D4B]" />
                    <span>Vocabulary & Terminology Glossary</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNote.glossary.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#F9F7F2] border border-[#EBE7DF] rounded-xl space-y-1"
                      >
                        <h4 className="text-xs font-bold text-[#B87D4B]">{item.term}</h4>
                        <p className="text-xs text-[#3C3C3B] leading-relaxed">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam & Study Tips */}
              {activeNote.studyTips.length > 0 && (
                <div className="bg-[#FDF1E6] border border-[#E8D1BE] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#B87D4B] text-xs font-bold uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-[#B87D4B]" />
                    <span>Pro Study & Exam Advice</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#B87D4B] leading-relaxed font-medium">
                    {activeNote.studyTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Conversion Buttons */}
              <div className="pt-2 border-t border-[#EBE7DF] flex flex-wrap gap-3">
                <button
                  onClick={() => onConvertToFlashcards(activeNote.content, activeNote.subjectId)}
                  className="flex-1 py-2.5 px-4 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] font-semibold text-xs rounded-xl border border-[#D9D1C7] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#5A6D5B]" />
                  <span>Convert Note into Flashcards</span>
                </button>

                <button
                  onClick={() => onConvertToQuiz(activeNote.content, activeNote.subjectId)}
                  className="flex-1 py-2.5 px-4 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <HelpCircle className="w-4 h-4 text-amber-200" />
                  <span>Generate Practice Quiz</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-12 text-center text-[#8C857A] space-y-3">
              <FileText className="w-12 h-12 mx-auto text-[#8C857A]" />
              <h3 className="text-base font-serif font-bold text-[#2D362E]">No Note Selected</h3>
              <p className="text-xs text-[#7A746B] max-w-md mx-auto">
                Paste your notes on the left or select an existing note from the history list to view its AI summary.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
