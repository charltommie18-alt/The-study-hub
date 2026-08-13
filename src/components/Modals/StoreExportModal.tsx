import React from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Play, 
  Globe, 
  ShieldCheck, 
  Download, 
  Sparkles, 
  HardDriveUpload,
  Cpu
} from 'lucide-react';

interface StoreExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreExportModal: React.FC<StoreExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#FBF9F5] border border-[#E3DDD3] rounded-3xl p-6 max-w-2xl w-full shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E2EFE3] text-[#5A6D5B] rounded-2xl border border-[#C5DCC6]">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D362E]">App Store & Play Store Deployment Center</h2>
              <p className="text-xs text-[#736B5E]">Targeting Google Play Store, Amazon Appstore, and Global PWA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8275] hover:text-[#2D362E] hover:bg-[#F2EFE9] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Play Store Config */}
          <div className="p-4 bg-white border border-[#E3DDD3] rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Google Play Store (Android)</span>
            </div>
            <ul className="space-y-2 text-xs text-[#575047]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Package ID: <strong className="font-mono text-[#2D362E]">com.studyhub.app</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Target SDK: <strong className="font-mono text-[#2D362E]">34 (Android 14)</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Content Rating: <strong className="text-[#2D362E]">Everyone (Grade 7+)</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>TWA / WebAPK Ready</span>
              </li>
            </ul>
          </div>

          {/* Amazon Appstore Config */}
          <div className="p-4 bg-white border border-[#E3DDD3] rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Amazon Appstore (Fire OS / Android)</span>
            </div>
            <ul className="space-y-2 text-xs text-[#575047]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Package ID: <strong className="font-mono text-[#2D362E]">com.amazon.studyhub</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fire Tablet Optimization: <strong className="text-[#2D362E]">Enabled</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>In-App Purchasing API: <strong className="text-[#2D362E]">Multi-Currency Ready</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Offline PWA Caching</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Verification Badge list */}
        <div className="p-4 bg-[#E2EFE3]/50 border border-[#C5DCC6] rounded-2xl space-y-2 text-xs text-[#2D362E]">
          <h4 className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5A6D5B]" />
            <span>Store Policy Compliance Summary</span>
          </h4>
          <p className="text-[#575047] leading-relaxed">
            All user data is stored locally in client storage and synced via secure HTTPS server endpoints. Offline AI engine operates without external API dependencies when offline.
          </p>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Close Store Readiness Window
          </button>
        </div>
      </div>
    </div>
  );
};
