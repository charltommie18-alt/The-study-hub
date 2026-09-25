import React, { useState } from 'react';
import { Mail, UserPlus, LogIn, ShieldCheck, Sparkles, Flame, KeyRound, Shield } from 'lucide-react';
import { loginWithEmail, loginWithAdminPin, isAdminEmail } from '../../utils/auth';
import type { UserAccount } from '../../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onLoggedIn: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>('signup');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'admin') {
        const user = loginWithAdminPin(adminPin);
        onLoggedIn(user);
      } else {
        const user = loginWithEmail(email, mode === 'signup' ? name : undefined);
        onLoggedIn(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  const adminHint = isAdminEmail(email);

  return (
    <div className="fixed inset-0 z-[100] bg-[#2D362E]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#F9F7F2] dark:bg-[#121613] w-full max-w-md rounded-[28px] shadow-2xl border border-[#D9D1C7] dark:border-[#2B382D] overflow-hidden">
        <div className="p-6 border-b border-[#EBE7DF] dark:border-[#2C3B2E]">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold text-[#2D362E] dark:text-white">The Study Hub</h1>
          </div>
          <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
            Sign in to start your <strong>7-day free trial</strong> automatically. Trial includes all basic functions (Notes, Flashcards, Planner, Quizzes, Focus Studio). Pro features activate upon verified payment confirmation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`py-2 text-[11px] font-bold rounded-xl cursor-pointer ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[#EBE7DF] dark:bg-[#1C241E] text-[#2D362E] dark:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-1 justify-center w-full">
                <UserPlus className="w-3.5 h-3.5" /> Create account
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 text-[11px] font-bold rounded-xl cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[#EBE7DF] dark:bg-[#1C241E] text-[#2D362E] dark:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-1 justify-center w-full">
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </span>
            </button>
          </div>

          {mode === 'admin' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex gap-2">
                <Shield className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  Enter your confidential 5-digit Admin Security PIN to unlock administrator privileges.
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#736B5E] dark:text-[#A6C4A7]">Admin Security PIN</label>
                <input
                  type="password"
                  maxLength={5}
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••••"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#D9D1C7] dark:border-[#2B382D] bg-white dark:bg-[#1C241E] text-center text-lg font-mono font-bold tracking-widest text-[#2D362E] dark:text-white"
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <>
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-bold text-[#736B5E] dark:text-[#A6C4A7]">Display name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#D9D1C7] dark:border-[#2B382D] bg-white dark:bg-[#1C241E] text-sm text-[#2D362E] dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[#736B5E] dark:text-[#A6C4A7]">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C857A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#D9D1C7] dark:border-[#2B382D] bg-white dark:bg-[#1C241E] text-sm text-[#2D362E] dark:text-white"
                  />
                </div>
              </div>

              {adminHint && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Admin email detected — this account stays <strong>always free</strong> with full access.
                </div>
              )}

              {!adminHint && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />
                  <div>
                    Your <strong>7-day free trial starts automatically</strong> upon sign-in with full access to basic study tools. Pro features activate upon payment confirmation.
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || (mode === 'admin' && adminPin.length !== 5)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-sm cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'admin' ? 'Unlock as Administrator' : mode === 'signup' ? 'Create account & start free trial' : 'Sign in'}
          </button>

          <p className="text-[10px] text-center text-[#8C857A] dark:text-[#A6C4A7]">
            By continuing you agree to the in-app Privacy Policy and Terms. Cancel anytime in Subscription.
          </p>

          <div className="pt-2 border-t border-[#EBE7DF] dark:border-[#2C3B2E] text-center">
            {mode === 'admin' ? (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[11px] text-[#7A746B] dark:text-[#A6C4A7] hover:underline cursor-pointer"
              >
                ← Return to Learner Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode('admin'); setError(''); }}
                className="text-[10px] text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                title="Administrator access"
              >
                <KeyRound className="w-3 h-3" />
                <span>Admin access</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
