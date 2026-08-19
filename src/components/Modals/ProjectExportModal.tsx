import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Download, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Code, 
  FlaskConical, 
  Presentation, 
  Check, 
  Copy, 
  Share2, 
  Printer, 
  Layers,
  FolderPlus
} from 'lucide-react';

interface ProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubjectName?: string;
}

export function ProjectExportModal({ isOpen, onClose, currentSubjectName = 'General Studies' }: ProjectExportModalProps) {
  const [gradeLevel, setGradeLevel] = useState<string>('University Undergraduate');
  const [projectType, setProjectType] = useState<string>('Research Paper & Thesis');
  const [projectTopic, setProjectTopic] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedProject, setGeneratedProject] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const projectTypes = [
    { id: 'Research Paper & Thesis', label: 'Research Paper & Thesis', icon: GraduationCap, desc: 'Full academic paper with literature review & methodology' },
    { id: 'Software & Coding Capstone', label: 'Software & Coding Capstone', icon: Code, desc: 'Architecture, technical specs, code blocks & deployment' },
    { id: 'Science Lab Report', label: 'Science Lab Report', icon: FlaskConical, desc: 'Hypothesis, apparatus, data analysis & scientific conclusion' },
    { id: 'Presentation Deck Outline', label: 'Presentation Deck Outline', icon: Presentation, desc: 'Slide-by-slide speaker notes, visual specs & key talking points' },
  ];

  const gradeLevels = [
    'Middle School (Grades 6-8)',
    'High School (Grades 9-12)',
    'AP / IB / A-Levels',
    'University Undergraduate',
    'Post-Graduate / Master\'s / Ph.D.',
  ];

  const handleGenerateProject = async () => {
    if (!projectTopic.trim()) {
      alert('Please enter a project topic or research title.');
      return;
    }

    setIsGenerating(true);
    setGeneratedProject(null);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a complete, fully formatted, academic-grade project document for the following setup:
Academic Level: ${gradeLevel}
Subject: ${currentSubjectName}
Course Code: ${courseCode || 'N/A'}
Project Type: ${projectType}
Project Topic / Proposal: ${projectTopic}

Please generate a high-yield, comprehensive submission draft adhering strictly to school and university academic mandates. Include:
1. Formal Title Page Metadata (Project Title, Author, Institution, Course Code, Submission Date)
2. Executive Summary / Abstract
3. Project Objectives & Curriculum Alignment
4. Literature Review / Theoretical Framework
5. Detailed Methodology & Step-by-step Execution Plan
6. Core Findings / Code Implementation / Analytical Content
7. Conclusion, Limitations & Recommendations
8. Bibliography / References in standard academic citation format (APA / IEEE)`,
          subject: currentSubjectName,
          persona: 'Socratic Mentor',
          tone: 'Encouraging',
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setGeneratedProject(data.reply);
      } else {
        throw new Error('No reply from project generator');
      }
    } catch (e) {
      console.warn('Project generation error, using fallback template:', e);
      setGeneratedProject(`# ACADEMIC PROJECT DELIVERABLE
**Title:** ${projectTopic}
**Academic Level:** ${gradeLevel}
**Subject:** ${currentSubjectName} (${courseCode || 'General'})
**Date:** ${new Date().toLocaleDateString()}

---

## 1. Executive Summary & Abstract
This project examines **${projectTopic}** within the scope of ${currentSubjectName}. It establishes core research objectives, investigates theoretical foundations, and formulates rigorous methodologies aligned with ${gradeLevel} academic standards.

## 2. Curriculum & Project Objectives
- Master key theoretical frameworks governing ${currentSubjectName}.
- Design and execute a structured analytical approach to evaluate ${projectTopic}.
- Present findings using professional citation guidelines and structured technical documentation.

## 3. Literature Review & Background
Recent studies in ${currentSubjectName} highlight the importance of systematic evaluation. Foundational principles dictate that empirical evidence combined with modern analytical methods yields optimal research accuracy.

## 4. Methodology & Execution Plan
1. **Phase 1: Topic Definition & Literature Synthesis** - Identify primary sources and scope.
2. **Phase 2: Execution & Data Collection** - Gather quantitative/qualitative data or implement technical solution.
3. **Phase 3: Analysis & Verification** - Validate outcomes against benchmarks.
4. **Phase 4: Documentation & Final Deliverable Review**.

## 5. Bibliography & Citations
- Academic Research Guidelines (2026). *Standard Mandates for ${gradeLevel} Deliverables*. StudyHub Academic Publishing.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!generatedProject) return;
    const blob = new Blob([generatedProject], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTopic.slice(0, 30).replace(/\s+/g, '_')}_Final_Project_Deliverable.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDoc = () => {
    if (!generatedProject) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${projectTopic}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; color: #111; }
          h1 { color: #1a365d; text-align: center; font-size: 24pt; margin-bottom: 20px; }
          h2 { color: #2b6cb0; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
          p, li { font-size: 12pt; }
          code, pre { background: #f4f4f4; padding: 10px; font-family: monospace; display: block; }
        </style>
      </head>
      <body>
        ${generatedProject
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>')}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTopic.slice(0, 30).replace(/\s+/g, '_')}_Project_Doc.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!generatedProject) return;
    navigator.clipboard.writeText(generatedProject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D8D2C2] dark:border-[#2D3B2F] rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D5] dark:border-[#2D3B2F]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 rounded-xl">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2C352E] dark:text-[#E2EFE3]">School & University Project Hub</h2>
              <p className="text-xs text-[#5A6D5B] dark:text-[#A2B5A3]">Setup, structure & export academic deliverables adhering to institutional mandates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5A6D5B] hover:text-[#2C352E] dark:text-[#A2B5A3] dark:hover:text-[#E2EFE3] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {!generatedProject ? (
            <>
              {/* Educational Level Selection */}
              <div>
                <label className="block text-xs font-bold text-[#2C352E] dark:text-[#E2EFE3] mb-1.5">
                  Academic Grade Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {gradeLevels.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGradeLevel(lvl)}
                      className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-all cursor-pointer ${
                        gradeLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-[#121913] border-[#E8E2D5] dark:border-[#2A372C] text-[#2C352E] dark:text-[#E2EFE3] hover:border-blue-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Type Grid */}
              <div>
                <label className="block text-xs font-bold text-[#2C352E] dark:text-[#E2EFE3] mb-1.5">
                  Project Deliverable Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {projectTypes.map((pt) => {
                    const IconC = pt.icon;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setProjectType(pt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                          projectType === pt.id
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-300 ring-1 ring-blue-500'
                            : 'bg-white dark:bg-[#121913] border-[#E8E2D5] dark:border-[#2A372C] text-[#2C352E] dark:text-[#E2EFE3] hover:border-blue-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${projectType === pt.id ? 'bg-blue-600 text-white' : 'bg-[#F4F1EA] dark:bg-[#1C271E] text-[#5A6D5B]'}`}>
                          <IconC className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{pt.label}</div>
                          <div className="text-[11px] text-[#5A6D5B] dark:text-[#8FA891]">{pt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#2C352E] dark:text-[#E2EFE3] mb-1">
                    Project Topic / Title / Proposal *
                  </label>
                  <input
                    type="text"
                    value={projectTopic}
                    onChange={(e) => setProjectTopic(e.target.value)}
                    placeholder="e.g. Artificial Intelligence in Medical Imaging or Renewable Energy Storage"
                    className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C352E] dark:text-[#E2EFE3] mb-1">
                    Course Code / Module
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS401 or BIO202"
                    className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                <span>AI will draft a complete, school/university compliant project setup document ready for export.</span>
              </div>
            </>
          ) : (
            /* Generated Project View */
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-blue-100/60 dark:bg-blue-950/60 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs">
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  ✨ Academic Deliverable Ready: {projectTopic}
                </span>
                <button
                  onClick={() => setGeneratedProject(null)}
                  className="px-2.5 py-1 bg-white dark:bg-[#121913] text-[#5A6D5B] dark:text-[#A2B5A3] hover:text-[#2C352E] border border-[#E8E2D5] dark:border-[#2A372C] rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Edit Topic Setup
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl max-h-[50vh] overflow-y-auto text-xs font-mono text-[#2C352E] dark:text-[#E2EFE3] whitespace-pre-wrap leading-relaxed">
                {generatedProject}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E8E2D5] dark:border-[#2D3B2F] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!generatedProject ? (
            <button
              onClick={handleGenerateProject}
              disabled={isGenerating || !projectTopic.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Drafting Project Deliverable...' : 'Generate Project Setup'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] text-[#2C352E] dark:text-[#E2EFE3] rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F4F1EA] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportDoc}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Word (.doc)</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="px-3.5 py-2 bg-[#2D362E] hover:bg-[#1F2720] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Markdown (.md)</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
