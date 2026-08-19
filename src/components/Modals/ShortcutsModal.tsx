import React from 'react';
import { X, Keyboard, Zap, Sparkles, FileText, Clock, Brain, FileQuestion, Layers, BarChart2, MessageSquare, ShieldCheck } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keyCombo: 'Ctrl + N', macCombo: '⌘ + N', action: 'Open Notes Summarizer', icon: FileText, desc: 'Jump straight to AI Note Summaries & Study Notes' },
    { keyCombo: 'Ctrl + F', macCombo: '⌘ + F', action: 'Open Focus Pomodoro Timer', icon: Clock, desc: 'Launch 25m Pomodoro focus session & ambient soundscapes' },
    { keyCombo: 'Ctrl + T', macCombo: '⌘ + T', action: 'Launch AI Tutor Chat', icon: Brain, desc: 'Open interactive Socratic AI Tutor session' },
    { keyCombo: 'Ctrl + Q', macCombo: '⌘ + Q', action: 'Open Adaptive Quiz Studio', icon: FileQuestion, desc: 'Start an active recall diagnostic exam' },
    { keyCombo: 'Ctrl + S', macCombo: '⌘ + S', action: 'Open Flashcard Decks', icon: Layers, desc: 'Review flashcards with Leitner spaced repetition' },
    { keyCombo: 'Ctrl + U', macCombo: '⌘ + U', action: 'Open Document OCR / Upload', icon: Sparkles, desc: 'Upload PDF / textbook image for instant AI processing' },
    { keyCombo: 'Ctrl + A', macCombo: '⌘ + A', action: 'Open Analytics Dashboard', icon: BarChart2, desc: 'Track study velocity, retention stats & weak topics' },
    { keyCombo: 'Ctrl + K', macCombo: '⌘ + K', action: 'Toggle Floating AI Notepad', icon: MessageSquare, desc: 'Open floating scratchpad & quick voice assistant' },
    { keyCombo: 'Ctrl + /', macCombo: '⌘ + /', action: 'Toggle Shortcuts Cheat Sheet', icon: Keyboard, desc: 'Display or hide this power-user navigation menu' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D8D2C2] dark:border-[#2D3B2F] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8E2D5] dark:border-[#2D3B2F]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2C352E] dark:text-[#E2EFE3]">Power-User Keyboard Shortcuts</h2>
              <p className="text-xs text-[#5A6D5B] dark:text-[#A2B5A3]">Navigate StudyHub at lightning speed using hotkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5A6D5B] hover:text-[#2C352E] dark:text-[#A2B5A3] dark:hover:text-[#E2EFE3] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div 
                key={idx}
                className="p-3 bg-white dark:bg-[#121913] border border-[#E8E2D5] dark:border-[#2A372C] rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-[#F4F1EA] dark:bg-[#1C271E] text-[#5A6D5B] dark:text-[#8FA891] rounded-lg">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2C352E] dark:text-[#E2EFE3] truncate">{s.action}</div>
                    <div className="text-[11px] text-[#5A6D5B] dark:text-[#8FA891] truncate">{s.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <kbd className="px-2 py-1 bg-[#F4F1EA] dark:bg-[#233125] border border-[#D8D2C2] dark:border-[#344837] text-[11px] font-mono font-bold text-[#2C352E] dark:text-[#E2EFE3] rounded-md shadow-xs">
                    {s.keyCombo}
                  </kbd>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Efficiency Footer */}
        <div className="mt-5 pt-3 border-t border-[#E8E2D5] dark:border-[#2D3B2F] flex items-center justify-between text-xs text-[#5A6D5B] dark:text-[#8FA891]">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Cloning & Security Firewall Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#5A6D5B] text-white hover:bg-[#4A5D4B] dark:bg-[#2D3B2F] dark:hover:bg-[#3B4C3E] rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
}
