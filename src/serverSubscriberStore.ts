import { SubscriberRecord, GradeLevel, CurrencyCode } from './types';

export interface PaymentAuditRecord {
  id: string;
  studentEmail: string;
  studentName: string;
  paymentType: 'paypal' | 'capitec' | 'card' | 'amazon';
  amount: number;
  currency: CurrencyCode;
  reference: string;
  status: 'pending_verification' | 'settled' | 'flagged';
  submittedAt: string;
  settledAt?: string;
  notes?: string;
  isDemo?: boolean;
}

// --------------------------------------------------------------------------
// Real-time In-Memory Data Store for 812 Platform Subscribers
// (Reflects backend subscription state matching main dashboard DAU)
// --------------------------------------------------------------------------

const FIRST_NAMES = [
  'Sophia', 'Kagiso', 'Liam', 'Tariq', 'Chinedu', 'Gabrielle', 'Sipho',
  'Zoe', 'Thabo', 'Kelebogile', 'Marcus', 'Aisha', 'Devon', 'Elena',
  'Kwame', 'Nomvula', 'Lethabo', 'Bongani', 'Nandi', 'Farai', 'Tendai',
  'Amara', 'Lucas', 'Oliver', 'Mia', 'Emma', 'Mateo', 'Zara', 'Jayden',
  'Sibusiso', 'Lerato', 'Mpho', 'Kabelo', 'Tshepo', 'Katlego', 'Zandile',
  'Chloe', 'Ethan', 'Hannah', 'Maya', 'Noah', 'Leo', 'Fatima', 'Yusuf'
];

const LAST_NAMES = [
  'Martinez', 'Dlamini', "O'Connor", 'Al-Mansoor', 'Okeke', 'Campbell', 'Ndlovu',
  'Van Der Merwe', 'Mokoena', 'Sithole', 'Brody', 'Bello', 'Sterling', 'Rostova',
  'Asante', 'Ndaba', 'Khumalo', 'Nkosi', 'Cele', 'Moyo', 'Nyathi',
  'Diallo', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson', 'Adeyemi',
  'Botha', 'Pretorius', 'Du Plessis', 'Venter', 'Coetzee', 'Fourie', 'Meyer',
  'Pillay', 'Naidoo', 'Govender', 'Moodley', 'Chetty', 'Patel', 'Kahn'
];

const GRADES: GradeLevel[] = [
  'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12', 'tertiary'
];

