import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Tablet, 
  Tv, 
  Flame, 
  Clock, 
  Layers, 
  Mic, 
  Zap, 
  Calendar 
} from 'lucide-react';
import { SubscriptionState } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onUpdateSubscription: (newSub: SubscriptionState) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'ZAR' | 'EUR' | 'GBP' | 'JMD'>('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const prices = {
    USD: { amount: 4.99, symbol: '$', label: '$4.99 / month' },
    ZAR: { amount: 89.0, symbol: 'R', label: 'R89.00 / month' },
    EUR: { amount: 4.49, symbol: '€', label: '€4.49 / month' },
    GBP: { amount: 3.99, symbol: '£', label: '£3.99 / month' },
    JMD: { amount: 750.0, symbol: 'J$', label: 'J$750.00 / month' },
  };

  const handleStartTrial = () => {
    setIsProcessing(true);
    setSuccessMessage('');

    setTimeout(() => {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const updated: SubscriptionState = {
        status: 'trial',
        trialStartDate: now.toISOString(),
        trialEndDate: trialEnd.toISOString(),
        planName: 'Pro Monthly (7-Day Free Trial)',
        priceMonthly: prices[selectedCurrency].amount,
        currency: selectedCurrency,
        isFireOSCompatible: true,
        autoRenew: true,
      };

      onUpdateSubscription(updated);
      setIsProcessing(false);
      setSuccessMessage('🎉 7-Day Free Trial Activated! Enjoy full access to AI Flashcards, Spaced Repetition, Voice Input, and Fire OS Sync.');
    }, 800);
  };

  const handleCancelSubscription = () => {
    const updated: SubscriptionState = {
      ...subscription,
      status: 'free',
      autoRenew: false,
    };
    onUpdateSubscription(updated);
    setSuccessMessage('Subscription returned to Free Tier.');
  };

  const isTrialActive = subscription.status === 'trial';
  const isProActive = subscription.status === 'active';

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-[#161C18] border border-[#D9D1C7] dark:border-[#2C3B2E] rounded-[28px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-[#3C3C3B] dark:text-[#F4F1EA] focus:outline-none focus:ring-2 focus:ring-amber-400"
        tabIndex={0}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE7DF] dark:border-[#2C3B2E] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 rounded-full text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>7-DAY FREE TRIAL INCLUDED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] dark:text-white tracking-tight mt-0.5">
                StudyHub Pro Monthly Plan
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8C857A] hover:text-[#2D362E] dark:hover:text-white p-1 rounded-full hover:bg-[#F2EFE9] dark:hover:bg-[#202B22] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-between bg-[#F9F7F2] dark:bg-[#1C241E] border border-[#EBE7DF] dark:border-[#2A372C] rounded-2xl p-3 mb-6">
          <span className="text-xs font-bold text-[#7A746B] dark:text-[#A6C4A7]">Select Billing Currency:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['USD', 'ZAR', 'EUR', 'GBP', 'JMD'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#121613] text-[#575047] dark:text-[#A6C4A7] hover:bg-[#EBE7DF]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Pricing Card */}
        <div className="bg-gradient-to-br from-blue-900 via-teal-900 to-emerald-950 text-white border border-blue-500/40 rounded-[24px] p-6 shadow-lg mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Pro Monthly Subscription</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-white">
                  {prices[selectedCurrency].symbol}0.00
                </span>
                <span className="text-emerald-200 text-xs font-semibold">for first 7 days</span>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                Then {prices[selectedCurrency].label}. Cancel anytime before day 7 with zero charge.
              </p>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-amber-400 text-amber-950 text-xs font-extrabold rounded-full shadow-sm">
                NO CREDIT CARD REQUIRED TODAY
              </span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A746B] dark:text-[#A6C4A7]">
            Included in Your 7-Day Free Trial:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2 p-2.5 bg-[#F9F7F2] dark:bg-[#1C241E] rounded-xl border border-[#EBE7DF] dark:border-[#2A372C]">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-[#2D362E] dark:text-white">SM-2 Spaced Repetition Decks</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#F9F7F2] dark:bg-[#1C241E] rounded-xl border border-[#EBE7DF] dark:border-[#2A372C]">
              <Mic className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              <span className="font-semibold text-[#2D362E] dark:text-white">Voice Active Recall & Dictation</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#F9F7F2] dark:bg-[#1C241E] rounded-xl border border-[#EBE7DF] dark:border-[#2A372C]">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold text-[#2D362E] dark:text-white">Gemini 3.5 High-Speed AI</span>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#F9F7F2] dark:bg-[#1C241E] rounded-xl border border-[#EBE7DF] dark:border-[#2A372C]">
              <Tv className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="font-semibold text-[#2D362E] dark:text-white">Amazon Fire TV & Tablet Compatible</span>
            </div>
          </div>
        </div>

        {/* Fire OS & App Store Compatibility Note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 mb-6">
          <Tablet className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="leading-tight">
            <strong>Fire Device Compatibility:</strong> Compatible with Amazon Fire Tablets, Fire TV OS, and Google Play Services. D-Pad remote navigation enabled.
          </p>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-medium flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 border-t border-[#EBE7DF] dark:border-[#2C3B2E] pt-4">
          {isTrialActive || isProActive ? (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-800 rounded-2xl text-xs text-blue-900 dark:text-cyan-200 flex items-center justify-between font-semibold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>
                    {isTrialActive ? 'Free Trial Active' : 'Pro Subscription Active'}
                  </span>
                </div>
                <span>
                  {subscription.trialEndDate ? `Ends ${new Date(subscription.trialEndDate).toLocaleDateString()}` : 'Active'}
                </span>
              </div>

              <button
                onClick={handleCancelSubscription}
                className="w-full py-2.5 bg-[#F2EFE9] dark:bg-[#202B22] hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-[#D9D1C7] dark:border-[#2F3E31] rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel Subscription Trial
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartTrial}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Activating Your 7-Day Free Trial...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Start 7-Day Free Trial ($0 Today)</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C857A] dark:text-[#A6C4A7] font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Local Billing • Cancel Anytime with 1 Click</span>
          </div>
        </div>

      </div>
    </div>
  );
};
