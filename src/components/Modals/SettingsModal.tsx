import React from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Bell, 
  Volume2, 
  VolumeX, 
  GraduationCap, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Palette,
  Clock
} from 'lucide-react';
import { GradeLevel, PushNotificationSettings } from '../../types';
import { GRADE_CONFIGS } from '../../data/initialData';
import { requestPushPermission } from '../../utils/notificationService';
import { 
  SUPPORTED_LANGUAGES, 
  loadVoiceSettings, 
  saveVoiceSettings, 
  setVoiceGender,
  getAvailableSystemVoices 
} from '../../utils/multilingualSpeech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  notificationSettings: PushNotificationSettings;
  onUpdateNotificationSettings: (settings: PushNotificationSettings) => void;
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  isOffline: boolean;
  onToggleOffline: (offline: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  notificationSettings,
  onUpdateNotificationSettings,
  currentGrade,
  onSelectGrade,
  isOffline,
  onToggleOffline,
}) => {
  if (!isOpen) return null;

  const handleEnablePermission = async () => {
    const granted = await requestPushPermission();
    onUpdateNotificationSettings({
      ...notificationSettings,
      permissionGranted: granted,
      enabled: granted ? true : notificationSettings.enabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#F9F7F2] dark:bg-[#1C231E] border border-[#D9D1C7] dark:border-[#334035] rounded-3xl shadow-2xl overflow-hidden transition-all text-[#2D362E] dark:text-[#F4F1EA]">
        
        {/* Header */}
        <div className="p-5 bg-[#EBE7DF] dark:bg-[#181E19] border-b border-[#D9D1C7] dark:border-[#2D382F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A6D5B] text-white rounded-xl shadow-xs">
              <Palette className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#2D362E] dark:text-[#F4F1EA]">
                StudyHub App Settings
              </h2>
              <p className="text-xs text-[#7A746B] dark:text-[#B5AEA3]">
                Appearance, Late-Night Theme, and Study Preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7A746B] hover:text-[#2D362E] dark:hover:text-white rounded-xl hover:bg-[#D9D1C7]/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Late Night Dark Mode Theme */}
          <div className="p-4 bg-white dark:bg-[#161B17] border border-[#D9D1C7] dark:border-[#2E3B30] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-100 text-[#5A6D5B]'}`}>
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D362E] dark:text-white flex items-center gap-2">
                    <span>Late-Night Dark Mode</span>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-200 text-[10px] font-extrabold rounded-md uppercase">
                      Natural Tones
                    </span>
                  </h3>
                  <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7] mt-0.5">
                    High-contrast dark palette tailored for late-night study sessions.
                  </p>
                </div>
              </div>

              {/* Dark Mode Switch */}
              <button
                onClick={() => onToggleDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDarkMode ? 'bg-emerald-600' : 'bg-[#D9D1C7]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Palette Preview */}
            <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#263228] flex items-center justify-between text-[11px] text-[#7A746B] dark:text-[#A6C4A7]">
              <span>Theme: {isDarkMode ? 'Deep Natural Forest Slate (#121613)' : 'Soft Parchment Cream (#F9F7F2)'}</span>
              <span className="font-semibold text-[#5A6D5B] dark:text-emerald-400">
                {isDarkMode ? '🌙 High Contrast Active' : '☀️ Day Mode Active'}
              </span>
            </div>
          </div>

          {/* Section 2: Grade Level & Curriculum */}
          <div className="p-4 bg-white dark:bg-[#161B17] border border-[#D9D1C7] dark:border-[#2E3B30] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-[#5A6D5B] dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-[#2D362E] dark:text-white">Active Academic Grade Level</h3>
                <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                  Adjusts AI summarizer complexity and practice exam difficulty.
                </p>
              </div>
            </div>

            <select
              value={currentGrade}
              onChange={(e) => onSelectGrade(e.target.value as GradeLevel)}
              className="w-full bg-[#F9F7F2] dark:bg-[#1C231E] text-[#2D362E] dark:text-[#F4F1EA] border border-[#D9D1C7] dark:border-[#38483B] rounded-xl p-2.5 text-xs font-bold focus:outline-none"
            >
              {GRADE_CONFIGS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.description}
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: AI Voice & Audio Narration Settings */}
          <div className="p-4 bg-white dark:bg-[#161B17] border border-[#D9D1C7] dark:border-[#2E3B30] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-[#2D362E] dark:text-white flex items-center gap-1.5">
                  <span>AI Voice & Afrikaans Engine</span>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md">
                    Neural HD
                  </span>
                </h3>
                <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                  Configure natural Afrikaans pronunciation, speed, and auto-speech.
                </p>
              </div>
            </div>

            {/* Voice Gender Switcher (Manlik / Vroulik) */}
            <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#263228] flex items-center justify-between">
              <span className="text-xs font-medium text-[#2D362E] dark:text-[#F4F1EA]">Stemtipe (Stem-Geslag)</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVoiceGender('male')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    loadVoiceSettings().voiceGender === 'male'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#F0ECE1] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] hover:bg-[#E2DDD0]'
                  }`}
                  title="Nuwe Manlike KI-Stem (Karel / Dawid - Charon HD)"
                >
                  <span>👨 Manlik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender('female')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    loadVoiceSettings().voiceGender === 'female'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#F0ECE1] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] hover:bg-[#E2DDD0]'
                  }`}
                  title="Vroulike KI-Stem (Sanet / Elsa / Kore)"
                >
                  <span>👩 Vroulik</span>
                </button>
              </div>
            </div>

            {/* Voice Speed Selection */}
            <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#263228] flex items-center justify-between">
              <span className="text-xs font-medium text-[#2D362E] dark:text-[#F4F1EA]">Default Narration Speed</span>
              <div className="flex items-center gap-1">
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => {
                      saveVoiceSettings({ voiceSpeed: spd });
                    }}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      loadVoiceSettings().voiceSpeed === spd
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#F0ECE1] dark:bg-[#253026] text-[#5A6D5B] dark:text-[#A2B5A3] hover:bg-[#E2DDD0]'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Default Voice Language & System Voice Selection */}
            <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#263228] flex items-center justify-between">
              <span className="text-xs font-medium text-[#2D362E] dark:text-[#F4F1EA]">Preferred Voice Language</span>
              <select
                value={loadVoiceSettings().preferredLanguage}
                onChange={(e) => {
                  saveVoiceSettings({ preferredLanguage: e.target.value });
                }}
                className="bg-[#F9F7F2] dark:bg-[#1C231E] text-[#2D362E] dark:text-[#F4F1EA] border border-[#D9D1C7] dark:border-[#38483B] rounded-xl px-2 py-1 text-xs font-bold focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* System Voice Selection */}
            <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#263228] space-y-1">
              <span className="text-xs font-medium text-[#2D362E] dark:text-[#F4F1EA] block">Preferred Voice & Engine</span>
              <select
                value={loadVoiceSettings().selectedVoiceURI || 'ai-neural-male-charon'}
                onChange={(e) => {
                  saveVoiceSettings({ selectedVoiceURI: e.target.value });
                }}
                className="w-full bg-[#F9F7F2] dark:bg-[#1C231E] text-[#2D362E] dark:text-[#F4F1EA] border border-[#D9D1C7] dark:border-[#38483B] rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
              >
                {getAvailableSystemVoices().map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Push Notifications & Peak Hours */}
          <div className="p-4 bg-white dark:bg-[#161B17] border border-[#D9D1C7] dark:border-[#2E3B30] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-[#2D362E] dark:text-white">Peak Hour Push Alerts</h3>
                  <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                    Remind at peak focus hours (3 PM - 6 PM)
                  </p>
                </div>
              </div>

              {!notificationSettings.permissionGranted ? (
                <button
                  onClick={handleEnablePermission}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Allow</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-lg flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Allowed</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8] dark:border-[#263228]">
              <div className="flex items-center gap-2 text-xs font-medium">
                {notificationSettings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                <span>Notification Chime Sound</span>
              </div>

              <button
                onClick={() =>
                  onUpdateNotificationSettings({
                    ...notificationSettings,
                    soundEnabled: !notificationSettings.soundEnabled,
                  })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  notificationSettings.soundEnabled ? 'bg-emerald-600' : 'bg-[#D9D1C7]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    notificationSettings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 4: Offline Engine Mode */}
          <div className="p-4 bg-white dark:bg-[#161B17] border border-[#D9D1C7] dark:border-[#2E3B30] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isOffline ? <WifiOff className="w-5 h-5 text-amber-600" /> : <Wifi className="w-5 h-5 text-[#5A6D5B]" />}
                <div>
                  <h3 className="text-sm font-bold text-[#2D362E] dark:text-white">Offline Local Engine Mode</h3>
                  <p className="text-xs text-[#7A746B] dark:text-[#A6C4A7]">
                    Simulate local study processing without external network calls
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggleOffline(!isOffline)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isOffline ? 'bg-amber-600' : 'bg-[#D9D1C7]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isOffline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#EBE7DF] dark:bg-[#181E19] border-t border-[#D9D1C7] dark:border-[#2D382F] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
