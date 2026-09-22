import { SubscriptionState, CurrencyCode } from '../types';
import { loadFromStorage, saveToStorage } from './storage';

/** Admin account — always free / full access, no trial clock */
export const ADMIN_EMAILS = [
  'charltommie18@gmail',
  'charltommie18@gmail.com',
];

export interface UserAccount {
  email: string;
  displayName: string;
  createdAt: string;
  isAdmin: boolean;
}

const USER_KEY = 'studyhub_user_account';
const SUB_KEY = 'studyhub_subscription';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  const e = normalizeEmail(email);
  return ADMIN_EMAILS.some((a) => a === e || e.startsWith('charltommie18@gmail'));
}

export function loadUser(): UserAccount | null {
  return loadFromStorage<UserAccount | null>(USER_KEY, null);
}

export function saveUser(user: UserAccount | null): void {
  if (user) saveToStorage(USER_KEY, user);
  else localStorage.removeItem(USER_KEY);
}

/** Build subscription when a user signs in / opens the app */
export function subscriptionForUser(email: string, existing?: SubscriptionState | null): SubscriptionState {
  if (isAdminEmail(email)) {
    return {
      status: 'active',
      planName: 'Admin — Lifetime Full Pro Access',
      priceMonthly: 0,
      currency: 'USD',
      isFireOSCompatible: true,
      autoRenew: false,
      trialStartDate: existing?.trialStartDate || new Date().toISOString(),
      trialEndDate: undefined,
      paymentMethod: 'Admin Direct Authorization',
      lastPaymentDate: new Date().toISOString(),
      nextPaymentDue: 'Never (Lifetime Admin)',
      amountPaid: 0,
      transactionId: 'ADM-LIFETIME-PRO',
    };
  }

  const now = new Date();
  // Already active (paid Pro)
  if (existing && existing.status === 'active') {
    return existing;
  }

  // Already had trial: check if expired
  if (existing && existing.trialEndDate) {
    const end = new Date(existing.trialEndDate);
    if (now > end) {
      return {
        ...existing,
        status: 'expired',
        planName: 'Pro Tier (7-Day Trial Expired)',
        autoRenew: false,
        nextPaymentDue: 'Immediate (Trial Expired)',
      };
    }
    return {
      ...existing,
      status: 'trial',
    };
  }

  // New user / fresh sign-in: Automatically start 7-day free trial
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    status: 'trial',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    planName: 'Pro Monthly (7-Day Free Trial - Basic Functions)',
    priceMonthly: 4.99,
    currency: 'USD',
    isFireOSCompatible: true,
    autoRenew: true,
    paymentMethod: 'Trial Period ($0.00 today)',
    nextPaymentDue: trialEnd.toISOString(),
    amountPaid: 0,
  };
}

export function isProTab(tab: string): boolean {
  // Pro-exclusive features (locked during 7-day basic trial or expired trial)
  const proTabs = ['podcast', 'mockexam', 'canvas', 'upload', 'analytics'];
  return proTabs.includes(tab);
}

export function isFeatureAccessible(
  tab: string,
  sub: SubscriptionState,
  isAdmin: boolean
): { accessible: boolean; reason?: 'trial_expired' | 'pro_only_in_trial' | 'pending_verification' } {
  if (isAdmin || sub.status === 'active') {
    return { accessible: true };
  }

  if (sub.status === 'pending_verification') {
    return { accessible: false, reason: 'pending_verification' };
  }

  if (sub.status === 'expired') {
    return { accessible: false, reason: 'trial_expired' };
  }

  if (sub.status === 'trial') {
    if (isProTab(tab)) {
      return { accessible: false, reason: 'pro_only_in_trial' };
    }
    return { accessible: true };
  }

  return { accessible: false, reason: 'trial_expired' };
}

export interface PaymentDetailsInput {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  postalCode: string;
  country: string;
  currency: CurrencyCode;
  amount: number;
  paymentType: 'card' | 'paypal' | 'amazon' | 'capitec';
  customReference?: string;
  paypalTransactionId?: string;
}

