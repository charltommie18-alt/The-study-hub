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
            Trial Period Expired
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
            Your 7-Day Free Trial Has Ended
          </h2>
          <p className="text-xs text-rose-100 mt-1 max-w-sm mx-auto">
            Account: <strong>{userEmail}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-semibold mb-1">Your notes, flashcards, and progress are securely preserved!</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              As stated during sign-in, after your 7-day free trial ends, The Study Hub Pro must be activated after payment confirmation to continue using all learning tools.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Activate Pro to Instantly Resume:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>All Notes & Summaries</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Smart Flashcards</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>AI Socratic Voice Tutor</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Past Exam Memos</span>
              </div>
            </div>
          </div>

          <div className="pt-3 space-y-3">
            <button
              onClick={onOpenPaymentModal}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Enter Payment Details & Activate Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
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
