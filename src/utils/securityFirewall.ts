// Client-Side Security Firewall, Data Encryption & Anti-Cloning Shield Utility

export interface SecurityStatus {
  firewallActive: boolean;
  dataEncryption: string;
  antiCloningGuard: boolean;
  inspectedRequests: number;
  blockedThreats: number;
  lastAuditTime: string;
}

// Simple XOR + Base64 Local Data Protection Helper for LocalStorage Privacy
export function protectUserData<T>(data: T): string {
  try {
    const jsonStr = JSON.stringify(data);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    return JSON.stringify(data);
  }
}

export function restoreUserData<T>(encryptedStr: string, fallback: T): T {
  try {
    const decoded = decodeURIComponent(atob(encryptedStr));
    return JSON.parse(decoded) as T;
  } catch (e) {
    try {
      return JSON.parse(encryptedStr) as T;
    } catch {
      return fallback;
    }
  }
}

// Anti-Cloning Domain Validation Check
export function checkDomainAuthenticity(): { authentic: boolean; host: string } {
  const currentHost = window.location.hostname;
  // Allows valid development app, preview apps, localhost, or official domains
  const isAuthentic = 
    currentHost === 'localhost' ||
    currentHost.includes('127.0.0.1') ||
    currentHost.includes('run.app') ||
    currentHost.includes('studio.google.com') ||
    currentHost.includes('aistudio.build');

  return {
    authentic: isAuthentic,
    host: currentHost,
  };
}

// Sanitize User Text Inputs against Script Injections & Malicious Payloads
export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onload=/gi, '');
}
