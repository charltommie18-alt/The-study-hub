export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  branchCode: string;
  swiftBic: string;
  country: string;
}

export interface PaymentGatewayConfig {
  merchantName: string;
  paypalCheckoutUrl: string;
  paypalButtonId: string;
  bank: BankDetails;
  capitecBankingUrl: string;
  supportEmail: string;
  supportPhoneWhatsapp: string;
}

/**
 * Official verified merchant and banking configuration for The Study Hub
 */
export const OFFICIAL_PAYMENT_CONFIG: PaymentGatewayConfig = {
  merchantName: 'Ct Fun (The Study Hub)',
  paypalCheckoutUrl: 'https://www.paypal.com/ncp/payment/URJZ4DJH4RKHQ',
  paypalButtonId: 'URJZ4DJH4RKHQ',
  bank: {
    bankName: 'Capitec Bank',
    accountName: 'Ct Fun',
    accountNumber: '2557334258',
    accountType: 'Entrepreneur Account',
    branchCode: '470010',
    swiftBic: 'CABLZAJJ',
    country: 'South Africa',
  },
  capitecBankingUrl: 'https://direct.capitecbank.co.za/',
  supportEmail: 'charltommie18@gmail.com',
  supportPhoneWhatsapp: '+27 82 000 0000',
};

/**
 * Generate a unique payment reference for bank EFTs and manual verification
 */
export function generateStudentPaymentRef(userEmail: string): string {
  const prefix = 'HUB';
  const cleanEmail = (userEmail || 'STUDENT')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 6)
    .toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${cleanEmail}-${randomSuffix}`;
}

/**
 * Generate a direct WhatsApp link for sending proof of payment to Charl Tommie
 */
export function generateWhatsappProofUrl(
  studentName: string,
  studentEmail: string,
  reference: string,
  amount: number,
  currency: string,
  customPhone?: string
): string {
  const phone = (customPhone || OFFICIAL_PAYMENT_CONFIG.supportPhoneWhatsapp).replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    `*The Study Hub — Payment Proof Submission*\n\n` +
    `👤 Student: ${studentName || 'Learner'}\n` +
    `📧 Email: ${studentEmail}\n` +
    `💰 Amount: ${currency} ${amount.toFixed(2)}\n` +
    `🔖 Reference: ${reference}\n` +
    `🏦 Bank: Capitec Bank (Acc: 2557334258)\n\n` +
    `Hi Charl Tommie, I have completed my transfer for The Study Hub Pro. Attached is my proof of payment. Please confirm and activate my Pro access!`
  );
  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
}
