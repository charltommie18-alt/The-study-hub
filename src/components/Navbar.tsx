import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Flame, 
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
  Trophy, 
  Users, 
  Moon, 
  Sun, 
  Settings, 
  Crown, 
  Download, 
  Keyboard, 
  Calendar, 
  Award, 
  Headphones, 
  PenTool 
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
  onOpenShortcuts?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenInstallModal?: () => void;
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
  onOpenShortcuts,
  onOpenSubscriptionModal,
  onOpenInstallModal,
  isDarkMode,
  onToggleDarkMode,
  totalFocusMinutes,
  streakDays,
  isOffline = false,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'notes', label: 'AI Summarizer', icon: BookOpen },
    { id: 'mockexam', label: 'Past Exams & Memos', icon: Award },
    { id: 'podcast', label: 'Audio Podcasts', icon: Headphones },
    { id: 'canvas', label: 'Visual Lab', icon: PenTool },
    { id: 'flashcards', label: 'Smart Cards', icon: Layers },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'upload', label: 'Upload PDF / Docs', icon: FileUp },
    { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
    { id: 'focus', label: 'Focus Studio', icon: Timer },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareText },
    { id: 'achievements', label: 'Achievements & XP', icon: Trophy },
    { id: 'studyroom', label: 'Peer Study Rooms', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin (12021)', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Navbar Top Row */}
        <div className="flex items-center justify-between min-h-[56px] py-2 gap-2 sm:gap-4">
          
          {/* Brand Logo & Network Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  StudyHub
                </span>
                
                {/* Network Status Badge */}
                {isOffline ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-amber-800 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-full" title="Running in Offline Local AI mode">
                    <WifiOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                    <span className="hidden xs:inline">Offline</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-full" title="Connected to Cloud AI">
                    <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden xs:inline">Online</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:block">Grade 7 to University AI Engine</p>
            </div>
          </div>

          {/* Grade & Subject Selector Controls (Visible in Desktop Top Row) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Grade Level Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <select
                value={currentGrade}
                onChange={(e) => onSelectGrade(e.target.value as GradeLevel)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                {GRADE_CONFIGS.map((g) => (
                  <option key={g.id} value={g.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenAddSubject}
                title="Add New Subject"
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Action Counters, Dark Mode Toggle & Quick Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dark Mode Quick Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className={`p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to High-Contrast Late-Night Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
            </button>

            {/* App Settings Modal Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Open App Settings"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Keyboard Shortcuts Trigger */}
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                title="Keyboard Shortcuts Cheat Sheet (Ctrl+/)"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>⌘K</span>
              </button>
            )}

            {/* Install App to Homescreen Button */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Download StudyHub App to Homescreen / Offline PWA"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Install</span>
              </button>
            )}

            {/* Subscription Pro Plan Button */}
            {onOpenSubscriptionModal && (
              <button
                onClick={onOpenSubscriptionModal}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Pro Subscription Plan & 7-Day Free Trial"
              >
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200 fill-amber-200/30" />
                <span>Pro</span>
              </button>
            )}

            {/* WhatsApp Companion Button */}
            <button
              onClick={onOpenWhatsApp}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-700 rounded-full text-emerald-800 dark:text-emerald-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Share notes & flashcards on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700 rounded-full text-amber-800 dark:text-amber-200 text-[11px] sm:text-xs font-bold shrink-0">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500/40" />
              <span>{streakDays}d</span>
            </div>

            {/* Plan Roadmap Generator Button */}
            <button
              onClick={onOpenAddPlan}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white text-xs font-bold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin-slow" />
              <span>AI Roadmap</span>
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Grade & Subject Bar (Ensures No Wrapping/Clipping on Mobile) */}
        <div className="flex lg:hidden items-center gap-2 pb-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          {/* Grade Selector Pill */}
          <div className="flex-1 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs min-w-0">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <select
              value={currentGrade}
              onChange={(e) => onSelectGrade(e.target.value as GradeLevel)}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer w-full truncate"
            >
              {GRADE_CONFIGS.map((g) => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector Pill */}
          <div className="flex-1 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs min-w-0">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer w-full truncate"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenAddSubject}
              title="Add New Subject"
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800 scrollbar-none">
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
                      ? 'bg-amber-600 text-white shadow-md font-bold'
                      : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 dark:from-indigo-500 dark:via-cyan-500 dark:to-emerald-400 text-white shadow-md shadow-indigo-500/20 font-bold scale-[1.02]'
                    : isAdmin
                    ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 font-bold border border-amber-200 dark:border-amber-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : isAdmin ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
