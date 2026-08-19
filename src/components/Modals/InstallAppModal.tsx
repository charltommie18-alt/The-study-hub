import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Check, 
  Share, 
  PlusSquare, 
  Compass, 
  Laptop, 
  Monitor, 
  Sparkles,
  Tablet
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Copy app link as fallback
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D362E]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-[#161C18] border border-[#D9D1C7] dark:border-[#2C3B2E] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 text-[#3C3C3B] dark:text-[#F4F1EA]"
        tabIndex={0}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#8C857A] hover:text-[#2D362E] dark:hover:text-white rounded-full bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#EBE7DF] dark:border-[#2C3B2E] pb-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Download className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E2EFE3] dark:bg-emerald-950/80 border border-[#C5DCC6] dark:border-emerald-700 rounded-full text-[#5A6D5B] dark:text-emerald-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>OFFLINE PWA APP INSTALL</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D362E] dark:text-[#F4F1EA]">
              Download StudyHub to Homescreen
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-5">
          <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7] leading-relaxed">
            Install <strong className="text-[#2D362E] dark:text-white">StudyHub AI</strong> directly to your phone, tablet, Amazon Fire device, or desktop homescreen for instant 1-tap access and full offline study support!
          </p>

          {/* Quick Install Action Button */}
          <div className="p-4 bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#2D362E] dark:text-[#F4F1EA]">
              <span>Direct Homescreen Installer</span>
              {isInstalled && (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Installed
                </span>
              )}
            </div>

            <button
              onClick={handleTriggerInstall}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-200" />
              <span>{deferredPrompt ? 'Add App to Homescreen Now' : copiedLink ? 'App Link Copied to Clipboard!' : 'Download & Copy Homescreen App Link'}</span>
            </button>
          </div>

          {/* Device Guide */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C857A]">
              Manual Device Setup Guide
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Android / Chrome */}
              <div className="p-3 bg-white dark:bg-[#1A231C] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-xl space-y-1">
                <div className="font-bold text-[#5A6D5B] dark:text-emerald-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Android & Chrome
                </div>
                <p className="text-[11px] text-[#7A746B] dark:text-[#A6C4A7] leading-tight">
                  Tap <strong>⋮ Menu</strong> in Chrome and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
                </p>
              </div>

              {/* iOS / Safari */}
              <div className="p-3 bg-white dark:bg-[#1A231C] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-xl space-y-1">
                <div className="font-bold text-[#5A6D5B] dark:text-emerald-300 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5" /> iPhone / iPad (Safari)
                </div>
                <p className="text-[11px] text-[#7A746B] dark:text-[#A6C4A7] leading-tight">
                  Tap the <strong>Share</strong> button at bottom and choose <strong>"Add to Home Screen"</strong>.
                </p>
              </div>

              {/* Amazon Fire / Tablet */}
              <div className="p-3 bg-white dark:bg-[#1A231C] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-xl space-y-1">
                <div className="font-bold text-[#5A6D5B] dark:text-emerald-300 flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5" /> Amazon Fire Tablet
                </div>
                <p className="text-[11px] text-[#7A746B] dark:text-[#A6C4A7] leading-tight">
                  In Silk Browser, tap <strong>Menu</strong> and select <strong>"Add to Home Screen"</strong>.
                </p>
              </div>

              {/* Windows / Mac */}
              <div className="p-3 bg-white dark:bg-[#1A231C] border border-[#EBE7DF] dark:border-[#2C3B2E] rounded-xl space-y-1">
                <div className="font-bold text-[#5A6D5B] dark:text-emerald-300 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> Desktop / PC / Mac
                </div>
                <p className="text-[11px] text-[#7A746B] dark:text-[#A6C4A7] leading-tight">
                  Click the <strong>Install</strong> icon in the browser address bar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#EBE7DF] dark:border-[#2C3B2E] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#F2EFE9] dark:bg-[#253027] hover:bg-[#EBE7DF] text-[#2D362E] dark:text-[#F4F1EA] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
