import React, { useState } from 'react';
import { AlertTriangle, Crown, CreditCard, ShieldCheck, LogOut, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { SubscriptionState } from '../../types';

interface TrialExpiredLockModalProps {
  isOpen: boolean;
  subscription: SubscriptionState;
  userEmail: string;
  onOpenPaymentModal: () => void;
  onLogout: () => void;
}

export const TrialExpiredLockModal: React.FC<TrialExpiredLockModalProps> = ({
  isOpen,
  subscription,
  userEmail,
  onOpenPaymentModal,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-rose-300 dark:border-rose-900/60 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-6 text-white text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xs border border-white/30 shadow-inner">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            🔒 Hardcoded Anti-Reset Lock Active
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
            Trial Period Expired — Account Locked
          </h2>
          <p className="text-xs text-rose-100 mt-1 max-w-sm mx-auto">
            Account: <strong>{userEmail}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-900 dark:text-rose-200">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Trial Resetting Permanently Prohibited</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Your 7-day free trial has concluded. A hardcoded security lock is enforced: <strong>this trial cannot be reset</strong> by signing out, clearing cache, or re-entering. To regain access to your notes, memos, and AI tutor, you must subscribe.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Subscribe to Instantly Unlock All Features:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All Notes & Summaries</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Smart Flashcards & SRS</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>AI Socratic Voice Tutor</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Past Exam Memos & Labs</span>
              </div>
            </div>

            {/* Special Promo Highlight Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-emerald-500/10 border-2 border-amber-400 dark:border-amber-600/80 text-[11px] text-amber-950 dark:text-amber-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>🔥 Special Flash Deal Active (60% Off):</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                  $1.99 / mo
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                <span>🌍 <strong>PayPal / Debit Card:</strong></span>
                <div className="text-right">
                  <span className="line-through text-slate-400 text-[10px] mr-1.5">$4.99</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">$1.99 / mo</strong>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>🇿🇦 <strong>Capitec Bank EFT:</strong></span>
                <div className="text-right">
                  <span className="line-through text-slate-400 text-[10px] mr-1.5">R89.00</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">R35.00 / mo</strong>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                Capitec Acc: <strong className="font-mono text-slate-800 dark:text-slate-200">2557334258</strong> • Instant clearance on PayPal/Card
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={onOpenPaymentModal}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 hover:from-red-700 hover:via-amber-700 hover:to-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Unlock Account for $1.99 Special Rate</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out (Account remains locked until subscribed)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Secure 256-bit checkout • Cancel anytime</span>
          </div>
        </div>

      </div>
    </div>
  );
};
