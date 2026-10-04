import { SubscriptionState, CurrencyCode } from '../types';
import { loadFromStorage, saveToStorage } from './storage';

/** Admin account — strictly locked to Charl Tommie with PIN 10111 */
export const ADMIN_EMAILS = [
  'charltommie18@gmail.com',
  'charltommie18@gmail',
];

export const AUTHORIZED_ADMIN_PIN = '10111';

export interface UserAccount {
  email: string;
  displayName: string;
  createdAt: string;
  isAdmin: boolean;
}

const USER_KEY = 'studyhub_user_account';
const SUB_KEY = 'studyhub_subscription';
const ADMIN_UNLOCKED_KEY = 'studyhub_admin_unlocked';
const PERMANENT_LOCKOUT_KEY = 'studyhub_permanent_lockout_registry';
const DEVICE_LOCKOUT_KEY = 'studyhub_device_trial_exhausted';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const e = normalizeEmail(email);
  return ADMIN_EMAILS.includes(e);
}

/**
 * Checks whether an account's 7-day trial has permanently expired and cannot be reset.
 */
export function isEmailTrialExpiredOrLocked(email: string): boolean {
  if (!email || isAdminEmail(email)) return false;
  const clean = normalizeEmail(email);

  try {
    const raw = localStorage.getItem(PERMANENT_LOCKOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed[clean]?.locked) {
        return true;
      }
    }
  } catch {}

  try {
    const devLock = localStorage.getItem(DEVICE_LOCKOUT_KEY);
    if (devLock && devLock === clean) {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Hardcodes a permanent lockout on an email so the 7-day trial can NEVER be reset.
 */
export function permanentlyLockTrial(email: string, reason?: string, originalEndDate?: string): void {
  if (!email || isAdminEmail(email)) return;
  const clean = normalizeEmail(email);

  try {
    let registry: Record<string, any> = {};
    const raw = localStorage.getItem(PERMANENT_LOCKOUT_KEY);
    if (raw) {
      registry = JSON.parse(raw) || {};
    }
    registry[clean] = {
      locked: true,
      lockedAt: new Date().toISOString(),
      reason: reason || '7-Day Free Trial period ended. Anti-reset lock active.',
      trialEndedAt: originalEndDate || new Date().toISOString(),
    };
    localStorage.setItem(PERMANENT_LOCKOUT_KEY, JSON.stringify(registry));
    localStorage.setItem(DEVICE_LOCKOUT_KEY, clean);
  } catch {}

  // Synchronize lock with backend server
  try {
    fetch('/api/user/lock-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean, reason: reason || 'Trial period expired' }),
    }).catch(() => {});
  } catch {}
}

export function verifyAdminPin(pin: string): boolean {
  return pin.trim() === AUTHORIZED_ADMIN_PIN;
}

export function isAdminAuthenticated(): boolean {
  try {
    return localStorage.getItem(ADMIN_UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function loginWithAdminPin(pin: string): UserAccount {
  if (!verifyAdminPin(pin)) {
    throw new Error('Invalid Admin PIN. Access denied.');
  }

  try {
    localStorage.setItem('studyhub_admin_pin', AUTHORIZED_ADMIN_PIN);
    localStorage.setItem(ADMIN_UNLOCKED_KEY, 'true');
  } catch {}

  const adminUser: UserAccount = {
    email: 'charltommie18@gmail.com',
    displayName: 'Charl Tommie (Admin)',
    createdAt: new Date().toISOString(),
    isAdmin: true,
  };

  saveUser(adminUser);
  const adminSub = subscriptionForUser(adminUser.email);
  saveToStorage(SUB_KEY, adminSub);

  return adminUser;
}

export function lockAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_UNLOCKED_KEY);
  } catch {}
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
      isLockedOut: false,
    };
  }

  const now = new Date();
  const cleanEmail = normalizeEmail(email);
  const isAlreadyLocked = isEmailTrialExpiredOrLocked(cleanEmail);

  // 1. Legitimate paid Pro subscriber (verified with real amountPaid and valid transactionId)
  if (existing && existing.status === 'active') {
    const isUnverifiedFreePro = !existing.amountPaid || existing.amountPaid <= 0 || !existing.transactionId || existing.transactionId.startsWith('ADM-');
    if (!isUnverifiedFreePro) {
      return {
        ...existing,
        isLockedOut: false,
      };
    }
    // If unverified free Pro: check if their original trial had already ended
    const trialEnded = isAlreadyLocked || (existing.trialEndDate && new Date(existing.trialEndDate) < now);
    if (trialEnded) {
      permanentlyLockTrial(cleanEmail, 'Trial expired & unverified Pro revoked', existing.trialEndDate);
      const lockedSub: SubscriptionState = {
        ...existing,
        status: 'expired',
        isLockedOut: true,
        lockReason: 'Your 7-day free trial has expired. Trial reset is disabled. Please subscribe to unlock.',
        planName: 'Pro Tier (7-Day Trial Expired — Account Locked)',
        priceMonthly: 4.99,
        autoRenew: false,
        paymentMethod: 'Trial Expired (Subscription Required)',
        nextPaymentDue: 'Immediate (Trial Expired)',
        amountPaid: 0,
      };
      saveToStorage(SUB_KEY, lockedSub);
      return lockedSub;
    }
  }

  // 2. Pending verification (awaiting admin settlement)
  if (existing && existing.status === 'pending_verification') {
    return {
      ...existing,
      isLockedOut: false,
    };
  }

  // 3. HARDCODED LOCKOUT CHECK: If already locked in registry OR status is expired OR trialEndDate is past
  const isExpired = isAlreadyLocked || 
    existing?.status === 'expired' || 
    (existing?.trialEndDate && new Date(existing.trialEndDate) < now);

  if (isExpired) {
    permanentlyLockTrial(cleanEmail, '7-Day Free Trial period ended', existing?.trialEndDate);
    const lockedSub: SubscriptionState = {
      status: 'expired',
      isLockedOut: true,
      lockReason: '7-Day Free Trial period has permanently ended. Trial reset is hardcoded locked. Active subscription required to regain access.',
      planName: 'Pro Tier (7-Day Trial Expired — Account Locked)',
      priceMonthly: 4.99,
      currency: existing?.currency || 'USD',
      isFireOSCompatible: true,
      autoRenew: false,
      trialStartDate: existing?.trialStartDate || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndDate: existing?.trialEndDate || now.toISOString(),
      paymentMethod: 'Trial Expired (Subscription Required)',
      nextPaymentDue: 'Immediate (Account Locked)',
      amountPaid: 0,
    };
    saveToStorage(SUB_KEY, lockedSub);
    return lockedSub;
  }

  // 4. Existing active trial that hasn't expired yet: preserve their exact remaining time
  if (existing && existing.trialEndDate && new Date(existing.trialEndDate) >= now) {
    return {
      ...existing,
      status: 'trial',
      isLockedOut: false,
    };
  }

  // 5. Fresh user sign-in: ONLY if they have never had an expired trial
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const newTrialSub: SubscriptionState = {
    status: 'trial',
    isLockedOut: false,
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
  saveToStorage(SUB_KEY, newTrialSub);
  return newTrialSub;
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

  if (sub.status === 'expired' || sub.isLockedOut) {
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

/**
 * Automatically audits stored local subscription and downgrades any unearned free Pro to trial
 */
export function enforceZeroFreeProPolicy(): void {
  try {
    const user = loadUser();
    if (user && isAdminEmail(user.email)) return;

    const sub = loadFromStorage<SubscriptionState | null>(SUB_KEY, null);
    if (!sub) return;

    if (sub.status === 'active') {
      const isUnverified = !sub.amountPaid || sub.amountPaid <= 0 || !sub.transactionId || sub.transactionId.startsWith('ADM-');
      if (isUnverified) {
        const now = new Date();
        const userEmail = user?.email || '';
        const isLocked = isEmailTrialExpiredOrLocked(userEmail);
        const isExpired = isLocked || (sub.trialEndDate && new Date(sub.trialEndDate) < now);

        if (isExpired) {
          permanentlyLockTrial(userEmail, 'Unearned Pro revoked and trial expired', sub.trialEndDate);
          const returnedSub: SubscriptionState = {
            ...sub,
            status: 'expired',
            isLockedOut: true,
            lockReason: '7-Day Free Trial period ended. Account locked out. Subscription required.',
            planName: 'Pro Tier (7-Day Trial Expired — Account Locked)',
            priceMonthly: 4.99,
            autoRenew: false,
            paymentMethod: 'Trial Expired (Subscription Required)',
            nextPaymentDue: 'Immediate (Trial Expired)',
            amountPaid: 0,
          };
          saveToStorage(SUB_KEY, returnedSub);
        } else {
          // Still within initial trial window
          const returnedSub: SubscriptionState = {
            ...sub,
            status: 'trial',
            isLockedOut: false,
            planName: 'Pro Monthly (7-Day Free Trial - Basic Functions)',
            priceMonthly: 4.99,
            autoRenew: false,
            paymentMethod: '7-Day Free Trial ($0.00 today)',
            amountPaid: 0,
          };
          saveToStorage(SUB_KEY, returnedSub);
        }
      }
    }

    // Also sanitize any local demo subscribers
    const localSubsRaw = localStorage.getItem('studyhub_admin_subscribers');
    if (localSubsRaw) {
      const parsed = JSON.parse(localSubsRaw);
      if (Array.isArray(parsed)) {
        let changed = false;
        parsed.forEach((s: any) => {
          if (s.tier === 'Pro' || s.accessLevel === 'Full Pro Unlocked' || s.trialStatus === 'active') {
            s.tier = 'Free';
            s.trialStatus = 'trial';
            s.accessLevel = 'Basic (Trial)';
            s.paymentStatus = 'Active Trial ($0)';
            s.amount = 0;
            s.lastPaymentAmount = 0;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('studyhub_admin_subscribers', JSON.stringify(parsed));
        }
      }
    }
  } catch {}
}
