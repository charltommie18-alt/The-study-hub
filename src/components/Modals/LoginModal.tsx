import React, { useState } from 'react';
import { Mail, UserPlus, LogIn, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { loginWithEmail, isAdminEmail } from '../../utils/auth';
import type { UserAccount } from '../../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onLoggedIn: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = loginWithEmail(email, mode === 'signup' ? name : undefined);
      onLoggedIn(user);
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
            Sign in with email to use the app. New accounts get a <strong>7-day free Pro trial</strong> that
            starts when you create your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#EBE7DF] dark:bg-[#1C241E] text-[#2D362E] dark:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-1 justify-center w-full">
                <UserPlus className="w-3.5 h-3.5" /> Create account
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#EBE7DF] dark:bg-[#1C241E] text-[#2D362E] dark:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-1 justify-center w-full">
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </span>
            </button>
          </div>

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
              Admin email detected — this account stays <strong>always free</strong> with full access (no trial
              limit).
            </div>
          )}

          {!adminHint && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              Your <strong>7-day free trial</strong> starts the moment you create your account or sign in for the
              first time.
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-sm cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'signup' ? 'Create account & start free trial' : 'Sign in'}
          </button>

          <p className="text-[10px] text-center text-[#8C857A] dark:text-[#A6C4A7]">
            By continuing you agree to the in-app Privacy Policy and Terms. Cancel anytime in Subscription.
          </p>
        </form>
      </div>
    </div>
  );
};
