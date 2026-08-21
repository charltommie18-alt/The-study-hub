import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Check, 
  Share, 
  ExternalLink,
  Laptop, 
  Sparkles,
  Tablet,
  Copy,
  Info,
  Layers,
  ArrowRight,
  WifiOff
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'samsung' | 'desktop'>('android');

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
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
      // If no prompt event or in iframe, copy link & open tab
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-[#161C18] border border-slate-200 dark:border-[#2C3B2E] rounded-[24px] max-w-lg w-full p-5 sm:p-7 shadow-2xl relative my-6 text-slate-800 dark:text-slate-100"
        tabIndex={0}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-100 dark:bg-[#1A231C] border border-slate-200 dark:border-[#2F3E31] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#2C3B2E] pb-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Download className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-full text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>TUISSKERM TOEPASSING (OFFLINE PWA)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white leading-snug">
              Laai StudyHub af na jou Tuisskerm
            </h2>
          </div>
        </div>

        {/* Introduction */}
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Installeer <strong>StudyHub AI</strong> as 'n selfstandige foon-toepassing op jou selfoon se tuisskerm. Dit werk <strong>100% vanlyn</strong>, maak vinnig oop sonder 'n webadresbalk, en stoor al jou opsommings, flitskaarte en toetse!
          </p>

          {/* Iframe Warning if preview mode */}
          {isInIframe && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900 dark:text-amber-200">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span>Jy kyk tans in die voorskou-venster. Maak die skakel oop in 'n regte blaaier-oortjie om dit dadelik op jou foon te installeer:</span>
                <button
                  onClick={handleOpenInNewTab}
                  className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Maak oop in Blaaier / Open Full Page</span>
                </button>
              </div>
            </div>
          )}

          {/* Direct Action Box */}
          <div className="p-4 bg-slate-50 dark:bg-[#1A231C] border border-slate-200 dark:border-[#2F3E31] rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>1-Tik Tuisskerm Installeerder</span>
              </span>
              {isInstalled && (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Reeds Geïnstalleer
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleTriggerInstall}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4 text-amber-200" />
                <span>{deferredPrompt ? 'Installeer StudyHub Nou' : 'Laai Af & Installeer'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-3 px-3 bg-white dark:bg-[#253027] hover:bg-slate-100 dark:hover:bg-[#2F3E31] border border-slate-200 dark:border-[#3C4E3F] text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Kopieer toepassingskakel"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Gekopieer!' : 'Kopieer Skakel'}</span>
              </button>
            </div>
          </div>

          {/* Device Specific Installation Instructions */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kies jou toestel vir stap-vir-stap gids:
            </h3>

            {/* Device Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#101711] p-1 rounded-xl border border-slate-200 dark:border-[#2F3E31]">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDeviceTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E2A20]'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                onClick={() => setActiveDeviceTab('samsung')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDeviceTab === 'samsung'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E2A20]'
                }`}
              >
                Samsung Internet
              </button>
              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDeviceTab === 'ios'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E2A20]'
                }`}
              >
                iPhone (Safari)
              </button>
              <button
                onClick={() => setActiveDeviceTab('desktop')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeDeviceTab === 'desktop'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E2A20]'
                }`}
              >
                Rekenaar / Mac
              </button>
            </div>

            {/* Tab Instruction Content */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#1A231C] border border-slate-200 dark:border-[#2C3B2E] rounded-xl text-xs space-y-2">
              {activeDeviceTab === 'android' && (
                <div className="space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>📱 Android & Google Chrome:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    <li>Tik op die <strong>3 kolletjies (⋮)</strong> regs bo in Chrome.</li>
                    <li>Kies <strong>"Installeer toepassing" (Install app)</strong> of <strong>"Voeg by tuisskerm" (Add to Home screen)</strong>.</li>
                    <li>Tik <strong>"Installeer"</strong>. StudyHub verskyn nou op jou foon se tuisskerm!</li>
                  </ol>
                </div>
              )}

              {activeDeviceTab === 'samsung' && (
                <div className="space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>📱 Samsung Internet Blaaier:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    <li>Tik op die <strong>Kieslys (☰)</strong> regs onder in Samsung Internet.</li>
                    <li>Kies <strong>"+ Voeg bladsy by" (+ Add page to)</strong>.</li>
                    <li>Kies <strong>"Tuisskerm" (Home screen)</strong> en tik <strong>Voeg By</strong>.</li>
                  </ol>
                </div>
              )}

              {activeDeviceTab === 'ios' && (
                <div className="space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Share className="w-3.5 h-3.5" />
                    <span>🍎 iPhone & iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    <li>Maak oop in <strong>Safari</strong>.</li>
                    <li>Tik op die <strong>Deel-knoppie (📤 Share)</strong> onderaan die skerm.</li>
                    <li>Blaai af en tik op <strong>"Voeg by tuisskerm" (Add to Home Screen ➕)</strong>.</li>
                    <li>Tik <strong>"Voeg by" (Add)</strong> bo regs.</li>
                  </ol>
                </div>
              )}

              {activeDeviceTab === 'desktop' && (
                <div className="space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>💻 Rekenaar, Skootrekenaar of Chromebook:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    <li>In Google Chrome of Microsoft Edge, kyk regs in die <strong>adresbalk bo</strong>.</li>
                    <li>Klik op die <strong>Installeer-ikoon (⊕ of 📲)</strong> langs die sterretjie.</li>
                    <li>Klik <strong>"Installeer"</strong> om dit as 'n selfstandige venster te gebruik.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#2C3B2E] flex justify-between items-center">
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Werk heeltemal sonder internet</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 dark:bg-[#253027] hover:bg-slate-200 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Klaar / Done
          </button>
        </div>
      </div>
    </div>
  );
};
