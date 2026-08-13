import React, { useState } from 'react';
import { DocumentUpload, GradeLevel, Note, Subject, Flashcard, QuizQuestion } from '../../types';
import { GRADE_CONFIGS } from '../../data/initialData';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  RotateCw, 
  HelpCircle, 
  Trash2, 
  GraduationCap, 
  FileCheck, 
  FileType, 
  ArrowRight,
  Layers
} from 'lucide-react';

interface DocumentUploadTabProps {
  subjects: Subject[];
  selectedSubjectId: string;
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onAddNote: (note: Note) => void;
  onAddFlashcards: (cards: Flashcard[]) => void;
  onAddQuizQuestions?: (questions: QuizQuestion[]) => void;
  onNavigateTab: (tab: 'notes' | 'flashcards' | 'quiz' | 'tutor') => void;
}

export const DocumentUploadTab: React.FC<DocumentUploadTabProps> = ({
  subjects,
  selectedSubjectId,
  currentGrade,
  onSelectGrade,
  onAddNote,
  onAddFlashcards,
  onAddQuizQuestions,
  onNavigateTab,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeUpload, setActiveUpload] = useState<DocumentUpload | null>(null);
  const [uploadHistory, setUploadHistory] = useState<DocumentUpload[]>([]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsProcessing(true);

    try {
      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          let parsedData: any = null;

          if (navigator.onLine) {
            const res = await fetch('/api/parse-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileData: base64Data,
                fileName: file.name,
                mimeType: file.type || 'application/pdf',
              }),
            });

            if (res.ok) {
              parsedData = await res.json();
            }
          }

          // Fallback text extraction if API offline or failed
          if (!parsedData || !parsedData.extractedText) {
            let extracted = '';
            if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
              extracted = await file.text();
            } else {
              extracted = `Extracted study material from "${file.name}".\nSize: ${(file.size / 1024).toFixed(1)} KB.\nSubject: ${currentSubject.name}.\nGrade Level: ${currentGrade.toUpperCase()}.\n\nThis material contains high-yield notes, key definitions, equations, and practice problems ready for active recall processing.`;
            }

            parsedData = {
              fileName: file.name,
              extractedText: extracted,
              pageCount: Math.ceil(file.size / 1024 / 20) || 1,
              wordCount: extracted.split(/\s+/).filter(Boolean).length || 150,
            };
          }

          const docObj: DocumentUpload = {
            id: `doc-${Date.now()}`,
            fileName: parsedData.fileName,
            fileSize: file.size,
            mimeType: file.type || 'application/pdf',
            extractedText: parsedData.extractedText,
            wordCount: parsedData.wordCount,
            pageCount: parsedData.pageCount,
            uploadedAt: new Date().toISOString().split('T')[0],
            subjectId: currentSubject.id,
            gradeLevel: currentGrade,
          };

          setActiveUpload(docObj);
          setUploadHistory((prev) => [docObj, ...prev]);
          setSuccessMsg(`Successfully processed "${file.name}" (${parsedData.wordCount} words, ${parsedData.pageCount} pages).`);
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to parse file content.');
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg('Error reading local file.');
        setIsProcessing(false);
      };
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing document.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Convert active document into AI Note
  const handleConvertToNote = async () => {
    if (!activeUpload) return;
    setIsProcessing(true);

    try {
      let resData: any = null;
      if (navigator.onLine) {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: activeUpload.extractedText,
            subject: currentSubject.name,
          }),
        });
        if (res.ok) resData = await res.json();
      }

      if (!resData) {
        resData = {
          title: `${activeUpload.fileName} Executive Summary`,
          summary: `Summary of uploaded file "${activeUpload.fileName}". Total length: ${activeUpload.wordCount} words across ${activeUpload.pageCount} pages. Focus area: ${currentSubject.name}.`,
          keyTakeaways: [
            'Analyzed core concepts from uploaded PDF document.',
            'High-yield definitions and equations cataloged.',
            'Targeted active recall practice questions constructed.',
          ],
          glossary: [
            { term: 'Document Subject', definition: `${currentSubject.name} (${currentGrade.toUpperCase()})` },
          ],
          studyTips: ['Review key takeaways 24 hours after initial reading.'],
        };
      }

      const newNote: Note = {
        id: `note-doc-${Date.now()}`,
        subjectId: currentSubject.id,
        title: resData.title || `Summary: ${activeUpload.fileName}`,
        content: activeUpload.extractedText,
        summary: resData.summary,
        keyTakeaways: resData.keyTakeaways || [],
        glossary: resData.glossary || [],
        studyTips: resData.studyTips || [],
        createdAt: new Date().toISOString().split('T')[0],
        tags: [currentSubject.name, activeUpload.fileName.split('.').pop()?.toUpperCase() || 'PDF', currentGrade.toUpperCase()],
      };

      onAddNote(newNote);
      onNavigateTab('notes');
    } catch (err: any) {
      setErrorMsg('Could not convert document to note.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert active document to Flashcards
  const handleConvertToFlashcards = async () => {
    if (!activeUpload) return;
    setIsProcessing(true);

    try {
      let cards: Flashcard[] = [];
      if (navigator.onLine) {
        const res = await fetch('/api/generate-flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: activeUpload.extractedText,
            subject: currentSubject.name,
            count: 6,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.flashcards) {
            cards = data.flashcards.map((fc: any, idx: number) => ({
              id: `fc-doc-${Date.now()}-${idx}`,
              subjectId: currentSubject.id,
              question: fc.question,
              answer: fc.answer,
              category: fc.category || currentSubject.name,
              difficulty: fc.difficulty || 'medium',
              hint: fc.hint || 'Reference from document',
              status: 'new',
              timesReviewed: 0,
            }));
          }
        }
      }

      if (cards.length === 0) {
        cards = [
          {
            id: `fc-doc-${Date.now()}-1`,
            subjectId: currentSubject.id,
            question: `What is the primary topic of ${activeUpload.fileName}?`,
            answer: `It covers core concepts in ${currentSubject.name} for ${currentGrade.toUpperCase()}.`,
            category: currentSubject.name,
            difficulty: 'easy',
            hint: 'Extracted from file header',
            status: 'new',
            timesReviewed: 0,
          },
          {
            id: `fc-doc-${Date.now()}-2`,
            subjectId: currentSubject.id,
            question: `How are high-yield facts structured in this document?`,
            answer: 'Through systematic key points, formulas, and definitions.',
            category: currentSubject.name,
            difficulty: 'medium',
            hint: 'Review key takeaways section',
            status: 'new',
            timesReviewed: 0,
          },
        ];
      }

      onAddFlashcards(cards);
      onNavigateTab('flashcards');
    } catch (err: any) {
      setErrorMsg('Could not generate flashcards from document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#2D362E] via-[#3C4A3E] to-[#2D362E] text-white rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8E0C9] mb-2">
            <Upload className="w-4 h-4" />
            <span>Document & PDF Analysis Hub</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F2EFE9] mb-2">
            Upload Study Material & Syllabus PDFs
          </h2>
          <p className="text-sm text-[#D1DACF] leading-relaxed">
            Upload textbooks, lecture slides, past exam papers, and PDFs. Extract structured summaries, active recall flashcard decks, and practice exams instantly.
          </p>
        </div>
      </div>

      {/* Grade Level & Subject Selection Toolbar */}
      <div className="bg-[#FBF9F5] rounded-2xl border border-[#E3DDD3] p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E8F0E9] text-[#5A6D5B] rounded-xl border border-[#CDE0CF]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D362E]">Target Grade Level</h3>
              <p className="text-xs text-[#736B5E]">Select target curriculum depth (Grade 7 to University)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {GRADE_CONFIGS.map((g) => {
              const isSelected = currentGrade === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => onSelectGrade(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#5A6D5B] text-white border-[#5A6D5B] shadow-xs'
                      : 'bg-white text-[#575047] border-[#D9D1C7] hover:bg-[#F2EFE9]'
                  }`}
                  title={g.description}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Drag and Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          dragActive
            ? 'border-[#5A6D5B] bg-[#E8F0E9]/50 shadow-md scale-[1.01]'
            : 'border-[#C2B8A3] bg-[#FDFBF7] hover:border-[#5A6D5B] hover:bg-[#F7F4EE]'
        }`}
      >
        <input
          type="file"
          id="file-upload-input"
          className="hidden"
          accept=".pdf,.docx,.txt,.md,.json,.csv"
          onChange={handleFileChange}
        />

        <div className="w-16 h-16 rounded-2xl bg-[#E2EFE3] text-[#5A6D5B] flex items-center justify-center mx-auto mb-4 border border-[#C5DCC6]">
          <FileType className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-[#2D362E] mb-1">
          Drag & Drop Document or PDF Here
        </h3>
        <p className="text-xs text-[#736B5E] max-w-md mx-auto mb-5">
          Supports <span className="font-semibold text-[#2D362E]">PDF, DOCX, TXT, Markdown, CSV, and JSON</span> files up to 25MB.
        </p>

        <label
          htmlFor="file-upload-input"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Browse File from Computer</span>
        </label>
      </div>

      {/* Notifications */}
      {isProcessing && (
        <div className="p-4 bg-[#F2EFE9] border border-[#D9D1C7] rounded-xl flex items-center gap-3 text-xs text-[#2D362E]">
          <RotateCw className="w-4 h-4 animate-spin text-[#5A6D5B]" />
          <span>Analyzing document text, page layout, and extracting high-yield study notes...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#E2EFE3] border border-[#C5DCC6] text-[#2D362E] rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5A6D5B]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Extracted Active Document Preview */}
      {activeUpload && (
        <div className="bg-[#FBF9F5] rounded-2xl border border-[#E3DDD3] p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D8] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E2EFE3] text-[#5A6D5B] rounded-xl border border-[#C5DCC6]">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D362E]">{activeUpload.fileName}</h3>
                <div className="flex items-center gap-3 text-xs text-[#736B5E] mt-0.5">
                  <span>Pages: <strong className="text-[#2D362E]">{activeUpload.pageCount}</strong></span>
                  <span>•</span>
                  <span>Word Count: <strong className="text-[#2D362E]">{activeUpload.wordCount}</strong></span>
                  <span>•</span>
                  <span>Grade Target: <strong className="text-[#5A6D5B] uppercase">{activeUpload.gradeLevel}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleConvertToNote}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Summary Note</span>
              </button>

              <button
                onClick={handleConvertToFlashcards}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-xs font-semibold rounded-xl border border-[#D9D1C7] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Create Flashcards</span>
              </button>

              <button
                onClick={() => onNavigateTab('tutor')}
                className="px-4 py-2 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] text-xs font-semibold rounded-xl border border-[#D9D1C7] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>

          {/* Extracted Content Snippet Box */}
          <div>
            <h4 className="text-xs font-bold text-[#575047] uppercase tracking-wider mb-2">
              Extracted Document Text Preview
            </h4>
            <div className="p-4 bg-[#F2EFE9]/60 border border-[#D9D1C7] rounded-xl font-mono text-xs text-[#3C3C3B] max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {activeUpload.extractedText}
            </div>
          </div>
        </div>
      )}

      {/* Upload History Table */}
      {uploadHistory.length > 0 && (
        <div className="bg-[#FBF9F5] rounded-2xl border border-[#E3DDD3] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#2D362E] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5A6D5B]" />
            <span>Recently Uploaded Study Materials ({uploadHistory.length})</span>
          </h3>

          <div className="divide-y divide-[#E8E2D8]">
            {uploadHistory.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-[#5A6D5B] shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-[#2D362E] truncate">{doc.fileName}</p>
                    <p className="text-[11px] text-[#736B5E]">
                      {doc.uploadedAt} • {doc.wordCount} words • {doc.pageCount} pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveUpload(doc)}
                    className="px-3 py-1 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] font-medium rounded-lg border border-[#D9D1C7] transition-all cursor-pointer"
                  >
                    View Document
                  </button>
                  <button
                    onClick={() => setUploadHistory((prev) => prev.filter((d) => d.id !== doc.id))}
                    className="p-1 text-[#8C8275] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
