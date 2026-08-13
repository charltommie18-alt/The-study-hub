import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'data';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, defaultTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'data'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#1A221C] border border-[#E3DDD3] dark:border-[#334235] rounded-3xl shadow-2xl overflow-hidden transition-all text-[#2D362E] dark:text-[#F4F1EA]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white">
                StudyHub Legal & Compliance Center
              </h2>
              <p className="text-xs text-blue-100">
                Google Play Store & Amazon Appstore Standard Terms, Privacy & Student Data Protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-3 bg-[#EBE7DF] dark:bg-[#161C17] border-b border-[#D9D1C7] dark:border-[#2B382D]">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[#7A746B] dark:text-[#A6C4A7] hover:bg-[#D9D1C7]/50 dark:hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[#7A746B] dark:text-[#A6C4A7] hover:bg-[#D9D1C7]/50 dark:hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'data'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[#7A746B] dark:text-[#A6C4A7] hover:bg-[#D9D1C7]/50 dark:hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student Data Protection</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs leading-relaxed text-[#3C3C3B] dark:text-[#E6E1D8]">
          
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-900 dark:text-blue-200 text-[11px]">
                  <strong>Play Store & Amazon Appstore Compliant:</strong> StudyHub operates on an offline-first architecture. Your uploaded study notes, generated flashcards, and focus timers are stored locally on your device.
                </p>
              </div>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">1. Information We Collect</h3>
              <p>
                StudyHub does not sell, license, or transmit personal student information to third-party ad networks. We store local application state (subjects, notes, quiz scores, and settings) directly in your device’s browser storage (`localStorage`).
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">2. AI Processing & Gemini Security</h3>
              <p>
                When using AI Note Summarization or AI Tutor features, raw text input is securely processed via server-side Google Gemini proxy endpoints. No personally identifiable student information is attached to AI queries.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">3. Push Notifications & Local Permissions</h3>
              <p>
                Push notifications for Pomodoro peak study hours are generated locally via native web APIs. You may grant or revoke notification permissions at any time in App Settings.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-900 dark:text-emerald-200 text-[11px]">
                  <strong>Academic Integrity Commitment:</strong> StudyHub is designed to assist comprehension, active recall, and spaced repetition. Users agree to abide by academic ethics guidelines.
                </p>
              </div>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">1. Use of Service</h3>
              <p>
                StudyHub provides study tools including AI note summaries, practice quiz generators, and Pomodoro focus timers. The service is provided for educational purposes across High School, CAPE, and University levels.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">2. User Content & Intellectual Property</h3>
              <p>
                You retain complete ownership of all notes, documents, and flashcard decks created or uploaded within the application. You can export or clear your local data at any time.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">3. Appstore Distribution Terms</h3>
              <p>
                Distribution through Google Play Store (`com.studyhub.app`) and Amazon Appstore (`com.amazon.studyhub`) complies with developer distribution guidelines and content safety standards.
              </p>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-900 dark:text-amber-200 text-[11px]">
                  <strong>Student Safety & COPPA Standard:</strong> StudyHub implements strict data isolation, zero tracking cookies, and local data persistence.
                </p>
              </div>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">1. Zero Third-Party Advertising</h3>
              <p>
                StudyHub contains zero advertisements, popups, or external tracking scripts. Your study environment remains 100% focused and distraction-free.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">2. Data Storage Control</h3>
              <p>
                All student progress, quiz results, and focus logs remain stored on your device. You can clear your data instantly using the Admin dashboard or browser cache controls.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EBE7DF] dark:bg-[#161C17] border-t border-[#D9D1C7] dark:border-[#2B382D] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
