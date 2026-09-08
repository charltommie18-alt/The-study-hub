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
  Calendar,
  AlertTriangle,
  FileText,
  Ban,
} from 'lucide-react';
import { SubscriptionState } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onUpdateSubscription: (newSub: SubscriptionState) => void;
  onOpenPolicy?: (tab: 'privacy' | 'terms' | 'data') => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  onOpenPolicy,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'ZAR' | 'EUR' | 'GBP' | 'JMD'>('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
    setShowCancelConfirm(false);

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
      setSuccessMessage(
        '7-Day Free Trial activated. Full Pro access until the trial ends. Cancel anytime before day 7 to avoid being charged.'
      );
    }, 800);
  };

  const handleCancelSubscription = () => {
    const updated: SubscriptionState = {
      ...subscription,
      status: 'free',
      autoRenew: false,
      planName: 'Free Tier',
    };
    onUpdateSubscription(updated);
    setShowCancelConfirm(false);
    setSuccessMessage(
      'Subscription cancelled. You are back on Free Tier. No further charges will be made for this plan in the app.'
    );
  };

  const isTrialActive = subscription.status === 'trial';
  const isProActive = subscription.status === 'active';
  const hasPaidPlan = isTrialActive || isProActive;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#F9F7F2] dark:bg-[#121613] w-full max-w-lg rounded-[28px] shadow-2xl border border-[#D9D1C7] dark:border-[#2B382D] overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#EBE7DF] dark:border-[#2C3B2E]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-lg text-[#2D362E] dark:text-white">The Study Hub Pro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#EBE7DF] dark:hover:bg-[#1C241E] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#736B5E] dark:text-[#A6C4A7]" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-1.5 mb-4">
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

          <div className="bg-gradient-to-br from-blue-900 via-teal-900 to-emerald-950 text-white border border-blue-500/40 rounded-[24px] p-6 shadow-lg mb-4">
            <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
              Pro Monthly Subscription
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-serif font-bold">
                {prices[selectedCurrency].symbol}0.00
              </span>
              <span className="text-emerald-200 text-xs font-semibold">for first 7 days</span>
            </div>
            <p className="text-blue-100 text-xs mt-1">
              Then {prices[selectedCurrency].label}. Cancel anytime before day 7 with zero charge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
            {[
              { icon: Layers, text: 'Unlimited AI flashcards & quizzes' },
              { icon: Mic, text: 'Voice input & narration' },
              { icon: Zap, text: 'Priority AI tutor responses' },
              { icon: Clock, text: 'Advanced focus analytics' },
              { icon: Tablet, text: 'Fire tablet optimised' },
              { icon: Tv, text: 'Fire TV / D-Pad friendly' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 p-2.5 bg-[#F9F7F2] dark:bg-[#1C241E] rounded-xl border border-[#EBE7DF] dark:border-[#2A372C]"
              >
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-[#2D362E] dark:text-white">{text}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#1C241E] border border-[#EBE7DF] dark:border-[#2A372C] rounded-2xl text-[11px] text-[#3C3C3B] dark:text-[#E6E1D8] mb-4 space-y-1.5">
            <p className="font-bold text-[#2D362E] dark:text-white flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Billing & cancellation policy
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>7-day free trial; you will not be charged if you cancel during the trial.</li>
              <li>After the trial, the plan renews monthly at the price shown above.</li>
              <li>Cancel anytime in this screen — access continues until the current period ends where applicable.</li>
              <li>
                On Amazon Appstore devices, you can also manage or cancel in{' '}
                <strong>Amazon Account → Memberships & Subscriptions</strong>.
              </li>
            </ul>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 mb-4">
            <Tablet className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="leading-tight">
              <strong>Fire Device Compatibility:</strong> Works on Amazon Fire Tablets and Fire TV OS.
              Package ID: <span className="font-mono">com.studyhub.app</span>
            </p>
          </div>

          {successMessage && (
            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-medium flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-3 border-t border-[#EBE7DF] dark:border-[#2C3B2E] pt-4">
            {hasPaidPlan ? (
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-800 rounded-2xl text-xs text-blue-900 dark:text-cyan-200 flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    <span>{isTrialActive ? 'Free Trial Active' : 'Pro Subscription Active'}</span>
                  </div>
                  <span>
                    {subscription.trialEndDate
                      ? `Ends ${new Date(subscription.trialEndDate).toLocaleDateString()}`
                      : 'Active'}
                  </span>
                </div>

                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2.5 bg-[#F2EFE9] dark:bg-[#202B22] hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-[#D9D1C7] dark:border-[#2F3E31] rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel subscription
                  </button>
                ) : (
                  <div className="p-3 border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 rounded-2xl space-y-2">
                    <div className="flex items-start gap-2 text-xs text-rose-900 dark:text-rose-200">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        Cancel your Pro plan and return to Free Tier? Auto-renew will be turned off.
                        On Amazon devices, also cancel in Amazon Account if you purchased through the Appstore.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelSubscription}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Yes, cancel
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2.5 bg-white dark:bg-[#121613] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-xl text-xs font-bold cursor-pointer text-[#2D362E] dark:text-white"
                      >
                        Keep plan
                      </button>
                    </div>
                  </div>
                )}
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
              <span>Cancel anytime · No charge during free trial</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-[#6B6560] dark:text-[#A6C4A7] pt-1">
              <button
                type="button"
                onClick={() => onOpenPolicy?.('privacy')}
                className="underline hover:text-blue-600 cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Privacy Policy
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('terms')}
                className="underline hover:text-blue-600 cursor-pointer"
              >
                Terms of Service
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => onOpenPolicy?.('data')}
                className="underline hover:text-blue-600 cursor-pointer"
              >
                Student Data & Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
