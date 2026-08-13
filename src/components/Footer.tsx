import React, { useState } from 'react';
import { 
  GraduationCap, 
  Smartphone, 
  Play, 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Heart, 
  Sparkles,
  BookOpen,
  Timer,
  HelpCircle,
  MessageSquareText,
  BarChart3,
  HardDrive,
  Settings
} from 'lucide-react';
import { TabType, GradeLevel } from '../types';
import { PolicyModal } from './Modals/PolicyModal';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
  onOpenStoreModal: () => void;
  onOpenSettings: () => void;
  currentGrade: GradeLevel;
  isDarkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  onOpenStoreModal,
  onOpenSettings,
  currentGrade,
  isDarkMode,
}) => {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyDefaultTab, setPolicyDefaultTab] = useState<'privacy' | 'terms' | 'data'>('privacy');

  const openPolicy = (tab: 'privacy' | 'terms' | 'data') => {
    setPolicyDefaultTab(tab);
    setIsPolicyOpen(true);
  };

  return (
    <footer className="mt-16 bg-gradient-to-b from-[#EBE7DF] to-[#E2DDD3] dark:from-[#161C17] dark:to-[#0F1410] border-t border-[#D9D1C7] dark:border-[#2C3B2E] text-[#3C3C3B] dark:text-[#E6E1D8] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Top Banner Row: Appstore & Playstore Tabs & Saved Settings Status */}
        <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 dark:from-emerald-950 dark:via-teal-900 dark:to-cyan-950 text-white rounded-3xl p-6 shadow-xl border border-white/20 dark:border-emerald-500/30 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 dark:bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-white/20 dark:border-emerald-400/30 shrink-0">
              <Smartphone className="w-7 h-7 text-emerald-200 dark:text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-400/20 border border-emerald-300/40 text-emerald-100 dark:text-emerald-300 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3 fill-emerald-200" />
                  <span>Google Play Ready</span>
                </span>
                <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-300/40 text-amber-100 dark:text-amber-200 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-amber-200" />
                  <span>Amazon Appstore Ready</span>
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                StudyHub Mobile & Tablet App Stores
              </h3>
              <p className="text-xs text-blue-100 dark:text-emerald-200 mt-0.5 max-w-xl">
                Configured with PWA offline caching, native notifications, and Android SDK 34 targets.
              </p>
            </div>
          </div>

          {/* Buttons: Store Readiness & Settings Confirmation */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <div className="px-3 py-2 bg-white/10 dark:bg-emerald-900/40 border border-white/20 dark:border-emerald-400/30 rounded-2xl text-xs font-semibold text-emerald-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>All Settings Saved Locally</span>
            </div>

            <button
              onClick={onOpenStoreModal}
              className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-gray-950 font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-blue-700 dark:text-gray-950" />
              <span>Open App Store Center</span>
            </button>
          </div>
        </div>

        {/* Main Footer Links & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          
          {/* Column 1: Brand & Philosophy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-[#2D362E] dark:text-white tracking-tight">
                StudyHub CAPE
              </span>
            </div>
            <p className="text-xs text-[#7A746B] dark:text-[#B5AEA3] leading-relaxed">
              Empowering Caribbean and international high school & university students with AI summarization, spaced-repetition flashcards, practice exam generators, and Pomodoro focus tracking.
            </p>

            <button
              onClick={onOpenSettings}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F9F7F2] dark:bg-[#1C231E] hover:bg-blue-50 dark:hover:bg-emerald-900/30 border border-[#D9D1C7] dark:border-[#334235] text-[#2D362E] dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
              <span>Configure App Settings</span>
            </button>
          </div>

          {/* Column 2: Quick Study Tools */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-emerald-400">
              Study Workspaces
            </h4>
            <ul className="space-y-1.5 text-xs text-[#575047] dark:text-[#C8C2B8]">
              <li>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
                  <span>AI Note Summarizer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('focus')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Focus Studio & Pomodoro</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Practice Exam Engine</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('tutor')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Socratic AI Tutor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Analytics & Progress Report</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: AppStore Deployment & Mobile Readiness */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-emerald-400">
              App Stores & Mobile
            </h4>
            <ul className="space-y-2 text-xs text-[#575047] dark:text-[#C8C2B8]">
              <li className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
                <span>Google Play Store (`com.studyhub.app`)</span>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Amazon Appstore (`com.amazon.studyhub`)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <span>Target SDK 34 (Android 14)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400 shrink-0" />
                <span>Offline PWA Caching Enabled</span>
              </li>
            </ul>
          </div>

          {/* Column 4: App Policies & Compliance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-emerald-400">
              Legal & Student Safety Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#575047] dark:text-[#C8C2B8]">
              <li>
                <button
                  onClick={() => openPolicy('privacy')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2 text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
                  <span>Privacy Policy (Play Store Compliant)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicy('terms')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2 text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicy('data')}
                  className="hover:text-blue-600 dark:hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-2 text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Student Data Protection (COPPA)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Grade Info */}
        <div className="pt-6 border-t border-[#D9D1C7] dark:border-[#2C3B2E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A746B] dark:text-[#B5AEA3]">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} StudyHub CAPE Learning Platform. Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for students.</span>
          </p>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-lg text-[11px] font-bold text-blue-700 dark:text-emerald-300">
              Grade Level: {currentGrade.toUpperCase()}
            </span>

            <span className="text-[11px]">
              Offline Encryption: <strong className="text-emerald-700 dark:text-emerald-400">Active</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        defaultTab={policyDefaultTab}
      />
    </footer>
  );
};
