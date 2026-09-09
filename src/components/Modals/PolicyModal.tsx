import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, UserCheck, Lock, CreditCard } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'data';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'data'>(defaultTab);

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#F9F7F2] dark:bg-[#121613] w-full max-w-lg rounded-[28px] shadow-2xl border border-[#D9D1C7] dark:border-[#2B382D] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#EBE7DF] dark:border-[#2C3B2E]">
          <div>
            <h2 className="font-bold text-lg text-[#2D362E] dark:text-white">Policies</h2>
            <p className="text-[11px] text-[#7A746B] dark:text-[#A6C4A7] mt-0.5">
              Google Play & Amazon Appstore · Terms, Privacy & Student Data Protection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#EBE7DF] dark:hover:bg-[#1C241E] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#736B5E] dark:text-[#A6C4A7]" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-[#EBE7DF] dark:border-[#2C3B2E]">
          {(
            [
              { id: 'privacy' as const, label: 'Privacy Policy', icon: ShieldCheck },
              { id: 'terms' as const, label: 'Terms of Service', icon: FileText },
              { id: 'data' as const, label: 'Student Data & Billing', icon: UserCheck },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 px-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[#7A746B] dark:text-[#A6C4A7] hover:bg-[#D9D1C7]/50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs leading-relaxed text-[#3C3C3B] dark:text-[#E6E1D8]">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-900 dark:text-blue-200 text-[11px]">
                  <strong>Play Store & Amazon Appstore Compliant:</strong> The Study Hub uses an
                  offline-first design. Notes, flashcards, and focus data are stored locally on your
                  device where possible.
                </p>
              </div>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">1. Information We Collect</h3>
              <p>
                We do not sell personal student information to advertisers. Local app state (subjects,
                notes, quiz scores, settings, subscription status) is stored in device storage
                (localStorage). AI features may send the text you submit to our secure server for
                processing with Google Gemini; that content is used only to generate your requested
                study output.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">2. AI Processing</h3>
              <p>
                When you use summarisation, flashcards, quizzes, or the AI tutor, the content you
                provide is processed to return results. Do not submit sensitive personal data you do
                not want processed.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">3. Third Parties</h3>
              <p>
                Payments on Amazon devices are handled by Amazon In-App Purchasing. Amazon&apos;s
                privacy policy applies to those transactions. We do not run third-party ad networks
                inside the app.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">4. Contact</h3>
              <p>
                For privacy requests related to The Study Hub, use the support contact listed on the
                Amazon Appstore or Google Play listing for package{' '}
                <span className="font-mono">com.studyhub.app</span>.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">1. Service Description</h3>
              <p>
                The Study Hub is an AI study companion (notes, flashcards, quizzes, focus tools, and
                related features). Features may change as the product improves.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">2. Your Content</h3>
              <p>
                You retain ownership of notes and materials you create or upload. You may export or
                delete local data at any time.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">3. Acceptable Use</h3>
              <p>
                You agree not to misuse the service, attempt to disrupt it, or use it for unlawful
                academic misconduct beyond normal personal study assistance.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">4. Appstore Distribution</h3>
              <p>
                Distribution through Google Play (<span className="font-mono">com.studyhub.app</span>)
                and Amazon Appstore (<span className="font-mono">com.studyhub.app</span>) follows each
                store&apos;s developer policies.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">5. Subscription Terms</h3>
              <p>
                Pro Monthly is offered with a 7-day free trial where available, then a recurring
                monthly fee (e.g. $4.99 USD or local equivalent). By starting a trial or paid plan you
                agree to the billing and cancellation rules in the Student Data & Billing tab.
              </p>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-900 dark:text-amber-200 text-[11px]">
                  <strong>Student safety:</strong> No ad tracking cookies. Study progress stays under
                  your control on the device wherever the app runs offline-first.
                </p>
              </div>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">1. Student Data</h3>
              <p>
                Quiz results, focus logs, and notes remain on your device unless you use a cloud or AI
                feature that requires a network request. You can clear data via settings, admin tools,
                or browser/device storage controls.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                2. How to Cancel Your Subscription
              </h3>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <strong>In the app:</strong> Open Pro / Subscription → Cancel subscription → confirm.
                  This turns off auto-renew in the app and returns you to Free Tier.
                </li>
                <li>
                  <strong>Amazon Appstore / Fire devices:</strong> Open the Amazon Appstore or Amazon
                  account on your device → <strong>Memberships & Subscriptions</strong> (or Account →
                  Settings → Subscriptions) → find The Study Hub → Cancel subscription.
                </li>
                <li>
                  <strong>During the 7-day free trial:</strong> Cancel before the trial ends to avoid
                  being charged for the first paid month.
                </li>
                <li>
                  Cancelling stops future renewals. It does not delete your local study data unless you
                  clear it yourself.
                </li>
              </ul>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">3. Refunds</h3>
              <p>
                Refund requests for Amazon purchases are handled under Amazon&apos;s refund policies
                through your Amazon account. Contact Amazon Customer Service for store billing issues.
              </p>

              <h3 className="font-bold text-sm text-[#2D362E] dark:text-white">4. No Third-Party Ads</h3>
              <p>
                The Study Hub does not include third-party advertising networks inside the study
                experience.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#EBE7DF] dark:bg-[#161C17] border-t border-[#D9D1C7] dark:border-[#2B382D] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
