import { SubscriptionState } from '../types';
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
      planName: 'Admin — Always Free',
      priceMonthly: 0,
      currency: 'USD',
      isFireOSCompatible: true,
      autoRenew: false,
      trialStartDate: undefined,
      trialEndDate: undefined,
    };
  }

  const now = new Date();
  // Already on trial or paid — keep it, but expire trial if past end
  if (existing && (existing.status === 'trial' || existing.status === 'active')) {
    if (existing.status === 'trial' && existing.trialEndDate) {
      const end = new Date(existing.trialEndDate);
      if (now > end) {
        return {
          ...existing,
          status: 'free',
          planName: 'Free Tier (Trial Ended)',
          autoRenew: false,
        };
      }
    }
    return existing;
  }

  // New user / free user: start 7-day trial now
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    status: 'trial',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    planName: 'Pro Monthly (7-Day Free Trial)',
    priceMonthly: 4.99,
    currency: 'USD',
    isFireOSCompatible: true,
    autoRenew: true,
  };
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
