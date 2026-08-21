import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, Check, Share, ArrowRight } from 'lucide-react';

interface HomeScreenInstallBannerProps {
  onOpenInstallModal: () => void;
}

export const HomeScreenInstallBanner: React.FC<HomeScreenInstallBannerProps> = ({ onOpenInstallModal }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('studyhub_install_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('studyhub_install_banner_dismissed', 'true');
    } catch {}
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <aside aria-label="Installeer StudyHub Toepassing" className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white border-b border-emerald-500/30 px-3 py-2 sm:px-4 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
        
        {/* Left Info with App Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/15 p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
            <img src="/icon.svg" alt="StudyHub Icon" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold truncate">
              <span className="text-white">Installeer StudyHub op Tuisskerm</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-emerald-400/20 border border-emerald-300/40 rounded text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                Vanlyn App
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 truncate">
              {isIOS 
                ? 'Tik op Deel 📤 en kies "Voeg by tuisskerm" vir vinnige 1-tik toegang'
                : 'Laai af as foon-app sonder om deur die web te soek'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 rounded-lg font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Laai StudyHub af na jou foon se tuisskerm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>{deferredPrompt ? 'Installeer Nou' : isIOS ? 'Hoe om te Installeer' : 'Laai Af / Install'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-md text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Maak toe"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
