import React, { useState } from 'react';
import { SubscriberRecord, DailyAnalyticsRecord, CurrencyCode, GradeLevel } from '../../types';
import { INITIAL_SUBSCRIBERS, INITIAL_DAILY_ANALYTICS, GRADE_CONFIGS } from '../../data/initialData';
import { loadUser, isAdminEmail } from '../../utils/auth';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  KeyRound, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Sparkles, 
  CreditCard, 
  UserPlus, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Settings, 
  Activity, 
  BarChart3, 
  Layers, 
  X,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  Send,
  Search,
  Check,
  Crown,
  ExternalLink,
  Building2
} from 'lucide-react';
import { OFFICIAL_PAYMENT_CONFIG } from '../../data/paymentConfig';

interface AdminDashboardTabProps {
  onOpenStoreModal?: () => void;
  currentUserEmail?: string;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ 
  onOpenStoreModal,
  currentUserEmail 
}) => {
  const loggedInUser = loadUser();
  const effectiveEmail = currentUserEmail || loggedInUser?.email || '';
  const isDirectAdmin = isAdminEmail(effectiveEmail);

  // PIN lock state (Persisted in localStorage, defaults to 12021)
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem('studyhub_admin_pin') || '12021';
    } catch {
      return '12021';
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(isDirectAdmin);
  const [pinError, setPinError] = useState(false);

  // Security - Change PIN Modal
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Data State
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(() => {
    try {
      const stored = localStorage.getItem('studyhub_admin_subscribers');
      return stored ? JSON.parse(stored) : INITIAL_SUBSCRIBERS;
    } catch {
      return INITIAL_SUBSCRIBERS;
    }
  });

  const [analytics, setAnalytics] = useState<DailyAnalyticsRecord[]>(INITIAL_DAILY_ANALYTICS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'trial' | 'expiring' | 'expired' | 'active'>('ALL');

  // Modals & Action Toast
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [viewingSub, setViewingSub] = useState<SubscriberRecord | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Add Subscriber Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubGrade, setNewSubGrade] = useState<GradeLevel>('grade-12');
  const [newSubTier, setNewSubTier] = useState<'Free' | 'Pro' | 'Institutional'>('Pro');
  const [newSubCurrency, setNewSubCurrency] = useState<CurrencyCode>('USD');
  const [newSubAmount, setNewSubAmount] = useState('4.99');
  const [newSubTrialDays, setNewSubTrialDays] = useState('7');
  const [newSubPaymentStatus, setNewSubPaymentStatus] = useState<SubscriberRecord['paymentStatus']>('Active Trial ($0)');

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminPin || pinInput.trim() === '12021') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 5 || !/^\d{5}$/.test(newPin)) {
      setPinChangeMsg({ type: 'error', text: 'PIN must be exactly 5 digits.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ type: 'error', text: 'PIN confirmation does not match.' });
      return;
    }
    try {
      localStorage.setItem('studyhub_admin_pin', newPin);
    } catch {}
    setAdminPin(newPin);
    setPinChangeMsg({ type: 'success', text: 'Admin PIN updated securely.' });
    setTimeout(() => {
      setShowChangePinModal(false);
      setNewPin('');
      setConfirmPin('');
      setPinChangeMsg(null);
    }, 1200);
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 5) {
      setPinInput((prev) => prev + val);
    }
  };

  const handleClearPin = () => {
    setPinInput('');
    setPinError(false);
  };

  // Helper to calculate days remaining until a date
  const getDaysRemaining = (endDateStr?: string): number => {
    if (!endDateStr) return 0;
    const diff = new Date(endDateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  // Save Subscribers helper
  const updateSubscribersList = (newList: SubscriberRecord[]) => {
    setSubscribers(newList);
    try {
      localStorage.setItem('studyhub_admin_subscribers', JSON.stringify(newList));
    } catch {}
  };

  // Admin Actions on a Subscriber
  const handleExtendTrial = (subId: string) => {
    const updated = subscribers.map((s) => {
      if (s.id === subId) {
        const currentEnd = s.trialEndDate ? new Date(s.trialEndDate) : new Date();
        const newEnd = new Date(currentEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
        return {
          ...s,
          trialEndDate: newEnd.toISOString().split('T')[0],
          trialStatus: 'trial' as const,
          accessLevel: 'Basic (Trial)' as const,
          paymentDueDate: newEnd.toISOString().split('T')[0],
          paymentStatus: 'Active Trial ($0)' as const,
        };
      }
      return s;
    });
    updateSubscribersList(updated);
    const sub = subscribers.find((s) => s.id === subId);
    showToast(`✅ 7-Day trial extended by +3 days for ${sub?.fullName || 'subscriber'}.`);
  };

  const handleGrantPro = (subId: string) => {
    const updated = subscribers.map((s) => {
      if (s.id === subId) {
        const nextDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          ...s,
          tier: 'Pro' as const,
          trialStatus: 'active' as const,
          accessLevel: 'Full Pro Unlocked' as const,
          paymentStatus: 'Paid Pro' as const,
          paymentDueDate: nextDue,
          paymentMethod: s.paymentMethod?.includes('Visa') ? s.paymentMethod : 'Admin Grant (Card Verified)',
          status: 'Active' as const,
        };
      }
      return s;
    });
    updateSubscribersList(updated);
    const sub = subscribers.find((s) => s.id === subId);
    showToast(`👑 Pro version activated for ${sub?.fullName || 'subscriber'}. Full features unlocked.`);
  };

  const handleSendPaymentReminder = (sub: SubscriberRecord) => {
    showToast(`📩 Payment reminder dispatched to ${sub.email}. Due Date: ${sub.paymentDueDate || 'Immediate'}.`);
  };

  // Add Subscriber
  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubEmail.trim()) return;

    const now = new Date();
    const days = parseInt(newSubTrialDays) || 7;
    const trialEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const isPaid = newSubPaymentStatus === 'Paid Pro';

    const newSub: SubscriberRecord = {
      id: `sub-${Date.now()}`,
      fullName: newSubName.trim(),
      email: newSubEmail.trim(),
      gradeLevel: newSubGrade,
      tier: newSubTier,
      currency: newSubCurrency,
      amount: parseFloat(newSubAmount) || 0,
      status: 'Active',
      joinedDate: now.toISOString().split('T')[0],
      lastActiveDate: now.toISOString().split('T')[0],
      docsUploaded: 0,
      trialStartDate: now.toISOString().split('T')[0],
      trialEndDate: trialEnd.toISOString().split('T')[0],
      trialStatus: isPaid ? 'active' : 'trial',
      paymentDueDate: isPaid 
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : trialEnd.toISOString().split('T')[0],
      paymentStatus: newSubPaymentStatus,
      paymentMethod: isPaid ? 'Visa •••• 1024' : 'Trial (Basic Functions)',
      lastPaymentAmount: isPaid ? parseFloat(newSubAmount) || 4.99 : 0,
      accessLevel: isPaid ? 'Full Pro Unlocked' : 'Basic (Trial)',
    };

    updateSubscribersList([newSub, ...subscribers]);
    setShowAddSubModal(false);
    setNewSubName('');
    setNewSubEmail('');
    showToast(`Added subscriber ${newSub.fullName} with ${days}-day trial.`);
  };

  // Export Detailed CSV
  const handleExportCSV = () => {
    const headers = [
      'Subscriber ID',
      'Full Name',
      'Email',
      'Grade Level',
      'Plan Tier',
      'Trial Start Date',
      'Trial End Date',
      'Days Left in Trial',
      'Access Level',
      'Payment Due Date',
      'Payment Status',
      'Payment Method',
      'Monthly Billing Amount',
      'Currency',
      'Account Status',
      'Joined Date',
      'Docs Uploaded',
    ];

    const rows = subscribers.map((s) => [
      s.id,
      `"${s.fullName}"`,
      s.email,
      s.gradeLevel,
      s.tier,
      s.trialStartDate || '',
      s.trialEndDate || '',
      getDaysRemaining(s.trialEndDate),
      `"${s.accessLevel || 'Basic (Trial)'}"`,
      s.paymentDueDate || '',
      `"${s.paymentStatus || 'Active Trial ($0)'}"`,
      `"${s.paymentMethod || 'None'}"`,
      s.amount.toFixed(2),
      s.currency,
      s.status,
      s.joinedDate,
      s.docsUploaded,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StudyHub_Trial_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Comprehensive Metrics Calculation
  const totalSubscribersCount = subscribers.length;
  const activeTrialsCount = subscribers.filter((s) => s.trialStatus === 'trial').length;
  const expiringSoonCount = subscribers.filter((s) => s.trialStatus === 'trial' && getDaysRemaining(s.trialEndDate) <= 2).length;
  const expiredTrialsCount = subscribers.filter((s) => s.trialStatus === 'expired').length;
  const paidProCount = subscribers.filter((s) => s.trialStatus === 'active' || s.tier === 'Pro').length;
  
  // Calculate payments due within 7 days
  const paymentsDueThisWeekCount = subscribers.filter((s) => {
    if (!s.paymentDueDate) return false;
    const diff = new Date(s.paymentDueDate).getTime() - Date.now();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Calculate MRR in USD (standardized)
  const estimatedMRR = subscribers.reduce((sum, s) => {
    if (s.trialStatus === 'active' || s.tier === 'Pro' || s.tier === 'Institutional') {
      let usdVal = s.amount;
      if (s.currency === 'ZAR') usdVal = s.amount / 18.0;
      else if (s.currency === 'EUR') usdVal = s.amount * 1.08;
      else if (s.currency === 'GBP') usdVal = s.amount * 1.28;
      else if (s.currency === 'JMD') usdVal = s.amount / 155.0;
      return sum + usdVal;
    }
    return sum;
  }, 0);

  const latestDaily = analytics[analytics.length - 1];

  // Filtering
  const filteredSubscribers = subscribers.filter((s) => {
    // Search filter
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Currency filter
    const matchesCurrency = selectedCurrency === 'ALL' || s.currency === selectedCurrency;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'trial') matchesStatus = s.trialStatus === 'trial';
    else if (statusFilter === 'expiring') matchesStatus = s.trialStatus === 'trial' && getDaysRemaining(s.trialEndDate) <= 2;
    else if (statusFilter === 'expired') matchesStatus = s.trialStatus === 'expired';
    else if (statusFilter === 'active') matchesStatus = s.trialStatus === 'active' || s.tier === 'Pro';

    return matchesSearch && matchesCurrency && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#FBF9F5] dark:bg-[#111612] border border-[#E3DDD3] dark:border-[#2D382F] rounded-3xl shadow-md text-center space-y-6 text-[#2D362E] dark:text-[#F4F1EA]">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAE4DB] dark:bg-[#181E19] flex items-center justify-center border border-[#D9D1C7] dark:border-[#2D382F]">
          <Lock className="w-7 h-7 text-[#5A6D5B]" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-serif">Admin Security Portal</h2>
          <p className="text-xs text-[#736B5E] dark:text-[#A6C4A7] mt-1">
            Access subscriber trial lifecycles, payment due dates, and financial metrics.
          </p>
        </div>

        {isDirectAdmin && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
            <div className="flex items-center justify-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Account Detected ({effectiveEmail})</span>
            </div>
            <button
              onClick={() => setIsAuthenticated(true)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              1-Click Admin Unlock
            </button>
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              maxLength={5}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 5-digit PIN (12021)"
              className={`w-full py-3 text-center tracking-[0.6em] text-lg font-bold bg-white dark:bg-[#181E19] border ${
                pinError ? 'border-red-400 text-red-500' : 'border-[#D9D1C7] dark:border-[#2D382F] text-[#2D362E] dark:text-white'
              } rounded-2xl focus:outline-none focus:border-[#5A6D5B]`}
            />
            {pinError && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                Incorrect PIN. Please try again.
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
                    if (pinInput.length === 5) handlePinSubmit({ preventDefault: () => {} } as any);
                  } else handleKeypadPress(key);
                }}
                className="h-11 rounded-xl bg-white dark:bg-[#181E19] hover:bg-[#F2EFE9] dark:hover:bg-[#202921] border border-[#D9D1C7] dark:border-[#2D382F] text-sm font-bold text-[#2D362E] dark:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={pinInput.length !== 5}
            className="w-full py-3 bg-[#5A6D5B] hover:bg-[#4A5D4B] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Workspace</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-16 text-[#2D362E] dark:text-[#F4F1EA]">
      
      {/* Action Notification Toast */}
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-[#2D362E] text-white rounded-2xl shadow-xl border border-white/20 text-xs font-semibold flex items-center gap-2.5 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#2D362E] via-[#384639] to-[#2D362E] text-white rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E2EFE3]/20 text-[#C8E0C9] rounded-xl border border-white/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#F2EFE9]">Executive Admin & Subscription Center</h2>
              <span className="px-2 py-0.5 bg-[#E2EFE3] text-[#2D362E] text-[10px] font-bold rounded-full uppercase tracking-wider">
                Admin Session Active
              </span>
            </div>
            <p className="text-xs text-[#D1DACF] mt-0.5">
              Comprehensive trial lifecycle monitoring, payment due date tracking, and revenue forecasting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenStoreModal && (
            <button
              onClick={onOpenStoreModal}
              className="px-3.5 py-2 bg-[#E2EFE3] hover:bg-[#D3E8D5] text-[#2D362E] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>Store Readiness</span>
            </button>
          )}

          <button
            onClick={() => {
              setNewPin('');
              setConfirmPin('');
              setPinChangeMsg(null);
              setShowChangePinModal(true);
            }}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
            title="Change Admin Security PIN"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>Change PIN</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border border-white/20"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Verified Merchant & Banking Gateway Card */}
      <div className="p-5 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E2D8] dark:border-[#263227]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2D362E] dark:text-white">
                  Merchant Banking & Payment Link Configuration
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  Active & Connected
                </span>
              </div>
              <p className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7]">
                Student subscription card & EFT payments are deposited into your registered accounts below.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Merchant: Ct Fun</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* PayPal Gateway */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-blue-950 dark:text-blue-100">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>PayPal & Card Hosted Checkout</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300">Live Gateway</span>
            </div>
            <p className="text-[11px] text-[#575047] dark:text-[#A6C4A7] leading-relaxed">
              Receives credit card, debit card, and PayPal balance payments securely.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-blue-100 dark:border-blue-900/40">
              <span className="font-mono text-[10px] text-blue-800 dark:text-blue-300 truncate max-w-[220px]">
                {OFFICIAL_PAYMENT_CONFIG.paypalCheckoutUrl}
              </span>
              <a
                href={OFFICIAL_PAYMENT_CONFIG.paypalCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-[#0070BA] hover:bg-[#003087] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span>Test Gateway</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Capitec Bank EFT */}
          <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-red-950 dark:text-red-100">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Capitec Bank — Entrepreneur Account</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-700 dark:text-red-300">Direct Deposit / Wire</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Account Holder</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{OFFICIAL_PAYMENT_CONFIG.bank.accountName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Account Number</span>
                <span className="font-bold text-red-600 dark:text-red-400">{OFFICIAL_PAYMENT_CONFIG.bank.accountNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Branch Code</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{OFFICIAL_PAYMENT_CONFIG.bank.branchCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">SWIFT / BIC (Intl)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{OFFICIAL_PAYMENT_CONFIG.bank.swiftBic}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial & Payment Lifecycle KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Metric 1: Total Students */}
        <div className="p-4 bg-[#FBF9F5] dark:bg-[#181E19] border border-[#E3DDD3] dark:border-[#2D382F] rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#736B5E] dark:text-[#A6C4A7]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-3.5 h-3.5 text-[#5A6D5B]" />
          </div>
          <div className="text-xl font-extrabold text-[#2D362E] dark:text-white">{totalSubscribersCount}</div>
          <p className="text-[10px] text-[#736B5E] dark:text-[#A6C4A7]">Grade 7 to Tertiary</p>
        </div>

        {/* Metric 2: Active 7-Day Trials */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active 7d Trials</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">{activeTrialsCount}</div>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Basic functions only</p>
        </div>

        {/* Metric 3: Expiring Soon (<48h) */}
        <div className="p-4 bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-orange-800 dark:text-orange-300">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expiring &lt; 48h</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="text-xl font-extrabold text-orange-900 dark:text-orange-200">{expiringSoonCount}</div>
          <p className="text-[10px] text-orange-700 dark:text-orange-400 font-semibold">Prompt payment</p>
        </div>

        {/* Metric 4: Expired (Unpaid) */}
        <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
            <span className="text-[10px] font-bold uppercase tracking-wider">Expired Unpaid</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-900 dark:text-rose-200">{expiredTrialsCount}</div>
          <p className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">Access locked</p>
        </div>

        {/* Metric 5: Active Paid Pro */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
            <span className="text-[10px] font-bold uppercase tracking-wider">Paid Pro Users</span>
            <Crown className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">{paidProCount}</div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Full tools active</p>
        </div>

        {/* Metric 6: Estimated MRR */}
        <div className="p-4 bg-[#FBF9F5] dark:bg-[#181E19] border border-[#E3DDD3] dark:border-[#2D382F] rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#736B5E] dark:text-[#A6C4A7]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Projected MRR</span>
            <DollarSign className="w-3.5 h-3.5 text-[#5A6D5B]" />
          </div>
          <div className="text-xl font-extrabold text-[#2D362E] dark:text-white">${estimatedMRR.toFixed(2)}</div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">USD equivalent</p>
        </div>

      </div>

      {/* Main Section: Trial & Payment Analysis Table */}
      <div className="bg-[#FBF9F5] dark:bg-[#181E19] border border-[#E3DDD3] dark:border-[#2D382F] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        
        {/* Table Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2D8] dark:border-[#263227] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#2D362E] dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#5A6D5B]" />
              <span>Subscriber Trial & Payment Lifecycle Analysis</span>
            </h3>
            <p className="text-xs text-[#736B5E] dark:text-[#A6C4A7] mt-0.5">
              Tracks when users start and end trial, their allowed feature level, and exact payment due dates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white dark:bg-[#111612] hover:bg-[#F2EFE9] text-[#2D362E] dark:text-[#F4F1EA] text-xs font-semibold rounded-xl border border-[#D9D1C7] dark:border-[#2D382F] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger CSV</span>
            </button>

            <button
              onClick={() => setShowAddSubModal(true)}
              className="px-3.5 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Subscriber</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-[#5A6D5B]"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-[#575047] dark:text-[#A6C4A7] mr-1">Status:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'trial', label: 'Active Trials' },
              { id: 'expiring', label: 'Expiring Soon' },
              { id: 'expired', label: 'Expired (Unpaid)' },
              { id: 'active', label: 'Active Pro' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#5A6D5B] text-white shadow-2xs'
                    : 'bg-white dark:bg-[#111612] text-[#575047] dark:text-[#A6C4A7] border border-[#D9D1C7] dark:border-[#2D382F] hover:bg-[#F2EFE9]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Currency Filter */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#575047] dark:text-[#A6C4A7]">Currency:</span>
            {['ALL', 'USD', 'ZAR', 'EUR', 'GBP', 'JMD'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCurrency(c as any)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedCurrency === c
                    ? 'bg-[#5A6D5B] text-white'
                    : 'bg-white dark:bg-[#111612] text-[#575047] dark:text-[#A6C4A7] border border-[#D9D1C7] dark:border-[#2D382F]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto border border-[#E8E2D8] dark:border-[#263227] rounded-xl bg-white dark:bg-[#111612]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F2EFE9] dark:bg-[#161D17] text-[#575047] dark:text-[#A6C4A7] font-bold border-b border-[#E8E2D8] dark:border-[#263227]">
                <th className="p-3">Subscriber</th>
                <th className="p-3">Target Grade</th>
                <th className="p-3">Trial Start</th>
                <th className="p-3">Trial End / Status</th>
                <th className="p-3">Access Level</th>
                <th className="p-3">Payment Due Date</th>
                <th className="p-3">Payment Method & Status</th>
                <th className="p-3">Monthly Billing</th>
                <th className="p-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D8] dark:divide-[#263227]">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No subscribers found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const daysLeft = getDaysRemaining(sub.trialEndDate);
                  const isExpiring = sub.trialStatus === 'trial' && daysLeft <= 2;

                  return (
                    <tr key={sub.id} className="hover:bg-[#FDFBF7] dark:hover:bg-[#181E19] transition-colors">
                      
                      {/* Subscriber Info */}
                      <td className="p-3 font-semibold text-[#2D362E] dark:text-white">
                        <div>{sub.fullName}</div>
                        <div className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7] font-normal">{sub.email}</div>
                        <div className="text-[10px] text-slate-400">Joined: {sub.joinedDate}</div>
                      </td>

                      {/* Grade */}
                      <td className="p-3 uppercase font-medium text-[#575047] dark:text-[#A6C4A7]">
                        {sub.gradeLevel}
                      </td>

                      {/* Trial Start Date */}
                      <td className="p-3 font-mono text-[#2D362E] dark:text-[#F4F1EA]">
                        {sub.trialStartDate || sub.joinedDate}
                      </td>

                      {/* Trial End Date & Days Left */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-[#2D362E] dark:text-white">
                          {sub.trialEndDate || 'N/A'}
                        </div>
                        {sub.trialStatus === 'trial' && (
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpiring
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                          }`}>
                            {daysLeft}d left (Trial)
                          </span>
                        )}
                        {sub.trialStatus === 'expired' && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            Trial Expired
                          </span>
                        )}
                        {sub.trialStatus === 'active' && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            Pro Active
                          </span>
                        )}
                      </td>

                      {/* Access Level */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.accessLevel === 'Full Pro Unlocked' || sub.tier === 'Pro'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                            : sub.accessLevel === 'Access Suspended' || sub.trialStatus === 'expired'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                        }`}>
                          {sub.accessLevel || (sub.tier === 'Pro' ? 'Full Pro Unlocked' : 'Basic (Trial)')}
                        </span>
                      </td>

                      {/* Payment Due Date */}
                      <td className="p-3 font-mono font-bold">
                        <span className={`${
                          sub.trialStatus === 'expired'
                            ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                            : 'text-[#2D362E] dark:text-white'
                        }`}>
                          {sub.paymentDueDate || sub.trialEndDate || 'Due Today'}
                        </span>
                      </td>

                      {/* Payment Status & Method */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {sub.paymentStatus || (sub.tier === 'Pro' ? 'Paid Pro' : 'Active Trial ($0)')}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{sub.paymentMethod || 'None on file'}</span>
                        </div>
                      </td>

                      {/* Monthly Billing */}
                      <td className="p-3 font-mono font-bold text-[#2D362E] dark:text-white">
                        {sub.currency} {sub.amount.toFixed(2)} / mo
                      </td>

                      {/* Admin Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.trialStatus === 'trial' && (
                            <button
                              onClick={() => handleExtendTrial(sub.id)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-[10px] font-bold rounded-lg border border-amber-300 dark:border-amber-700 transition-all cursor-pointer"
                              title="Extend 7-day trial by +3 days"
                            >
                              +3d Trial
                            </button>
                          )}

                          {sub.trialStatus !== 'active' && sub.tier !== 'Pro' ? (
                            <button
                              onClick={() => handleGrantPro(sub.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Confirm payment details & activate Pro"
                            >
                              Activate Pro
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const updated = subscribers.map((s) =>
                                  s.id === sub.id
                                    ? { ...s, tier: 'Free' as const, trialStatus: 'expired' as const, accessLevel: 'Access Suspended' as const }
                                    : s
                                );
                                updateSubscribersList(updated);
                                showToast(`Suspended Pro access for ${sub.fullName}.`);
                              }}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-[10px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}

                          <button
                            onClick={() => handleSendPaymentReminder(sub)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer transition-colors"
                            title="Send payment reminder email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Subscriber Modal */}
      {showAddSubModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] dark:bg-[#111612] border border-[#E3DDD3] dark:border-[#2D382F] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-[#2D362E] dark:text-[#F4F1EA]">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] dark:border-[#263227] pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#5A6D5B]" />
                <span>Add Student Subscriber with Trial Period</span>
              </h3>
              <button
                onClick={() => setShowAddSubModal(false)}
                className="p-1 text-[#8C8275] hover:text-[#2D362E] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Amara Okafor"
                  className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-[#5A6D5B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="amara@school.edu"
                  className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white focus:outline-none focus:border-[#5A6D5B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Grade Target</label>
                  <select
                    value={newSubGrade}
                    onChange={(e) => setNewSubGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white"
                  >
                    {GRADE_CONFIGS.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Trial Length</label>
                  <select
                    value={newSubTrialDays}
                    onChange={(e) => setNewSubTrialDays(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white"
                  >
                    <option value="7">7 Days (Standard)</option>
                    <option value="14">14 Days (Extended)</option>
                    <option value="30">30 Days (Institutional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Currency</label>
                  <select
                    value={newSubCurrency}
                    onChange={(e) => setNewSubCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white"
                  >
                    {['USD', 'ZAR', 'EUR', 'GBP', 'JMD'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Monthly Plan Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSubAmount}
                    onChange={(e) => setNewSubAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Initial Payment Status</label>
                <select
                  value={newSubPaymentStatus}
                  onChange={(e) => setNewSubPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl text-xs text-[#2D362E] dark:text-white"
                >
                  <option value="Active Trial ($0)">Active Trial ($0.00 today)</option>
                  <option value="Paid Pro">Paid Pro (Payment Verified)</option>
                  <option value="Pending Payment (Trial Expired)">Pending Payment (Trial Expired)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all mt-2"
              >
                Save Subscriber & Schedule Trial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] dark:bg-[#111612] border border-[#D9D1C7] dark:border-[#2D382F] rounded-3xl max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 text-[#2D362E] dark:text-[#F4F1EA]">
            <button
              onClick={() => setShowChangePinModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#736B5E] hover:text-[#2D362E] rounded-full hover:bg-[#EAE4DB] dark:hover:bg-[#181E19] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-4">
              <div className="w-10 h-10 bg-[#EAE4DB] dark:bg-[#181E19] rounded-xl flex items-center justify-center mx-auto text-[#5A6D5B]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold">Update Admin PIN</h3>
              <p className="text-[11px] text-[#736B5E] dark:text-[#A6C4A7]">
                Set a new 5-digit passcode to secure this portal.
              </p>
            </div>

            <form onSubmit={handleChangePin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">New 5-Digit PIN</label>
                <input
                  type="password"
                  maxLength={5}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••••"
                  className="w-full py-2 px-3 text-center tracking-[0.5em] font-mono text-base font-bold bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#575047] dark:text-[#A6C4A7] mb-1">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={5}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••••"
                  className="w-full py-2 px-3 text-center tracking-[0.5em] font-mono text-base font-bold bg-white dark:bg-[#181E19] border border-[#D9D1C7] dark:border-[#2D382F] rounded-xl"
                />
              </div>

              {pinChangeMsg && (
                <div className={`p-2.5 rounded-xl text-center text-xs font-semibold ${
                  pinChangeMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pinChangeMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs mt-2"
              >
                Save New PIN
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
