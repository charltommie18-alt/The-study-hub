import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Plus, 
  FolderPlus, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  BookOpen, 
  Target, 
  Bell, 
  TrendingUp, 
  ListFilter, 
  Trash2, 
  BarChart2, 
  Check 
} from 'lucide-react';
import { Subject, PlannedSession, ProjectDeadline, GradeLevel } from '../../types';

interface StudyPlannerTabProps {
  subjects: Subject[];
  currentGrade: GradeLevel;
  onOpenAddSubject?: () => void;
}

export const StudyPlannerTab: React.FC<StudyPlannerTabProps> = ({
  subjects,
  currentGrade,
  onOpenAddSubject,
}) => {
  const [activeView, setActiveView] = useState<'schedule' | 'deadlines' | 'priorities'>('schedule');
  const [goalStrategy, setGoalStrategy] = useState<string>('Balanced All-Subjects Schedule');
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [hoursPerDay, setHoursPerDay] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [filterSubject, setFilterSubject] = useState<string>('All');

  // Local storage persisted state for sessions & deadlines
  const [sessions, setSessions] = useState<PlannedSession[]>(() => {
    try {
      const saved = localStorage.getItem('studyhub_planner_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed loading planner sessions:', e);
    }
    // Default initial mock sessions if empty
    return [
      {
        id: 's_1',
        dayLabel: 'Today',
        timeSlot: '03:30 PM - 04:30 PM',
        subjectName: subjects[0]?.name || 'Mathematics',
        topic: 'Algebraic Functions & Calculus Proofs',
        taskType: 'Active Recall & Practice Quiz',
        durationMinutes: 60,
        priority: 'High',
        reminderAlertTime: '15 mins before',
        taskDescription: 'Complete 10 high-yield calculus practice problems and review core formulas.',
        isCompleted: false,
      },
      {
        id: 's_2',
        dayLabel: 'Today',
        timeSlot: '04:45 PM - 05:45 PM',
        subjectName: subjects[1]?.name || 'Physical Sciences',
        topic: 'Newtonian Physics & Momentum Equations',
        taskType: 'Flashcards & Summary Notes',
        durationMinutes: 60,
        priority: 'Medium',
        reminderAlertTime: '10 mins before',
        taskDescription: 'Review momentum vectors and master 15 key physics flashcards.',
        isCompleted: true,
      },
      {
        id: 's_3',
        dayLabel: 'Tomorrow',
        timeSlot: '04:00 PM - 05:30 PM',
        subjectName: subjects[2]?.name || 'Life Sciences / Biology',
        topic: 'Cellular Respiration & DNA Replication',
        taskType: 'Project Milestone & Diagrams',
        durationMinutes: 90,
        priority: 'High',
        reminderAlertTime: '15 mins before',
        taskDescription: 'Draft diagrams for upcoming biology lab report.',
        isCompleted: false,
      },
    ];
  });

  const [deadlines, setDeadlines] = useState<ProjectDeadline[]>(() => {
    try {
      const saved = localStorage.getItem('studyhub_planner_deadlines');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed loading planner deadlines:', e);
    }
    return [
      {
        id: 'd_1',
        title: 'Physics Term Research Project',
        subjectName: subjects[1]?.name || 'Physical Sciences',
        dueDate: '2026-08-20',
        priority: 'High',
        description: 'Complete literature review, data analysis and format Word (.doc) deliverable.',
        isCompleted: false,
      },
      {
        id: 'd_2',
        title: 'Mathematics Midterm Mock Exam',
        subjectName: subjects[0]?.name || 'Mathematics',
        dueDate: '2026-08-25',
        priority: 'High',
        description: 'Complete 3 past papers and review calculus formula cheat sheet.',
        isCompleted: false,
      },
    ];
  });

  // Modal for adding new deadline
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineSubject, setNewDeadlineSubject] = useState(subjects[0]?.name || 'General');
  const [newDeadlineDate, setNewDeadlineDate] = useState('2026-08-28');
  const [newDeadlinePriority, setNewDeadlinePriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newDeadlineDesc, setNewDeadlineDesc] = useState('');

  // Persist sessions & deadlines
  useEffect(() => {
    try {
      localStorage.setItem('studyhub_planner_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed saving sessions:', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('studyhub_planner_deadlines', JSON.stringify(deadlines));
    } catch (e) {
      console.warn('Failed saving deadlines:', e);
    }
  }, [deadlines]);

  // Generate Schedule with AI
  const handleGenerateAISchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/study-planner-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          gradeLevel: currentGrade,
          days: horizonDays,
          hoursPerDay,
          goal: goalStrategy,
          projectDeadlines: deadlines.filter((d) => !d.isCompleted),
        }),
      });

      const data = await response.json();
      if (data.sessions && data.sessions.length > 0) {
        const formattedSessions: PlannedSession[] = data.sessions.map((s: any) => ({
          id: s.id || `session_${Math.random().toString(36).substring(2, 7)}`,
          dayLabel: s.dayLabel || 'Scheduled Day',
          timeSlot: s.timeSlot || '04:00 PM - 05:00 PM',
          subjectName: s.subjectName || subjects[0]?.name || 'General',
          topic: s.topic || 'Core Concept Review',
          taskType: s.taskType || 'Active Study',
          durationMinutes: s.durationMinutes || 60,
          priority: (s.priority === 'High' || s.priority === 'Medium' || s.priority === 'Low') ? s.priority : 'Medium',
          reminderAlertTime: s.reminderAlertTime || '15 mins before',
          taskDescription: s.taskDescription || 'Review key principles and practice active recall.',
          isCompleted: false,
        }));

        setSessions(formattedSessions);
      } else {
        throw new Error('No sessions returned from AI planner');
      }
    } catch (e) {
      console.warn('AI Planner generation warning, generating smart schedule locally:', e);
      // Fallback generator
      const generated: PlannedSession[] = [];
      const daysList = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      daysList.forEach((dayLabel, dIdx) => {
        subjects.slice(0, 3).forEach((subj, sIdx) => {
          generated.push({
            id: `gen_${dIdx}_${sIdx}_${Date.now()}`,
            dayLabel,
            timeSlot: sIdx === 0 ? '03:30 PM - 04:30 PM' : '04:45 PM - 05:45 PM',
            subjectName: subj.name,
            topic: `Key Concept Review ${dIdx + 1}`,
            taskType: subj.progress < 50 ? 'Exam Prep & Flashcards' : 'Practice Quiz & Notes',
            durationMinutes: 60,
            priority: subj.progress < 50 ? 'High' : 'Medium',
            reminderAlertTime: '15 mins before',
            taskDescription: `Focus on active recall for ${subj.name} (Current progress: ${subj.progress}%).`,
            isCompleted: false,
          });
        });
      });
      setSessions(generated);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle session completion
  const handleToggleSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  // Toggle deadline completion
  const handleToggleDeadline = (id: string) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isCompleted: !d.isCompleted } : d))
    );
  };

  // Add new deadline
  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadlineTitle.trim()) return;

    const newObj: ProjectDeadline = {
      id: `d_${Date.now()}`,
      title: newDeadlineTitle.trim(),
      subjectName: newDeadlineSubject,
      dueDate: newDeadlineDate,
      priority: newDeadlinePriority,
      description: newDeadlineDesc.trim(),
      isCompleted: false,
    };

    setDeadlines([newObj, ...deadlines]);
    setNewDeadlineTitle('');
    setNewDeadlineDesc('');
    setIsAddDeadlineOpen(false);
  };

  // Export schedule to markdown
  const handleExportSchedule = () => {
    let md = `# AI STUDY PLANNER SCHEDULE & DEADLINES\n`;
    md += `**Grade Level:** ${currentGrade}\n`;
    md += `**Strategy Goal:** ${goalStrategy}\n`;
    md += `**Generated Date:** ${new Date().toLocaleDateString()}\n\n`;

    md += `## UPCOMING PROJECT DEADLINES & EXAMS\n`;
    deadlines.forEach((d) => {
      md += `- [${d.isCompleted ? 'x' : ' '}] **${d.title}** (${d.subjectName}) - Due: ${d.dueDate} [Priority: ${d.priority}]\n`;
      if (d.description) md += `  *Note: ${d.description}*\n`;
    });

    md += `\n## DAILY STUDY TIMETABLE\n`;
    sessions.forEach((s) => {
      md += `- [${s.isCompleted ? 'x' : ' '}] **${s.dayLabel} | ${s.timeSlot}**: ${s.subjectName} - ${s.topic} (${s.durationMinutes} mins)\n`;
      md += `  *Task:* ${s.taskType} | *Alert:* ${s.reminderAlertTime || '15m'}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyHub_AI_Study_Planner_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const completedSessionsCount = sessions.filter((s) => s.isCompleted).length;
  const pendingSessionsCount = sessions.length - completedSessionsCount;
  const totalScheduledMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const pendingDeadlinesCount = deadlines.filter((d) => !d.isCompleted).length;

  const filteredSessions = sessions.filter(
    (s) => filterSubject === 'All' || s.subjectName === filterSubject
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#EBE7DF] dark:bg-[#1C271E] border border-[#D9D1C7] dark:border-[#2D3B2F] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 rounded-full text-blue-800 dark:text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>AI Automated Study Scheduler & Deadline Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] dark:text-[#E2EFE3] tracking-tight">
              Interactive AI Study Planner
            </h1>
            <p className="text-[#7A746B] dark:text-[#A2B5A3] text-sm mt-1 max-w-2xl">
              Auto-generate balanced study timetables, track project deadlines, configure reminder alerts, and auto-prioritize subjects based on progress.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={handleGenerateAISchedule}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>{isGenerating ? 'AI Scheduling...' : 'Auto-Generate AI Schedule'}</span>
            </button>

            <button
              onClick={() => setIsAddDeadlineOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-emerald-200" />
              <span>+ Add Deadline</span>
            </button>

            <button
              onClick={handleExportSchedule}
              className="px-3.5 py-2.5 bg-white dark:bg-[#121913] border border-[#D9D1C7] dark:border-[#2A372C] text-[#2C352E] dark:text-[#E2EFE3] hover:bg-[#F4F1EA] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export Schedule to Markdown"
            >
              <Download className="w-4 h-4 text-[#5A6D5B]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Top Overview Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#D9D1C7] dark:border-[#2D3B2F]">
          <div className="p-3.5 bg-white/80 dark:bg-[#121913]/80 rounded-2xl border border-[#E8E2D5] dark:border-[#2A372C]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3]">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Scheduled Study Hours</span>
            </div>
            <div className="text-xl font-bold text-[#2D362E] dark:text-[#E2EFE3] mt-1">
              {(totalScheduledMinutes / 60).toFixed(1)} hrs
            </div>
            <div className="text-[11px] text-[#7A746B] dark:text-[#8FA891]">
              Over {horizonDays} days ({hoursPerDay}h / day target)
            </div>
          </div>

          <div className="p-3.5 bg-white/80 dark:bg-[#121913]/80 rounded-2xl border border-[#E8E2D5] dark:border-[#2A372C]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sessions Completed</span>
            </div>
            <div className="text-xl font-bold text-[#2D362E] dark:text-[#E2EFE3] mt-1">
              {completedSessionsCount} / {sessions.length}
            </div>
            <div className="text-[11px] text-[#7A746B] dark:text-[#8FA891]">
              {sessions.length > 0 ? `${Math.round((completedSessionsCount / sessions.length) * 100)}% progress` : '0%'}
            </div>
          </div>

          <div className="p-3.5 bg-white/80 dark:bg-[#121913]/80 rounded-2xl border border-[#E8E2D5] dark:border-[#2A372C]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3]">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Pending Deadlines</span>
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingDeadlinesCount}
            </div>
            <div className="text-[11px] text-[#7A746B] dark:text-[#8FA891]">
              Projects & exam milestones
            </div>
          </div>

          <div className="p-3.5 bg-white/80 dark:bg-[#121913]/80 rounded-2xl border border-[#E8E2D5] dark:border-[#2A372C]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3]">
              <Target className="w-4 h-4 text-purple-600" />
              <span>Focus Priority</span>
            </div>
            <div className="text-base font-bold text-[#2D362E] dark:text-[#E2EFE3] mt-1 truncate">
              {subjects.length > 0 ? [...subjects].sort((a,b) => a.progress - b.progress)[0]?.name : 'General'}
            </div>
            <div className="text-[11px] text-[#7A746B] dark:text-[#8FA891]">
              Lowest current subject progress
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Customization Toolbar */}
      <div className="p-4 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          <div>
            <label className="block text-[11px] font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
              Schedule Goal Strategy
            </label>
            <select
              value={goalStrategy}
              onChange={(e) => setGoalStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F7F2] dark:bg-[#1C271E] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs font-semibold text-[#2C352E] dark:text-[#E2EFE3] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Balanced All-Subjects Schedule">Balanced All-Subjects Schedule</option>
              <option value="Exam Intensive Revision Sprint">Exam Intensive Revision Sprint</option>
              <option value="Project Deadline Crunch Mode">Project Deadline Crunch Mode</option>
              <option value="Weak Subjects Mastery Strategy">Weak Subjects Mastery Strategy</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
              Time Horizon
            </label>
            <select
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F9F7F2] dark:bg-[#1C271E] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs font-semibold text-[#2C352E] dark:text-[#E2EFE3] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks)</option>
              <option value={30}>30 Days (1 Month)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
              Daily Target Hours
            </label>
            <select
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F9F7F2] dark:bg-[#1C271E] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs font-semibold text-[#2C352E] dark:text-[#E2EFE3] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Hour / day</option>
              <option value={2}>2 Hours / day</option>
              <option value={3}>3 Hours / day</option>
              <option value={4}>4 Hours / day</option>
              <option value={6}>6 Hours / day (Exam Sprint)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Navigation View Selector Tabs */}
      <div className="flex items-center justify-between border-b border-[#E8E2D5] dark:border-[#2D3B2F] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'schedule'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] text-[#5A6D5B] dark:text-[#A2B5A3] hover:text-[#2C352E]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>AI Study Timetable ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveView('deadlines')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'deadlines'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] text-[#5A6D5B] dark:text-[#A2B5A3] hover:text-[#2C352E]'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Project Deadlines ({deadlines.length})</span>
          </button>

          <button
            onClick={() => setActiveView('priorities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'priorities'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] text-[#5A6D5B] dark:text-[#A2B5A3] hover:text-[#2C352E]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Subject Priorities Matrix</span>
          </button>
        </div>

        {/* Filter by Subject */}
        {activeView === 'schedule' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5A6D5B] dark:text-[#A2B5A3] hidden sm:inline">Filter Subject:</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs font-semibold text-[#2C352E] dark:text-[#E2EFE3]"
            >
              <option value="All">All Enrolled Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View Content 1: AI Study Timetable Sessions List */}
      {activeView === 'schedule' && (
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-2xl space-y-3">
              <Calendar className="w-8 h-8 text-[#5A6D5B] mx-auto opacity-50" />
              <div className="text-sm font-bold text-[#2C352E] dark:text-[#E2EFE3]">No study sessions found</div>
              <p className="text-xs text-[#5A6D5B] max-w-md mx-auto">
                Click "Auto-Generate AI Schedule" above to create a personalized study roadmap tailored to your enrolled subjects.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  session.isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-75'
                    : 'bg-white dark:bg-[#121913] border-[#E8E2D5] dark:border-[#2A372C] hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleSession(session.id)}
                    className="mt-0.5 p-1 rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                    title={session.isCompleted ? 'Mark as incomplete' : 'Mark session completed'}
                  >
                    {session.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#A2B5A3] hover:text-emerald-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-[#F4F1EA] dark:bg-[#1C271E] text-[#5A6D5B] dark:text-[#A2B5A3] text-[11px] font-bold rounded-md">
                        {session.dayLabel}
                      </span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {session.timeSlot}
                      </span>
                      <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-[11px] font-semibold rounded-full">
                        {session.subjectName}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        session.priority === 'High' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}>
                        {session.priority} Priority
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold ${session.isCompleted ? 'line-through text-[#5A6D5B]' : 'text-[#2C352E] dark:text-[#E2EFE3]'}`}>
                      {session.topic}
                    </h3>
                    <p className="text-xs text-[#5A6D5B] dark:text-[#8FA891]">
                      {session.taskDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3] shrink-0 self-end md:self-center">
                  <div className="flex items-center gap-1 bg-[#F4F1EA] dark:bg-[#1C271E] px-2.5 py-1 rounded-lg">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>{session.reminderAlertTime || '15 mins before'}</span>
                  </div>
                  <button
                    onClick={() => setSessions(sessions.filter((s) => s.id !== session.id))}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View Content 2: Project Deadlines & Reminders */}
      {activeView === 'deadlines' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2C352E] dark:text-[#E2EFE3]">
              School & University Project Deadlines
            </h2>
            <button
              onClick={() => setIsAddDeadlineOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Deadline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deadlines.map((dl) => (
              <div
                key={dl.id}
                className={`p-4 rounded-2xl border transition-all ${
                  dl.isCompleted
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-70'
                    : 'bg-white dark:bg-[#121913] border-[#E8E2D5] dark:border-[#2A372C]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-md">
                        {dl.subjectName}
                      </span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">
                        Due: {dl.dueDate}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold ${dl.isCompleted ? 'line-through text-[#5A6D5B]' : 'text-[#2C352E] dark:text-[#E2EFE3]'}`}>
                      {dl.title}
                    </h3>
                    {dl.description && (
                      <p className="text-xs text-[#5A6D5B] dark:text-[#8FA891]">
                        {dl.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleDeadline(dl.id)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {dl.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#A2B5A3]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Content 3: Subject Priorities Matrix */}
      {activeView === 'priorities' && (
        <div className="p-5 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-2xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#2C352E] dark:text-[#E2EFE3]">
              AI Subject Progress & Priority Allocation Matrix
            </h2>
            <p className="text-xs text-[#5A6D5B] dark:text-[#8FA891]">
              StudyHub automatically allocates more study hours to subjects with lower progress or impending exams.
            </p>
          </div>

          <div className="space-y-3">
            {subjects.map((s) => {
              const priorityTag = s.progress < 50 ? 'High' : s.progress < 75 ? 'Medium' : 'Maintenance';
              return (
                <div key={s.id} className="p-3.5 bg-[#F9F7F2] dark:bg-[#1C271E] rounded-xl border border-[#E8E2D5] dark:border-[#2A372C] flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#2C352E] dark:text-[#E2EFE3]">{s.name}</span>
                      <span className="text-[#5A6D5B] dark:text-[#A2B5A3]">{s.progress}% Mastered</span>
                    </div>

                    <div className="w-full h-2 bg-[#E8E2D5] dark:bg-[#2A372C] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          s.progress < 50 ? 'bg-red-500' : s.progress < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                      priorityTag === 'High' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                        : priorityTag === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {priorityTag} Priority
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal to Add Custom Deadline */}
      {isAddDeadlineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D8D2C2] dark:border-[#2D3B2F] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#2C352E] dark:text-[#E2EFE3] mb-4">
              Add Project Deadline / Exam Goal
            </h3>

            <form onSubmit={handleAddDeadline} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
                  Deadline Title *
                </label>
                <input
                  type="text"
                  required
                  value={newDeadlineTitle}
                  onChange={(e) => setNewDeadlineTitle(e.target.value)}
                  placeholder="e.g. History Term Essay or Math Midterm"
                  className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
                    Subject
                  </label>
                  <select
                    value={newDeadlineSubject}
                    onChange={(e) => setNewDeadlineSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadlineDate}
                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
                  Priority Level
                </label>
                <select
                  value={newDeadlinePriority}
                  onChange={(e) => setNewDeadlinePriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3]"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A6D5B] dark:text-[#A2B5A3] mb-1">
                  Notes / Description
                </label>
                <textarea
                  value={newDeadlineDesc}
                  onChange={(e) => setNewDeadlineDesc(e.target.value)}
                  placeholder="Additional details..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl text-xs text-[#2C352E] dark:text-[#E2EFE3] h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeadlineOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A6D5B] dark:text-[#A2B5A3] hover:bg-black/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-700"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
