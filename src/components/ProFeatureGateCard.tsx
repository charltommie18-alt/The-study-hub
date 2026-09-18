import React from 'react';
import { Crown, Sparkles, CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { TabType } from '../types';

interface ProFeatureGateCardProps {
  tab: TabType;
  onOpenPaymentModal: () => void;
  onNavigateToBasicTab?: (tab: TabType) => void;
  trialDaysRemaining?: number | null;
}

const TAB_INFO: Record<string, { title: string; subtitle: string; benefits: string[] }> = {
  podcast: {
    title: 'Multilingual AI Audio Podcasts',
    subtitle: 'Generate high-fidelity conversational audio study sessions in English, Afrikaans, isiZulu, Spanish, and French.',
    benefits: [
      'Dual-host Socratic dialogue explaining complex topics',
      'Instant audio playback with background multitasking',
      'Downloadable MP3 audio scripts for offline commute study',
      'Variable playback speed (0.75x to 2.0x)',
    ],
  },
  mockexam: {
    title: 'Past Exam Papers & Official Memorandums',
    subtitle: 'Timed full-length exam simulations with AI step-by-step marking schemes and mark breakdown analytics.',
    benefits: [
      'Authentic exam papers for Grade 7 through University degrees',
      'Instant AI grade evaluation with rubric citations',
      'Exportable examiner memorandum PDFs',
      'Weakness diagnosis and targeted revision links',
    ],
  },
  canvas: {
    title: 'Visual Lab & Scientific Canvas',
    subtitle: 'Interactive visual workspace for engineering schematics, biological cell diagrams, and chemical equations.',
    benefits: [
      'Vector diagrams and labeled anatomical structures',
      'Freehand drawing with smart shape snapping',
      'Real-time LaTeX formula rendering and graphing',
      'High-resolution PNG and SVG diagram export',
    ],
  },
  upload: {
    title: 'Deep OCR & Unlimited Document Parsing',
    subtitle: 'Extract text, diagrams, and formulas from large textbooks, handwritten class notes, and PDF handouts.',
    benefits: [
      'Multi-page PDF, DOCX, and image OCR processing',
      'Automatic generation of study plans from course syllabi',
      'Instant conversion to 50+ smart flashcards in 1 click',
      'Automatic multiple-choice and conceptual quiz generation',
    ],
  },
  analytics: {
    title: 'Deep Learning Analytics & Data Export',
    subtitle: 'Comprehensive mastery tracking, retention curve prediction, and institution-ready PDF progress transcripts.',
    benefits: [
      'Spaced repetition memory decay curves',
      'Subject-by-subject mastery percentiles',
      'Exportable academic grade reports with teacher notes',
      'Peak focus hour optimization insights',
    ],
  },
};

export const ProFeatureGateCard: React.FC<ProFeatureGateCardProps> = ({
  tab,
  onOpenPaymentModal,
  onNavigateToBasicTab,
  trialDaysRemaining,
}) => {
  const feature = TAB_INFO[tab] || {
    title: 'The Study Hub Pro Feature',
    subtitle: 'Unlock full access to advanced AI study tools, deep analytics, and unlimited document processing.',
    benefits: [
      'Unlimited AI Socratic tutoring sessions',
      'Multilingual audio podcasts & audio study cards',
      'Official past exam papers & automated marking',
      'All device sync & Fire OS in-app access',
    ],
  };

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-2xs">
            <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-400/40" />
            <span>Pro Exclusive Feature</span>
          </div>

          {trialDaysRemaining !== null && trialDaysRemaining !== undefined && (
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              7-Day Trial (Basic Mode): <strong className="text-amber-600 dark:text-amber-400">{trialDaysRemaining}d remaining</strong>
            </div>
          )}
        </div>

        {/* Feature Title & Description */}
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-amber-500 shrink-0" />
            <span>{feature.title}</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {feature.subtitle}
          </p>
        </div>

        {/* Notice Explaining Trial Scope */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 mb-6 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>7-Day Free Trial Notice:</strong> You are currently on the trial tier with access to core basic study functions (Study Planner, Smart Flashcards, Focus Studio, Notes Summarizer, and Practice Quizzes). To access this advanced Pro tool, complete your payment details authorization.
          </div>
        </div>

        {/* Feature Benefits List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {feature.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onOpenPaymentModal}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 text-amber-200 fill-amber-200/30" />
            <span>Enter Payment Details & Activate Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onNavigateToBasicTab && (
            <button
              onClick={() => onNavigateToBasicTab('planner')}
              className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Continue with Basic Tools (Study Planner)
            </button>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 mt-6 pt-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit Secure Encryption</span>
          </span>
          <span>•</span>
          <span>Cancel anytime with 1 click</span>
          <span>•</span>
          <span>$0.00 charged during trial period</span>
        </div>

      </div>
    </div>
  );
};
