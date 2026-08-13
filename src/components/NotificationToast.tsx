import React from 'react';
import { Bell, Flame, Play, X, Volume2, Sparkles, Clock } from 'lucide-react';
import { PushNotificationSettings } from '../types';

interface NotificationToastProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFocus: () => void;
  settings: PushNotificationSettings;
  title?: string;
  message?: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  isOpen,
  onClose,
  onStartFocus,
  settings,
  title = "⚡ Peak Focus Hour Alert!",
  message,
}) => {
  if (!isOpen) return null;

  const displayMessage = message || settings.customMessage || "It's your peak study hour! Start your Pomodoro session now to maximize retention.";

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full bg-[#2D362E] text-white p-5 rounded-2xl shadow-2xl border border-emerald-500/40 animate-slide-in transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-emerald-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-300" />
                <span>Peak Productivity Window</span>
              </span>
              {settings.soundEnabled && (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <h3 className="text-sm font-black text-white mt-1">{title}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[#C8E0C9] mt-3 leading-relaxed">
        {displayMessage}
      </p>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="text-[11px] text-[#A6C4A7] flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>Optimal Focus Window: 3:00 PM - 6:00 PM</span>
        </div>

        <button
          onClick={() => {
            onStartFocus();
            onClose();
          }}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Start Pomodoro</span>
        </button>
      </div>
    </div>
  );
};
