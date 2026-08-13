import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Flame, 
  Clock, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Timer, 
  MessageSquareText, 
  BarChart3,
  Plus,
  Wifi,
  WifiOff,
  MessageCircle,
  FileUp,
  Shield,
  Smartphone,
  Trophy,
  Users,
  Moon,
  Sun,
  Settings
} from 'lucide-react';
import { TabType, Subject, GradeLevel } from '../types';
import { GRADE_CONFIGS } from '../data/initialData';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  subjects: Subject[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onOpenAddSubject: () => void;
  onOpenAddPlan: () => void;
  onOpenWhatsApp: () => void;
  onOpenStoreModal: () => void;
  onOpenSettings: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  totalFocusMinutes: number;
  streakDays: number;
  isOffline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  currentGrade,
  onSelectGrade,
  onOpenAddSubject,
  onOpenAddPlan,
  onOpenWhatsApp,
  onOpenStoreModal,
  onOpenSettings,
  isDarkMode,
  onToggleDarkMode,
  totalFocusMinutes,
  streakDays,
  isOffline = false,
}) => {
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'notes', label: 'AI Summarizer', icon: BookOpen },
    { id: 'upload', label: 'Upload PDF / Docs', icon: FileUp },
    { id: 'flashcards', label: 'Smart Cards', icon: Layers },
    { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
    { id: 'focus', label: 'Focus Studio', icon: Timer },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareText },
    { id: 'achievements', label: 'Achievements & XP', icon: Trophy },
    { id: 'studyroom', label: 'Peer Study Rooms', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin (12021)', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#EBE7DF]/90 backdrop-blur-md border-b border-[#D9D1C7] text-[#3C3C3B] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Network Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-[#2D362E]">
                  StudyHub
                </span>
                
                {/* Network Status Badge */}
                {isOffline ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#B87D4B] bg-[#FDF1E6] border border-[#E8D1BE] rounded-full" title="Running in Offline Local AI mode">
                    <WifiOff className="w-3 h-3 text-[#B87D4B]" />
                    <span>Offline Engine</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#5A6D5B] bg-[#E2EFE3] border border-[#C5DCC6] rounded-full" title="Connected to Cloud AI">
                    <Wifi className="w-3 h-3 text-[#5A6D5B]" />
                    <span>Online AI</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C857A] hidden sm:block">Grade 7 to University Study Engine</p>
            </div>
          </div>

          {/* Grade & Subject Selector Controls */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Grade Level Selector */}
            <div className="flex items-center gap-1.5 bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-2.5 py-1.5 shadow-xs">
              <GraduationCap className="w-3.5 h-3.5 text-[#5A6D5B]" />
              <select
                value={currentGrade}
                onChange={(e) => onSelectGrade(e.target.value as GradeLevel)}
                className="bg-transparent text-xs font-bold text-[#2D362E] focus:outline-none cursor-pointer"
              >
                {GRADE_CONFIGS.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#F9F7F2] text-[#2D362E]">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-2.5 py-1.5 shadow-xs">
              <span className="text-xs font-medium text-[#7A746B]">Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#2D362E] focus:outline-none cursor-pointer pr-1"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#F9F7F2] text-[#2D362E]">
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenAddSubject}
                title="Add New Subject"
                className="p-0.5 hover:bg-[#EBE7DF] text-[#5A6D5B] rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Action Counters, Dark Mode Toggle & Settings Button */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Quick Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-[#F9F7F2] hover:bg-[#F2EFE9] text-[#5A6D5B] border-[#D9D1C7]'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to High-Contrast Late-Night Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#5A6D5B]" />}
            </button>

            {/* App Settings Modal Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 bg-[#F9F7F2] hover:bg-[#F2EFE9] border border-[#D9D1C7] rounded-full text-[#5A6D5B] transition-all cursor-pointer"
              title="Open App Settings (Late-Night Theme, Notifications, Grade)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* WhatsApp Companion Button */}
            <button
              onClick={onOpenWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-full text-emerald-900 dark:text-emerald-200 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Share notes & flashcards on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 fill-emerald-600/30" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-full text-amber-900 dark:text-amber-200 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500/40" />
              <span>{streakDays}d</span>
            </div>

            {/* Total Focus Hours */}
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 dark:bg-cyan-950/80 border border-blue-300 dark:border-cyan-700 rounded-full text-blue-900 dark:text-cyan-200 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-300" />
              <span>{Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m</span>
            </div>

            {/* Plan Roadmap Generator Button */}
            <button
              onClick={onOpenAddPlan}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-xs font-bold rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin-slow" />
              <span>AI Roadmap</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#D9D1C7] dark:border-[#2C3B2E] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdmin = item.id === 'admin';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? isAdmin
                      ? 'bg-amber-800 text-white shadow-md font-bold'
                      : 'bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 dark:from-emerald-500 dark:to-cyan-500 text-white shadow-md shadow-blue-500/20 dark:shadow-emerald-500/20 font-bold scale-[1.02]'
                    : isAdmin
                    ? 'text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 font-bold border border-amber-300'
                    : 'text-[#575047] dark:text-[#A6C4A7] hover:text-[#2D362E] dark:hover:text-white hover:bg-blue-50/80 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isAdmin ? 'text-amber-800 dark:text-amber-300' : 'text-blue-600 dark:text-emerald-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};


