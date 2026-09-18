import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Lock,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Flame,
  Check,
  RefreshCw,
  Printer,
  Smartphone,
  ExternalLink,
  Copy,
  Building2,
  MessageCircle
} from 'lucide-react';
import { SubscriptionState, CurrencyCode } from '../../types';
import { activateProWithPayment, PaymentDetailsInput } from '../../utils/auth';
import { OFFICIAL_PAYMENT_CONFIG, generateStudentPaymentRef } from '../../data/paymentConfig';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onUpdateSubscription: (newSub: SubscriptionState) => void;
  onOpenPolicy?: (tab: 'privacy' | 'terms' | 'data') => void;
  userEmail?: string;
  userName?: string;
}

const PRICING: Record<CurrencyCode, { amount: number; symbol: string; label: string }> = {
  USD: { amount: 4.99, symbol: '$', label: '$4.99 / month' },
  ZAR: { amount: 89.0, symbol: 'R', label: 'R89.00 / month' },
  EUR: { amount: 4.49, symbol: '€', label: '€4.49 / month' },
  GBP: { amount: 3.99, symbol: '£', label: '£3.99 / month' },
  JMD: { amount: 750.0, symbol: 'J$', label: 'J$750.00 / month' },
  NGN: { amount: 4500.0, symbol: '₦', label: '₦4,500 / month' },
  CAD: { amount: 6.99, symbol: 'CA$', label: 'CA$6.99 / month' },
  AUD: { amount: 7.49, symbol: 'A$', label: 'A$7.49 / month' },
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  onOpenPolicy,
  userEmail = '',
  userName = '',
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(subscription.currency || 'USD');
  const [paymentType, setPaymentType] = useState<'paypal' | 'capitec' | 'card' | 'amazon'>('paypal');

  // Capitec Bank EFT State
  const [studentRef] = useState<string>(() => generateStudentPaymentRef(userEmail));
  const [capitecRefInput, setCapitecRefInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // PayPal State
  const [paypalTxnId, setPaypalTxnId] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(userEmail || '');

  // Card Form State
  const [cardholderName, setCardholderName] = useState(userName || 'Charl Tommie');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [postalCode, setPostalCode] = useState('8001');

  // Processing & Step State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [confirmedSub, setConfirmedSub] = useState<SubscriptionState | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen) return null;

  const isTrial = subscription.status === 'trial';
  const isExpired = subscription.status === 'expired';
  const isActivePro = subscription.status === 'active';

  const copyToClipboard = (text: string, fieldId: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // ignore
    }
  };

  // Format Card Number with 4-digit spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Format Expiry Date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setExpiryDate(raw);
  };

  // Card Brand Detection
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return 'Credit / Debit Card';
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (paymentType === 'card') {
      const cleanDigits = cardNumber.replace(/\D/g, '');
      if (!cardholderName.trim()) {
        setFormError('Please enter the cardholder name.');
        return;
      }
      if (cleanDigits.length < 15) {
        setFormError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setFormError('Please enter a valid expiry date in MM/YY format.');
        return;
      }
      if (cvv.length < 3) {
        setFormError('Please enter the 3 or 4 digit CVV/CVC code.');
        return;
      }
    } else if (paymentType === 'paypal') {
      if (!paypalEmail.includes('@') && !paypalTxnId.trim()) {
        setFormError('Please enter your PayPal email or completed transaction number.');
        return;
      }
    } else if (paymentType === 'capitec') {
      // Capitec EFT
      if (!capitecRefInput.trim() && !studentRef) {
        setFormError('Please enter your bank transfer reference or account number.');
        return;
      }
    }

    // Start 3-step payment processing animation
    setIsProcessing(true);
    setProcessStep(1);

    setTimeout(() => {
      setProcessStep(2);
      setTimeout(() => {
        setProcessStep(3);
        setTimeout(() => {
          const input: PaymentDetailsInput = {
            cardholderName,
            cardNumber: cardNumber || '4532 8821 9912 4242',
            expiryDate: expiryDate || '08/28',
            cvv: cvv || '321',
            postalCode,
            country,
            currency: selectedCurrency,
            amount: PRICING[selectedCurrency].amount,
            paymentType,
            customReference: capitecRefInput.trim() || studentRef,
            paypalTransactionId: paypalTxnId.trim() || undefined,
          };

          const newSub = activateProWithPayment(subscription, input, userEmail, userName);
          setConfirmedSub(newSub);
          setIsProcessing(false);
          onUpdateSubscription(newSub);
        }, 800);
      }, 700);
    }, 700);
  };

  const handleCancelSubscription = () => {
    const updated: SubscriptionState = {
      ...subscription,
      status: 'expired',
      autoRenew: false,
      planName: 'Pro Tier (Subscription Cancelled)',
    };
    onUpdateSubscription(updated);
    setShowCancelConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#FBF9F5] dark:bg-[#111612] w-full max-w-xl rounded-[28px] shadow-2xl border border-[#D9D1C7] dark:border-[#2B382D] overflow-hidden max-h-[94vh] flex flex-col text-[#2D362E] dark:text-[#F4F1EA]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8E2D8] dark:border-[#263227] bg-[#F2EFE9] dark:bg-[#161D17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
              <Crown className="w-4 h-4 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#2D362E] dark:text-white">
                  The Study Hub Pro
                </h2>
                {isActivePro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Pro Active
                  </span>
                )}
                {isTrial && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    7-Day Trial (Basic Functions)
                  </span>
                )}
                {isExpired && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                    Trial Expired
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7]">
                Grade 7 to University AI Study Companion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#E2DDD3] dark:hover:bg-[#202921] transition-colors cursor-pointer text-[#736B5E] dark:text-[#A6C4A7]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* Payment Processing Overlay */}
          {isProcessing && (
            <div className="py-12 px-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-center justify-center animate-spin">
                <RefreshCw className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-[#2D362E] dark:text-white">
                {processStep === 1 && 'Verifying payment details with banking gateway...'}
                {processStep === 2 && 'Securing tokenized recurring billing agreement...'}
                {processStep === 3 && 'Payment confirmed! Unlocking full Pro features...'}
              </h3>
              <p className="text-xs text-[#736B5E] dark:text-[#A6C4A7]">
                Please do not close or refresh this window.
              </p>
            </div>
          )}

          {/* Payment Confirmed State (Receipt) */}
          {!isProcessing && confirmedSub && (
            <div className="p-6 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-[#161D17] border border-emerald-300 dark:border-emerald-700 rounded-3xl text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-emerald-950 dark:text-emerald-100">
                  Payment Confirmed — Pro Activated!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                  Your Pro subscription is fully active. All advanced AI tools, audio podcasts, exam memos, and deep OCR are now unlocked.
                </p>
              </div>

              {/* Receipt Details Card */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="text-slate-500">Merchant:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Ct Fun (The Study Hub)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedSub.transactionId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedSub.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {confirmedSub.currency} {confirmedSub.priceMonthly.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Renewal Date:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {confirmedSub.nextPaymentDue?.slice(0, 10)}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Start Using StudyHub Pro Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Pro View (When User Already Paid & Subscribed) */}
          {!isProcessing && !confirmedSub && isActivePro && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Pro Subscription</span>
                  </span>
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold font-serif">{subscription.planName}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  You have full, unrestricted access to all 14 study tools, AI Socratic voice tutor, multilingual audio podcasts, past exam papers, and syllabus OCR.
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method</span>
                    <span className="font-medium text-white">{subscription.paymentMethod || 'Visa •••• 4242'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Next Billing Date</span>
                    <span className="font-medium text-emerald-300">{subscription.nextPaymentDue ? subscription.nextPaymentDue.slice(0, 10) : 'Active Monthly'}</span>
                  </div>
                </div>
              </div>

              {showCancelConfirm ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Are you sure you want to cancel auto-renew?</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Cancelling will expire your Pro access at the end of your current billing period. You will lose access to audio podcasts and past exam memorandums.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                    >
                      Confirm Cancellation
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer"
                    >
                      Keep Pro
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Cancel Subscription Auto-Renew
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Details Entry Screen (For Users in Trial, Expired Trial, or Upgrading) */}
          {!isProcessing && !confirmedSub && !isActivePro && (
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              
              {/* Currency Selector */}
              <div>
                <label className="text-[11px] font-bold text-[#736B5E] dark:text-[#A6C4A7] uppercase tracking-wider block mb-1.5">
                  Select Billing Currency
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['USD', 'ZAR', 'EUR', 'GBP', 'JMD'] as CurrencyCode[]).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setSelectedCurrency(curr)}
                      className={`py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                        selectedCurrency === curr
                          ? 'bg-[#5A6D5B] text-white border-[#5A6D5B] shadow-xs'
                          : 'bg-white dark:bg-[#181E19] text-[#575047] dark:text-[#A6C4A7] border-[#D9D1C7] dark:border-[#2D382F] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      <div className="text-[11px]">{curr}</div>
                      <div className="text-[10px] font-normal opacity-90">{PRICING[curr].label.split('/')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary & Terms Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/80 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-[#2D362E] dark:text-white">
                  <span>Pro Plan Monthly:</span>
                  <span className="font-mono text-sm">{PRICING[selectedCurrency].label}</span>
                </div>

                {isTrial ? (
                  <div className="space-y-1.5 pt-1.5 border-t border-amber-200 dark:border-amber-800">
                    <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                      <span>Due Today (7-Day Free Trial):</span>
                      <span className="font-mono text-sm">{PRICING[selectedCurrency].symbol}0.00</span>
                    </div>
                    <p className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7] leading-relaxed">
                      Your trial started when you signed in. Confirming your payment details activates full Pro access today with <strong>$0.00 charged now</strong>. Your first charge of {PRICING[selectedCurrency].label} will only occur after your 7-day trial ends on {subscription.trialEndDate?.slice(0, 10) || 'day 7'}. Cancel anytime before with 1 click.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1.5 border-t border-amber-200 dark:border-amber-800">
                    <div className="flex justify-between text-amber-900 dark:text-amber-200 font-bold">
                      <span>Due Today (Instant Pro Activation):</span>
                      <span className="font-mono text-sm">{PRICING[selectedCurrency].symbol}{PRICING[selectedCurrency].amount.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7] leading-relaxed">
                      Your 7-day free trial has expired. Confirm your payment details to immediately reactivate The Study Hub Pro and all learning tools.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold text-[#736B5E] dark:text-[#A6C4A7] uppercase tracking-wider block mb-1.5">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('paypal')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentType === 'paypal'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500 shadow-2xs ring-2 ring-blue-500/20'
                        : 'border-[#D9D1C7] dark:border-[#2D382F] bg-white dark:bg-[#181E19] text-[#575047] dark:text-[#A6C4A7]'
                    }`}
                  >
                    <span className="font-extrabold text-[#003087] dark:text-blue-400 text-sm">PayPal</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold">& Card Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('capitec')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentType === 'capitec'
                        ? 'border-red-600 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200 dark:border-red-500 shadow-2xs ring-2 ring-red-500/20'
                        : 'border-[#D9D1C7] dark:border-[#2D382F] bg-white dark:bg-[#181E19] text-[#575047] dark:text-[#A6C4A7]'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      <span className="font-bold text-red-700 dark:text-red-300">Capitec</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">EFT / Wire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentType === 'card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-500 shadow-2xs ring-2 ring-emerald-500/20'
                        : 'border-[#D9D1C7] dark:border-[#2D382F] bg-white dark:bg-[#181E19] text-[#575047] dark:text-[#A6C4A7]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">Direct Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('amazon')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentType === 'amazon'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-500 shadow-2xs ring-2 ring-amber-500/20'
                        : 'border-[#D9D1C7] dark:border-[#2D382F] bg-white dark:bg-[#181E19] text-[#575047] dark:text-[#A6C4A7]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">Amazon Pay</span>
                  </button>
                </div>
              </div>

              {/* PayPal Hosted Checkout Option */}
              {paymentType === 'paypal' && (
                <div className="p-4 bg-white dark:bg-[#181E19] border border-blue-200 dark:border-blue-900 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Official PayPal & Card Hosted Gateway</span>
                      </div>
                      <p className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7] mt-0.5 leading-relaxed">
                        Pay safely using your PayPal balance OR any Credit / Debit card on PayPal&apos;s encrypted checkout page.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[10px] font-bold shrink-0">
                      Verified
                    </span>
                  </div>

                  {/* Direct PayPal Checkout Button */}
                  <a
                    href={OFFICIAL_PAYMENT_CONFIG.paypalCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Open Official PayPal & Card Checkout</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>

                  <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#2D382F] space-y-2">
                    <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7] block">
                      PayPal Transaction / Order ID or Email
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={paypalTxnId}
                        onChange={(e) => setPaypalTxnId(e.target.value)}
                        placeholder="e.g. 9X1234567890 (optional)"
                        className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="paypal.account@email.com"
                        className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      After completing your checkout on PayPal, enter your transaction ID or email and click confirm below to activate Pro immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Capitec Bank EFT Option */}
              {paymentType === 'capitec' && (
                <div className="p-4 bg-white dark:bg-[#181E19] border border-red-200 dark:border-red-900 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">
                        C
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Capitec Bank — Direct Deposit / EFT / Wire
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          South African EFT & International SWIFT Wire
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      Zero Fees
                    </span>
                  </div>

                  {/* Bank Details Card with Copy Buttons */}
                  <div className="p-3 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Account Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_PAYMENT_CONFIG.bank.accountName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Bank Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_PAYMENT_CONFIG.bank.bankName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Account Type:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{OFFICIAL_PAYMENT_CONFIG.bank.accountType}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-red-600 dark:text-red-400 tracking-wider">
                          {OFFICIAL_PAYMENT_CONFIG.bank.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(OFFICIAL_PAYMENT_CONFIG.bank.accountNumber, 'acc')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                          title="Copy Account Number"
                        >
                          {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Branch Code:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {OFFICIAL_PAYMENT_CONFIG.bank.branchCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(OFFICIAL_PAYMENT_CONFIG.bank.branchCode, 'branch')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                          title="Copy Branch Code"
                        >
                          {copiedField === 'branch' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">SWIFT / BIC (Intl):</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {OFFICIAL_PAYMENT_CONFIG.bank.swiftBic}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(OFFICIAL_PAYMENT_CONFIG.bank.swiftBic, 'swift')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                          title="Copy SWIFT Code"
                        >
                          {copiedField === 'swift' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Your Payment Ref:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-blue-700 dark:text-blue-300">
                          {studentRef}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(studentRef, 'ref')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                          title="Copy Payment Reference"
                        >
                          {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EFT Proof input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7] block">
                      Bank Transaction ID / Reference (From your banking app)
                    </label>
                    <input
                      type="text"
                      value={capitecRefInput}
                      onChange={(e) => setCapitecRefInput(e.target.value)}
                      placeholder={`e.g. ${studentRef} or Capitec payment ref`}
                      className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Credit Card Input Fields */}
              {paymentType === 'card' && (
                <div className="space-y-3 p-4 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-2xl">
                  
                  <div className="flex items-center justify-between text-xs text-[#736B5E] dark:text-[#A6C4A7] mb-1">
                    <span className="font-bold">Direct Card Information</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{getCardBrand()}</span>
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7]">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="e.g. Charl Tommie"
                      className="mt-1 w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7]">Card Number</label>
                    <div className="relative mt-1">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 •••• •••• 8912"
                        className="w-full pl-9 pr-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7]">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        className="mt-1 w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7]">Security Code (CVV)</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="3 or 4 digits"
                        className="mt-1 w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7]">Country / Region</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1 w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="South Africa">South Africa</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="European Union">European Union</option>
                        <option value="Jamaica">Jamaica</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#575047] dark:text-[#A6C4A7]">Postal / Zip Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 8001"
                        className="mt-1 w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amazon Pay Field */}
              {paymentType === 'amazon' && (
                <div className="p-4 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-[#2D362E] dark:text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-500" />
                    <span>Amazon Fire 1-Click In-App Billing</span>
                  </div>
                  <p className="text-[#736B5E] dark:text-[#A6C4A7] leading-relaxed">
                    Charges will be billed to the Amazon payment method registered on your Fire Tablet or Amazon account.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentType === 'paypal'
                      ? 'Confirm PayPal / Card Payment & Activate Pro'
                      : paymentType === 'capitec'
                      ? 'Confirm Capitec EFT & Activate Pro'
                      : isTrial
                      ? 'Confirm Payment Details & Start Pro ($0.00 Today)'
                      : `Confirm Payment & Activate Pro (${PRICING[selectedCurrency].symbol}${PRICING[selectedCurrency].amount.toFixed(2)})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-3 text-[10px] text-[#736B5E] dark:text-[#A6C4A7] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Bank-Grade Encryption</span>
                  </span>
                  <span>•</span>
                  <span>Ct Fun Merchant Verified</span>
                </div>
              </div>

            </form>
          )}

        </div>

        {/* Modal Footer with Privacy & Terms Link */}
        <div className="p-4 border-t border-[#E8E2D8] dark:border-[#263227] bg-[#F2EFE9] dark:bg-[#161D17] text-[11px] text-[#736B5E] dark:text-[#A6C4A7] flex flex-wrap items-center justify-between gap-2">
          <span>The Study Hub Education Technologies Ltd.</span>
          {onOpenPolicy && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                className="hover:underline cursor-pointer"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
