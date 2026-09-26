import React, { useState } from 'react';
import { Lock, X, KeyRound, Shield, CheckCircle2 } from 'lucide-react';
import { verifyAdminPin } from '../../utils/auth';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: (pin: string) => void;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pinInput.trim();
    if (verifyAdminPin(clean)) {
      setError(false);
      setPinInput('');
      onUnlocked(clean);
      onClose();
    } else {
      setError(true);
      setPinInput('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 5) {
      const next = pinInput + digit;
      setPinInput(next);
      setError(false);
      if (next.length === 5) {
        if (verifyAdminPin(next)) {
          setError(false);
          setPinInput('');
          onUnlocked(next);
          onClose();
        } else {
          setError(true);
          setPinInput('');
        }
      }
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#121613] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Security Access</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Owner verification required for Charl Tommie
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              autoComplete="off"
              maxLength={5}
              value={pinInput}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '');
                setPinInput(next);
                setError(false);
                if (next.length === 5) {
                  if (verifyAdminPin(next)) {
                    setError(false);
                    setPinInput('');
                    onUnlocked(next);
                    onClose();
                  } else {
                    setError(true);
                    setPinInput('');
                  }
                }
              }}
              placeholder="•••••"
              className={`w-full py-3 text-center tracking-[0.8em] text-2xl font-mono font-bold bg-slate-50 dark:bg-[#181E19] border ${
                error
                  ? 'border-rose-500 text-rose-500 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500'
              } rounded-2xl focus:outline-none transition-all`}
              autoFocus
            />
            {error && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1.5 animate-shake">
                Incorrect PIN. Access denied.
              </p>
            )}
          </div>

          {/* Touch Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleClearPin();
                  else if (key === '✓') {
                    if (pinInput.length === 5) handleSubmit();
                  } else {
                    handleKeypadPress(key);
                  }
                }}
                className="h-11 rounded-xl bg-slate-100 dark:bg-[#181E19] hover:bg-slate-200 dark:hover:bg-[#202921] border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-800 dark:text-white transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-500" />
              <span>Strict 5-Digit Lock</span>
            </span>
            <span>Charl Tommie Only</span>
          </div>

          <button
            type="submit"
            disabled={pinInput.length !== 5}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Verify &amp; Unlock Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