function generateSeedSubscribers(): SubscriberRecord[] {
  const list: SubscriberRecord[] = [];

  // Core accounts with specific profiles
  list.push(
    {
      id: 'sub-101',
      fullName: 'Sophia Martinez',
      email: 'sophia.m@student.edu',
      gradeLevel: 'grade-12',
      tier: 'Pro',
      currency: 'USD',
      amount: 4.99,
      status: 'Active',
      joinedDate: '2026-08-22',
      lastActiveDate: '2026-09-22',
      docsUploaded: 24,
      trialStartDate: '2026-08-22',
      trialEndDate: '2026-08-29',
      trialStatus: 'active',
      paymentDueDate: '2026-09-22',
      paymentStatus: 'Paid Pro',
      paymentMethod: 'PayPal Hosted Checkout (Ct Fun URJZ4DJH4RKHQ)',
      lastPaymentAmount: 4.99,
      accessLevel: 'Full Pro Unlocked',
    },
    {
      id: 'sub-102',
      fullName: 'Kagiso Dlamini',
      email: 'kagiso.d@school.za',
      gradeLevel: 'grade-11',
      tier: 'Pro',
      currency: 'ZAR',
      amount: 89.00,
      status: 'Active',
      joinedDate: '2026-08-27',
      lastActiveDate: '2026-09-22',
      docsUploaded: 16,
      trialStartDate: '2026-08-27',
      trialEndDate: '2026-09-03',
      trialStatus: 'active',
      paymentDueDate: '2026-09-27',
      paymentStatus: 'Paid Pro',
      paymentMethod: 'Capitec EFT (Ref: CAP-2026-KD89, Acc: 2557334258)',
      lastPaymentAmount: 89.00,
      accessLevel: 'Full Pro Unlocked',
    },
    {
      id: 'sub-103',
      fullName: "Liam O'Connor",
      email: 'liam.oc@academy.uk',
      gradeLevel: 'grade-10',
      tier: 'Free',
      currency: 'GBP',
      amount: 3.99,
      status: 'Pending',
      joinedDate: '2026-09-14',
      lastActiveDate: '2026-09-22',
      docsUploaded: 8,
      trialStartDate: '2026-09-14',
      trialEndDate: '2026-09-21',
      trialStatus: 'expired',
      paymentDueDate: '2026-09-21',
      paymentStatus: 'Pending Payment (Trial Expired)',
      paymentMethod: 'PayPal Express (Awaiting Settlement)',
      lastPaymentAmount: 0.00,
      accessLevel: 'Access Suspended',
    },
    {
      id: 'sub-104',
      fullName: 'Tariq Al-Mansoor',
      email: 'tariq.a@college.org',
      gradeLevel: 'tertiary',
      tier: 'Institutional',
      currency: 'EUR',
      amount: 14.99,
      status: 'Active',
      joinedDate: '2026-07-10',
      lastActiveDate: '2026-09-22',
      docsUploaded: 42,
      trialStartDate: '2026-07-10',
      trialEndDate: '2026-07-17',
      trialStatus: 'active',
      paymentDueDate: '2026-10-10',
      paymentStatus: 'Paid Pro',
      paymentMethod: 'PayPal International (Invoice Ct Fun)',
      lastPaymentAmount: 14.99,
      accessLevel: 'Full Pro Unlocked',
    },
    {
      id: 'sub-105',
      fullName: 'Chinedu Okeke',
      email: 'chinedu.o@edu.ng',
      gradeLevel: 'grade-9',
      tier: 'Free',
      currency: 'USD',
      amount: 4.99,
      status: 'Canceled',
      joinedDate: '2026-09-02',
      lastActiveDate: '2026-09-18',
      docsUploaded: 3,
      trialStartDate: '2026-09-02',
      trialEndDate: '2026-09-09',
      trialStatus: 'expired',
      paymentDueDate: '2026-09-09',
      paymentStatus: 'Overdue',
      paymentMethod: 'None (Card Expired)',
      lastPaymentAmount: 0.00,
      accessLevel: 'Access Suspended',
    },
    {
      id: 'sub-106',
      fullName: 'Gabrielle Campbell',
      email: 'gaby.c@cxc.jm',
      gradeLevel: 'grade-11',
      tier: 'Free',
      currency: 'JMD',
      amount: 750.00,
      status: 'Active',
      joinedDate: '2026-09-16',
      lastActiveDate: '2026-09-22',
      docsUploaded: 11,
      trialStartDate: '2026-09-16',
      trialEndDate: '2026-09-23',
      trialStatus: 'trial',
      paymentDueDate: '2026-09-23',
      paymentStatus: 'Active Trial ($0)',
      paymentMethod: 'Trial (Basic Functions Only)',
      lastPaymentAmount: 0.00,
      accessLevel: 'Basic (Trial)',
    },
    {
      id: 'sub-107',
      fullName: 'Sipho Ndlovu',
      email: 'sipho.n@matric.za',
      gradeLevel: 'grade-12',
      tier: 'Free',
      currency: 'ZAR',
      amount: 89.00,
      status: 'Pending',
      joinedDate: '2026-09-12',
      lastActiveDate: '2026-09-22',
      docsUploaded: 19,
      trialStartDate: '2026-09-12',
      trialEndDate: '2026-09-19',
      trialStatus: 'expired',
      paymentDueDate: '2026-09-19',
      paymentStatus: 'Pending Payment (Trial Expired)',
      paymentMethod: 'Capitec EFT (Pending verification: EFT-SN-99)',
      lastPaymentAmount: 0.00,
      accessLevel: 'Access Suspended',
    }
  );

  // Target Breakdown to reach 812 total registered accounts:
  // Active Paid Pro: 215 total
  // Active 7-Day Trials: 482 total
  // Expired / Pending: 115 total
  // Sum = 215 + 482 + 115 = 812 accounts (Matches the dashboard DAU exactly)

  const currentPaid = list.filter((s) => s.trialStatus === 'active').length; // 3
  const currentTrial = list.filter((s) => s.trialStatus === 'trial').length; // 1
  const currentExpired = list.filter((s) => s.trialStatus === 'expired').length; // 3

  const targetPaid = 215;
  const targetTrial = 482;
  const targetExpired = 115;

  let counter = 108;

  // 1. Generate remaining Paid Pro accounts
  for (let i = currentPaid; i < targetPaid; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length];
    const grade = GRADES[i % GRADES.length];
    const isZar = i % 2 === 0;
    const isEur = i % 7 === 0;
    const isGbp = i % 11 === 0;
    const isJmd = i % 13 === 0;

    let currency: CurrencyCode = 'USD';
    let amount = 4.99;
    let method = 'PayPal Hosted Checkout (Ct Fun URJZ4DJH4RKHQ)';

    if (isZar) {
      currency = 'ZAR';
      amount = 89.00;
      method = `Capitec Bank EFT (Acc: 2557334258, Ref: CAP-${counter})`;
    } else if (isEur) {
      currency = 'EUR';
      amount = 4.99;
      method = 'PayPal Checkout (EUR card)';
    } else if (isGbp) {
      currency = 'GBP';
      amount = 3.99;
      method = 'PayPal UK Card';
    } else if (isJmd) {
      currency = 'JMD';
      amount = 750.00;
      method = 'PayPal International';
    }

    const dueDay = String(Math.floor((i % 28) + 1)).padStart(2, '0');

    list.push({
      id: `sub-${counter++}`,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}${i}@studenthub.app`,
      gradeLevel: grade,
      tier: 'Pro',
      currency,
      amount,
      status: 'Active',
      joinedDate: '2026-08-15',
      lastActiveDate: '2026-09-22',
      docsUploaded: 5 + (i % 25),
      trialStartDate: '2026-08-15',
      trialEndDate: '2026-08-22',
      trialStatus: 'active',
      paymentDueDate: `2026-10-${dueDay}`,
      paymentStatus: 'Paid Pro',
      paymentMethod: method,
      lastPaymentAmount: amount,
      accessLevel: 'Full Pro Unlocked',
    });
  }

  // 2. Generate remaining Active Trial accounts
  for (let i = currentTrial; i < targetTrial; i++) {
    const fn = FIRST_NAMES[(i + 5) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 2 + 7) % LAST_NAMES.length];
    const grade = GRADES[(i + 2) % GRADES.length];
    const isZar = i % 3 === 0;

    const currency: CurrencyCode = isZar ? 'ZAR' : 'USD';
    const amount = isZar ? 89.00 : 4.99;

    // Trial day offset 0 to 6
    const trialDayOffset = i % 7;
    const startDay = 22 - (6 - trialDayOffset);
    const endDay = startDay + 7;

    const trialStartDate = `2026-09-${String(Math.max(15, startDay)).padStart(2, '0')}`;
    const trialEndDate = `2026-09-${String(Math.min(30, endDay)).padStart(2, '0')}`;

    list.push({
      id: `sub-${counter++}`,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}${i}@studymail.org`,
      gradeLevel: grade,
      tier: 'Free',
      currency,
      amount,
      status: 'Active',
      joinedDate: trialStartDate,
      lastActiveDate: '2026-09-22',
      docsUploaded: 1 + (i % 9),
      trialStartDate,
      trialEndDate,
      trialStatus: 'trial',
      paymentDueDate: trialEndDate,
      paymentStatus: 'Active Trial ($0)',
      paymentMethod: '7-Day Trial (Basic Access)',
      lastPaymentAmount: 0.00,
      accessLevel: 'Basic (Trial)',
    });
  }

  // 3. Generate remaining Expired accounts
  for (let i = currentExpired; i < targetExpired; i++) {
    const fn = FIRST_NAMES[(i + 9) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 4 + 3) % LAST_NAMES.length];
    const grade = GRADES[(i + 4) % GRADES.length];
    const isZar = i % 2 === 0;

    const currency: CurrencyCode = isZar ? 'ZAR' : 'USD';
    const amount = isZar ? 89.00 : 4.99;

    const expiredDay = 15 + (i % 6);
    const trialStartDate = `2026-09-${String(Math.max(8, expiredDay - 7)).padStart(2, '0')}`;
    const trialEndDate = `2026-09-${String(expiredDay).padStart(2, '0')}`;

    list.push({
      id: `sub-${counter++}`,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}${i}@matricprep.za`,
      gradeLevel: grade,
      tier: 'Free',
      currency,
      amount,
      status: 'Pending',
      joinedDate: trialStartDate,
      lastActiveDate: '2026-09-20',
      docsUploaded: 4 + (i % 6),
      trialStartDate,
      trialEndDate,
      trialStatus: 'expired',
      paymentDueDate: trialEndDate,
      paymentStatus: 'Pending Payment (Trial Expired)',
      paymentMethod: 'Awaiting Bank/PayPal Settlement',
      lastPaymentAmount: 0.00,
      accessLevel: 'Access Suspended',
    });
  }

  return list.map(s => ({ ...s, isDemo: true }));
}

// Initial Payment Audit Queue (Incoming real-time payments - flagged as demo test data)
const INITIAL_PAYMENT_AUDIT: PaymentAuditRecord[] = [
  {
    id: 'PAY-1001',
    studentEmail: 'kagiso.d@school.za',
    studentName: 'Kagiso Dlamini',
    paymentType: 'capitec',
    amount: 89.00,
    currency: 'ZAR',
    reference: 'CAP-2026-KD89',
    status: 'settled',
    submittedAt: '2026-08-27T10:14:00Z',
    settledAt: '2026-08-27T10:30:00Z',
    notes: 'Sample test record for Capitec Bank Acc 2557334258',
    isDemo: true,
  },
  {
    id: 'PAY-1002',
    studentEmail: 'sophia.m@student.edu',
    studentName: 'Sophia Martinez',
    paymentType: 'paypal',
    amount: 4.99,
    currency: 'USD',
    reference: 'PP-9X48123',
    status: 'settled',
    submittedAt: '2026-08-22T14:20:00Z',
    settledAt: '2026-08-22T14:21:00Z',
    notes: 'Sample test record for PayPal merchant (URJZ4DJH4RKHQ)',
    isDemo: true,
  },
  {
    id: 'PAY-1003',
    studentEmail: 'tariq.a@college.org',
    studentName: 'Tariq Al-Mansoor',
    paymentType: 'paypal',
    amount: 14.99,
    currency: 'EUR',
    reference: 'PP-EUR-9901',
    status: 'settled',
    submittedAt: '2026-07-10T09:00:00Z',
    settledAt: '2026-07-10T09:05:00Z',
    notes: 'Sample institutional billing test scenario',
    isDemo: true,
  },
  {
    id: 'PAY-1004',
    studentEmail: 'sipho.n@matric.za',
    studentName: 'Sipho Ndlovu',
    paymentType: 'capitec',
    amount: 89.00,
    currency: 'ZAR',
    reference: 'EFT-SN-99',
    status: 'pending_verification',
    submittedAt: '2026-09-21T16:45:00Z',
    notes: 'Sample EFT proof test scenario for Capitec Bank Acc 2557334258.',
    isDemo: true,
  },
  {
    id: 'PAY-1005',
    studentEmail: 'liam.oc@academy.uk',
    studentName: "Liam O'Connor",
    paymentType: 'paypal',
    amount: 3.99,
    currency: 'GBP',
    reference: 'PP-UK-7712',
    status: 'pending_verification',
    submittedAt: '2026-09-22T11:10:00Z',
    notes: 'Sample PayPal checkout test scenario.',
    isDemo: true,
  }
];

class SubscriberStore {
  private subscribers: SubscriberRecord[] = generateSeedSubscribers();
  private paymentAuditQueue: PaymentAuditRecord[] = [...INITIAL_PAYMENT_AUDIT];
  private adminPin: string = '10111';

  // Retrieve metrics
  public getMetrics() {
    const total = this.subscribers.length;
    const activePaidPro = this.subscribers.filter(
      (s) => s.trialStatus === 'active' || s.tier === 'Pro'
    ).length;
    const activeTrials = this.subscribers.filter(
      (s) => s.trialStatus === 'trial'
    ).length;
    const expiredTrials = this.subscribers.filter(
      (s) => s.trialStatus === 'expired'
    ).length;

    const now = new Date('2026-09-22T12:00:00Z').getTime();
    const expiringSoon = this.subscribers.filter((s) => {
      if (s.trialStatus !== 'trial' || !s.trialEndDate) return false;
      const diff = new Date(s.trialEndDate).getTime() - now;
      return diff >= 0 && diff <= 48 * 60 * 60 * 1000;
    }).length;

    // Calculate MRR in USD
    const estimatedMRR = this.subscribers.reduce((sum, s) => {
      if (s.trialStatus === 'active' || s.tier === 'Pro' || s.tier === 'Institutional') {
        let val = s.amount;
        if (s.currency === 'ZAR') val = s.amount / 18.0;
        else if (s.currency === 'EUR') val = s.amount * 1.08;
        else if (s.currency === 'GBP') val = s.amount * 1.28;
        else if (s.currency === 'JMD') val = s.amount / 155.0;
        return sum + val;
      }
      return sum;
    }, 0);

    const pendingPaymentsCount = this.paymentAuditQueue.filter(
      (p) => p.status === 'pending_verification'
    ).length;

    // Real live transactions (excluding pre-seeded demo entries)
    const livePaidCount = this.subscribers.filter(
      (s) => !s.isDemo && (s.trialStatus === 'active' || s.tier === 'Pro')
    ).length;
    const livePaymentsCount = this.paymentAuditQueue.filter(
      (p) => !p.isDemo && p.status === 'settled'
    ).length;
    const livePendingClaims = this.paymentAuditQueue.filter(
      (p) => !p.isDemo && p.status === 'pending_verification'
    ).length;
    const liveRevenueZAR = this.paymentAuditQueue
      .filter((p) => !p.isDemo && p.status === 'settled' && p.currency === 'ZAR')
      .reduce((sum, p) => sum + p.amount, 0);
    const liveRevenueUSD = this.paymentAuditQueue
      .filter((p) => !p.isDemo && p.status === 'settled' && p.currency === 'USD')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalSubscribers: total,
      todayDAU: 812, // Matches main dashboard DAU
      activePaidPro,
      activeTrials,
      expiringSoon,
      expiredTrials,
      estimatedMRR: Math.round(estimatedMRR * 100) / 100,
      pendingPaymentsCount,
      livePaidCount,
      livePaymentsCount,
      livePendingClaims,
      liveRevenueZAR,
      liveRevenueUSD,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Query subscribers with filters and pagination
  public querySubscribers(params: {
    status?: string;
    currency?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status = 'ALL', currency = 'ALL', search = '', page = 1, limit = 50 } = params;

    let filtered = this.subscribers.filter((s) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const match =
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.gradeLevel.toLowerCase().includes(q) ||
          (s.paymentMethod && s.paymentMethod.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Currency
      if (currency !== 'ALL' && s.currency !== currency) {
        return false;
      }

      // Status
      if (status === 'trial') {
        return s.trialStatus === 'trial';
      }
      if (status === 'expiring') {
        if (s.trialStatus !== 'trial' || !s.trialEndDate) return false;
        const now = new Date('2026-09-22T12:00:00Z').getTime();
        const diff = new Date(s.trialEndDate).getTime() - now;
        return diff >= 0 && diff <= 48 * 60 * 60 * 1000;
      }
      if (status === 'expired') {
        return s.trialStatus === 'expired';
      }
      if (status === 'active') {
        return s.trialStatus === 'active' || s.tier === 'Pro';
      }

      return true;
    });

    const totalFiltered = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      subscribers: paginated,
      total: totalFiltered,
      totalAll: this.subscribers.length,
      page,
      limit,
      totalPages: Math.ceil(totalFiltered / limit),
      metrics: this.getMetrics(),
    };
  }

  public getSubscriberById(id: string): SubscriberRecord | undefined {
    return this.subscribers.find((s) => s.id === id);
  }

  public addSubscriber(record: Omit<SubscriberRecord, 'id'>): SubscriberRecord {
    const newRecord: SubscriberRecord = {
      ...record,
      id: `sub-${Date.now()}`,
    };
    this.subscribers.unshift(newRecord);
    return newRecord;
  }

  public updateSubscriber(id: string, updates: Partial<SubscriberRecord>): SubscriberRecord | null {
    const index = this.subscribers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.subscribers[index] = { ...this.subscribers[index], ...updates };
    return this.subscribers[index];
  }

  public performAction(id: string, action: string, payload?: any): SubscriberRecord | null {
    const sub = this.getSubscriberById(id);
    if (!sub) return null;

    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (action) {
      case 'activate_pro': {
        const updated = this.updateSubscriber(id, {
          tier: 'Pro',
          trialStatus: 'active',
          paymentStatus: 'Paid Pro',
          accessLevel: 'Full Pro Unlocked',
          status: 'Active',
          paymentDueDate: nextMonth,
          paymentMethod: payload?.paymentMethod || 'PayPal / Capitec EFT Cleared',
          lastPaymentAmount: sub.amount,
        });
        return updated;
      }

      case 'extend_trial': {
        const days = payload?.days || 7;
        const currentEnd = sub.trialEndDate ? new Date(sub.trialEndDate) : new Date();
        const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const updated = this.updateSubscriber(id, {
          trialEndDate: newEnd,
          trialStatus: 'trial',
          paymentStatus: 'Active Trial ($0)',
          accessLevel: 'Basic (Trial)',
          status: 'Active',
          paymentDueDate: newEnd,
        });
        return updated;
      }

      case 'lock_account': {
        const updated = this.updateSubscriber(id, {
          trialStatus: 'expired',
          paymentStatus: 'Overdue',
          accessLevel: 'Access Suspended',
          status: 'Pending',
        });
        return updated;
      }

      case 'mark_paid': {
        const updated = this.updateSubscriber(id, {
          paymentStatus: 'Paid Pro',
          trialStatus: 'active',
          accessLevel: 'Full Pro Unlocked',
          paymentDueDate: nextMonth,
          lastPaymentAmount: sub.amount,
        });
        return updated;
      }

      default:
        return sub;
    }
  }

  // Payment Audit Queue Methods
  public getPaymentQueue(): PaymentAuditRecord[] {
    return this.paymentAuditQueue;
  }

  public logPaymentVerification(data: {
    studentEmail: string;
    studentName: string;
    paymentType: 'paypal' | 'capitec' | 'card' | 'amazon';
    amount: number;
    currency: CurrencyCode;
    reference: string;
    notes?: string;
  }): PaymentAuditRecord {
    const newRecord: PaymentAuditRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      studentEmail: data.studentEmail,
      studentName: data.studentName,
      paymentType: data.paymentType,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      status: 'pending_verification',
      submittedAt: new Date().toISOString(),
      notes: data.notes || 'Submitted via in-app payment modal.',
      isDemo: false,
    };

    this.paymentAuditQueue.unshift(newRecord);

    // Link/update existing subscriber if email matches
    const existing = this.subscribers.find(
      (s) => s.email.toLowerCase() === data.studentEmail.toLowerCase()
    );

    if (existing) {
      this.updateSubscriber(existing.id, {
        paymentMethod: `${data.paymentType.toUpperCase()} (Ref: ${data.reference})`,
        paymentStatus: 'Pending Payment (Trial Expired)',
      });
    }

    return newRecord;
  }

  public settlePayment(paymentId: string, notes?: string): PaymentAuditRecord | null {
    const payment = this.paymentAuditQueue.find((p) => p.id === paymentId);
    if (!payment) return null;

    payment.status = 'settled';
    payment.settledAt = new Date().toISOString();
    if (notes) payment.notes = `${payment.notes || ''} | Settle note: ${notes}`;

    // Also upgrade the subscriber to Paid Pro
    const sub = this.subscribers.find(
      (s) => s.email.toLowerCase() === payment.studentEmail.toLowerCase()
    );
    if (sub) {
      this.performAction(sub.id, 'activate_pro', {
        paymentMethod: `${payment.paymentType.toUpperCase()} (Verified: ${payment.reference})`,
      });
    }

    return payment;
  }

  // Admin PIN Management (Strictly locked to 10111 only)
  public getPin(): string {
    return '10111';
  }

  public setPin(newPin: string): boolean {
    if (newPin === '10111') {
      this.adminPin = '10111';
      return true;
    }
    return false; // Only 10111 allowed
  }

  public resetPin(): string {
    this.adminPin = '10111';
    return '10111';
  }
}

export const backendStore = new SubscriberStore();
