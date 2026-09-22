import { SubscriberRecord, CurrencyCode } from '../types';
import { PaymentAuditRecord } from '../serverSubscriberStore';

export interface SubscribersApiResponse {
  success: boolean;
  subscribers: SubscriberRecord[];
  total: number;
  totalAll: number;
  page: number;
  limit: number;
  totalPages: number;
  metrics: {
    totalSubscribers: number;
    todayDAU: number;
    activePaidPro: number;
    activeTrials: number;
    expiringSoon: number;
    expiredTrials: number;
    estimatedMRR: number;
    pendingPaymentsCount: number;
    lastUpdated: string;
  };
}

export async function fetchBackendSubscribers(params?: {
  status?: string;
  currency?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<SubscribersApiResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.currency) query.set('currency', params.currency);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await fetch(`/api/admin/subscribers?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch subscribers from backend: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchBackendMetrics() {
  const res = await fetch('/api/admin/metrics');
  if (!res.ok) {
    throw new Error('Failed to fetch metrics from backend');
  }
  return res.json();
}

export async function performSubscriberAction(id: string, action: string, payload?: any) {
  const res = await fetch(`/api/admin/subscribers/${encodeURIComponent(id)}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) {
    throw new Error('Failed to perform subscriber action');
  }
  return res.json();
}

export async function addBackendSubscriber(subscriber: Omit<SubscriberRecord, 'id'>) {
  const res = await fetch('/api/admin/subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriber),
  });
  if (!res.ok) {
    throw new Error('Failed to add subscriber');
  }
  return res.json();
}

export async function fetchPaymentAuditQueue(): Promise<{ success: boolean; queue: PaymentAuditRecord[] }> {
  const res = await fetch('/api/payments/queue');
  if (!res.ok) {
    throw new Error('Failed to fetch payment queue');
  }
  return res.json();
}

export async function submitPaymentProof(data: {
  studentEmail: string;
  studentName: string;
  paymentType: 'paypal' | 'capitec' | 'card' | 'amazon';
  amount: number;
  currency: CurrencyCode;
  reference: string;
  notes?: string;
}) {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to submit payment proof');
  }
  return res.json();
}

export async function settleBackendPayment(paymentId: string, notes?: string) {
  const res = await fetch('/api/payments/settle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, notes }),
  });
  if (!res.ok) {
    throw new Error('Failed to settle payment');
  }
  return res.json();
}

export async function resetBackendPin(): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/admin/reset-pin', { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to reset PIN');
  }
  return res.json();
}