export function submitPaymentClaim(
  currentSub: SubscriptionState,
  details: PaymentDetailsInput,
  userEmail?: string,
  userName?: string
): SubscriptionState {
  const now = new Date();
  let methodLabel = '';
  let txnId = '';

  if (details.paymentType === 'capitec') {
    txnId = details.customReference?.trim() || `CAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    methodLabel = `Capitec Bank EFT (Ref: ${txnId}, Acc: 2557334258)`;
  } else if (details.paymentType === 'paypal') {
    txnId = details.paypalTransactionId?.trim() || `PP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    methodLabel = `PayPal Checkout (Ref: ${txnId})`;
  } else if (details.paymentType === 'card') {
    const cleanDigits = details.cardNumber.replace(/\D/g, '');
    const last4 = cleanDigits.slice(-4) || '4242';
    methodLabel = `Card ending in ${last4}`;
    txnId = `CARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  } else {
    methodLabel = 'Amazon Fire In-App Checkout';
    txnId = `AMZN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  // Set to pending_verification - DOES NOT grant free Pro until Admin settles
  const updated: SubscriptionState = {
    status: 'pending_verification',
    planName: `StudyHub Pro (${details.currency} ${details.amount.toFixed(2)}/mo) — Pending Bank Verification`,
    priceMonthly: details.amount,
    currency: details.currency,
    isFireOSCompatible: true,
    autoRenew: false,
    paymentMethod: methodLabel,
    lastPaymentDate: now.toISOString(),
    nextPaymentDue: 'Pending Admin Bank Confirmation',
    amountPaid: 0,
    transactionId: txnId,
    trialStartDate: currentSub.trialStartDate,
    trialEndDate: currentSub.trialEndDate,
  };

  saveToStorage(SUB_KEY, updated);

  return updated;
}

export function activateProWithPayment(
  currentSub: SubscriptionState,
  details: PaymentDetailsInput,
  userEmail?: string,
  userName?: string
): SubscriptionState {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let methodLabel = '';
  let txnId = '';

  if (details.paymentType === 'card') {
    const cleanDigits = details.cardNumber.replace(/\D/g, '');
    const last4 = cleanDigits.slice(-4) || '4242';
    methodLabel = `Card ending in ${last4}`;
    txnId = `CARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  } else if (details.paymentType === 'paypal') {
    txnId = details.paypalTransactionId?.trim() || `PP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    methodLabel = `PayPal Checkout (${txnId})`;
  } else if (details.paymentType === 'capitec') {
    txnId = details.customReference?.trim() || `EFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    methodLabel = `Capitec EFT (Ref: ${txnId})`;
  } else {
    methodLabel = 'Amazon Fire In-App 1-Click';
    txnId = `AMZN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  const updated: SubscriptionState = {
    status: 'active',
    planName: `StudyHub Pro (${details.currency} ${details.amount.toFixed(2)}/mo)`,
    priceMonthly: details.amount,
    currency: details.currency,
    isFireOSCompatible: true,
    autoRenew: true,
    paymentMethod: methodLabel,
    lastPaymentDate: now.toISOString(),
    nextPaymentDue: nextMonth.toISOString(),
    amountPaid: details.amount,
    transactionId: txnId,
    trialStartDate: currentSub.trialStartDate,
    trialEndDate: currentSub.trialEndDate,
  };

  saveToStorage(SUB_KEY, updated);

  // Sync with Admin Subscriber Ledger
  try {
    const emailToLog = userEmail || 'student@thestudyhub.app';
    const nameToLog = userName || emailToLog.split('@')[0];
    const existingSubsRaw = localStorage.getItem('studyhub_admin_subscribers');
    const existingSubs = existingSubsRaw ? JSON.parse(existingSubsRaw) : [];

    const existingIndex = existingSubs.findIndex((s: { email?: string }) => s.email?.toLowerCase() === emailToLog.toLowerCase());
    const newRecord = {
      id: `sub-${Date.now()}`,
      fullName: nameToLog,
      email: emailToLog,
      gradeLevel: 'grade-12',
      tier: 'Pro',
      currency: details.currency,
      amount: details.amount,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActiveDate: new Date().toISOString().split('T')[0],
      docsUploaded: 5,
      trialStartDate: currentSub.trialStartDate || new Date().toISOString().split('T')[0],
      trialEndDate: currentSub.trialEndDate || new Date().toISOString().split('T')[0],
      trialStatus: 'active',
      paymentDueDate: nextMonth.toISOString().split('T')[0],
      paymentStatus: 'Paid Pro',
      paymentMethod: methodLabel,
      lastPaymentAmount: details.amount,
      accessLevel: 'Full Pro Unlocked',
    };

    if (existingIndex >= 0) {
      existingSubs[existingIndex] = { ...existingSubs[existingIndex], ...newRecord };
    } else {
      existingSubs.unshift(newRecord);
    }
    localStorage.setItem('studyhub_admin_subscribers', JSON.stringify(existingSubs));
  } catch {
    // Non-blocking storage fail
  }

  return updated;
}

export function loginWithEmail(emailRaw: string, displayName?: string): UserAccount {
  const email = normalizeEmail(emailRaw);
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const user: UserAccount = {
    email,
    displayName: (displayName || email.split('@')[0]).trim(),
    createdAt: new Date().toISOString(),
    isAdmin: isAdminEmail(email),
  };

  saveUser(user);

  const existing = loadFromStorage<SubscriptionState | null>(SUB_KEY, null);
  const sub = subscriptionForUser(email, existing);
  saveToStorage(SUB_KEY, sub);

  return user;
}

export function logoutUser(): void {
  saveUser(null);
}

export function daysLeftInTrial(sub: SubscriptionState): number | null {
  if (sub.status !== 'trial' || !sub.trialEndDate) return null;
  const ms = new Date(sub.trialEndDate).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
