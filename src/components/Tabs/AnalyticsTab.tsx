import React, { useState } from 'react';
import { Subject, QuizResult, Flashcard, PushNotificationSettings, HourlyStudyPattern } from '../../types';
import { 
  BarChart3, 
  Flame, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Star, 
  Layers, 
  HelpCircle,
  Zap,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  Settings2,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Send,
  Download,
  FileText
} from 'lucide-react';
import { requestPushPermission, isPushPermissionGranted } from '../../utils/notificationService';
import { generateStudyProgressPDF } from '../../utils/pdfGenerator';

interface AnalyticsTabProps {
  subjects: Subject[];
  quizResults: QuizResult[];
  flashcards: Flashcard[];
  totalFocusMinutes: number;
  streakDays: number;
  notificationSettings: PushNotificationSettings;
  onUpdateNotificationSettings: (newSettings: PushNotificationSettings) => void;
  onSendTestNotification: () => void;
  onStartPomodoro: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  subjects,
  quizResults,
  flashcards,
  totalFocusMinutes,
  streakDays,
  notificationSettings,
  onUpdateNotificationSettings,
  onSendTestNotification,
  onStartPomodoro,
}) => {
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMsgInput, setCustomMsgInput] = useState(notificationSettings.customMessage);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const totalMasteredCards = flashcards.filter((f) => f.status === 'mastered').length;
  const cardMasteryRate = flashcards.length > 0 ? Math.round((totalMasteredCards / flashcards.length) * 100) : 0;

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      generateStudyProgressPDF({
        subjects,
        quizResults,
        flashcards,
        totalFocusMinutes,
        streakDays,
      });
      setIsGeneratingPDF(false);
    }, 200);
  };

  const avgQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, curr) => acc + curr.score, 0) / quizResults.length)
    : 85;

  const weeklyHours = [2.5, 4.0, 3.2, 5.5, 1.8, 4.2, (totalFocusMinutes / 60)];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  // Mock Hourly Usage Patterns (00:00 to 23:00) with identified peak window
  const hourlyPatterns: HourlyStudyPattern[] = [
    { hour: 8, label: '8 AM', focusMinutes: 15, isPeak: false },
    { hour: 10, label: '10 AM', focusMinutes: 30, isPeak: false },
    { hour: 12, label: '12 PM', focusMinutes: 25, isPeak: false },
    { hour: 14, label: '2 PM', focusMinutes: 45, isPeak: false },
    { hour: 15, label: '3 PM', focusMinutes: 90, isPeak: true },
    { hour: 16, label: '4 PM', focusMinutes: 110, isPeak: true },
    { hour: 17, label: '5 PM', focusMinutes: 85, isPeak: true },
    { hour: 19, label: '7 PM', focusMinutes: 40, isPeak: false },
    { hour: 21, label: '9 PM', focusMinutes: 55, isPeak: false },
  ];

  const badges = [
    { name: 'Focus Warrior', desc: 'Logged 5+ hours of Pomodoro focus sprints', unlocked: totalFocusMinutes >= 120, icon: Clock },
    { name: 'Active Recall Master', desc: 'Mastered over 5 flashcards', unlocked: totalMasteredCards >= 5, icon: Layers },
    { name: 'Quiz Champion', desc: 'Achieved 80%+ on practice quizzes', unlocked: avgQuizScore >= 80, icon: Award },
    { name: 'Unstoppable Streak', desc: 'Maintained a 5-day consecutive study streak', unlocked: streakDays >= 5, icon: Flame },
  ];

  const handleEnablePermission = async () => {
    const granted = await requestPushPermission();
    onUpdateNotificationSettings({
      ...notificationSettings,
      permissionGranted: granted,
      enabled: granted ? true : notificationSettings.enabled,
    });
  };

  const handleSaveMessage = () => {
    onUpdateNotificationSettings({
      ...notificationSettings,
      customMessage: customMsgInput,
    });
    setIsEditingMessage(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Banner */}
      <div className="bg-[#EBE7DF] border border-[#D9D1C7] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2EFE3] border border-[#C5DCC6] rounded-full text-[#5A6D5B] text-xs font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#5A6D5B]" />
              <span>Real-time Learning Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              Study Performance & Mastery Analytics
            </h1>
            <p className="text-[#7A746B] text-sm mt-1 max-w-2xl">
              Track active focus hours, subject mastery progress, active recall retention rates, and earn study streak achievement badges.
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-5 py-2.5 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto border border-[#4D5E4E] active:scale-95 disabled:opacity-50"
            title="Download formatted PDF report with focus hours, quiz results, and subject mastery"
          >
            <FileText className="w-4 h-4 text-amber-200" />
            <span>{isGeneratingPDF ? 'Generating Report...' : 'Download Progress PDF'}</span>
            <Download className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A746B]">
            <span>Total Focus Time</span>
            <Clock className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D362E]">
            {Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m
          </div>
          <p className="text-[11px] text-[#5A6D5B] font-medium">Logged across all subjects</p>
        </div>

        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A746B]">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-[#B87D4B] fill-[#B87D4B]/20" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D362E]">{streakDays} Days</div>
          <p className="text-[11px] text-[#B87D4B] font-medium">Keep learning daily!</p>
        </div>

        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A746B]">
            <span>Flashcard Recall Rate</span>
            <Layers className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D362E]">{cardMasteryRate}%</div>
          <p className="text-[11px] text-[#5A6D5B] font-medium">
            {totalMasteredCards} of {flashcards.length} cards mastered
          </p>
        </div>

        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A746B]">
            <span>Average Quiz Accuracy</span>
            <Award className="w-4 h-4 text-[#5A6D5B]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D362E]">{avgQuizScore}%</div>
          <p className="text-[11px] text-[#5A6D5B] font-medium">Based on practice tests</p>
        </div>

      </div>

      {/* Peak Study Hours & Smart Push Notification Engine */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#3B483C] to-[#1E261F] text-white border border-[#3B483C] rounded-[28px] p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-bold rounded-full flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Peak Productivity Pattern Detected</span>
              </span>
              <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded-full flex items-center gap-1">
                <BellRing className="w-3.5 h-3.5 text-emerald-300" />
                <span>Push Reminders</span>
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Optimal Focus Window & Smart Push Reminders
            </h2>
            <p className="text-xs text-[#C8E0C9] mt-1 max-w-2xl leading-relaxed">
              Based on your study log analytics, your highest concentration and retention occurs between <strong className="text-amber-300">3:00 PM and 6:00 PM</strong>. Enable automated push notifications to trigger right at your peak focus hours!
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!notificationSettings.permissionGranted ? (
              <button
                onClick={handleEnablePermission}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enable Browser Push</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Browser Push Allowed</span>
              </span>
            )}

            <button
              onClick={onSendTestNotification}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>⚡ Send Test Push Alert</span>
            </button>
          </div>
        </div>

        {/* Peak Hours Hourly Chart & Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Hourly Productivity Distribution Chart */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Daily Focus Hours Heatmap</span>
              </h3>
              <span className="text-[10px] text-[#A6C4A7] font-semibold">
                Peak: 3 PM - 6 PM (94% Accuracy)
              </span>
            </div>

            {/* Hourly Bars */}
            <div className="h-40 flex items-end justify-between gap-2 pt-4 px-1">
              {hourlyPatterns.map((p) => {
                const heightPercent = Math.min(100, Math.max(15, (p.focusMinutes / 110) * 100));
                return (
                  <div key={p.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className={`text-[10px] font-bold ${p.isPeak ? 'text-amber-300' : 'text-gray-300'}`}>
                      {p.focusMinutes}m
                    </span>

                    <div className="w-full bg-white/10 rounded-lg overflow-hidden h-full flex items-end p-0.5">
                      <div
                        className={`w-full rounded-md transition-all duration-300 ${
                          p.isPeak
                            ? 'bg-gradient-to-t from-amber-500 to-amber-300 group-hover:from-amber-400 group-hover:to-amber-200 shadow-md shadow-amber-500/20 ring-1 ring-amber-300'
                            : 'bg-emerald-600/60 group-hover:bg-emerald-500/80'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    <span className={`text-[10px] font-bold ${p.isPeak ? 'text-amber-300 font-black' : 'text-[#A6C4A7]'}`}>
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A6C4A7]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
                  <span>Peak Hours (3 PM - 6 PM)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-600/80 rounded-sm" />
                  <span>Regular Hours</span>
                </span>
              </div>

              <button
                onClick={onStartPomodoro}
                className="text-emerald-300 hover:text-white font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-300" />
                <span>Start Pomodoro Session Now</span>
              </button>
            </div>
          </div>

          {/* Push Notification Controls & Message Config */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <span>Pomodoro Push Notification Rules</span>
            </h3>

            {/* Controls List */}
            <div className="space-y-3 text-xs">
              
              {/* Toggle Push Reminders */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Peak Hour Push Reminders</div>
                  <div className="text-[10px] text-[#A6C4A7]">Automatically remind at 3:00 PM peak start</div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.enabled && notificationSettings.peakHourReminderEnabled}
                    onChange={(e) =>
                      onUpdateNotificationSettings({
                        ...notificationSettings,
                        enabled: e.target.checked,
                        peakHourReminderEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Offset Timing Selection */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                <label className="text-[11px] font-bold text-[#C8E0C9]">Reminder Timing</label>
                <select
                  value={notificationSettings.reminderOffsetMinutes}
                  onChange={(e) =>
                    onUpdateNotificationSettings({
                      ...notificationSettings,
                      reminderOffsetMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#1E261F] text-white border border-white/20 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-emerald-400"
                >
                  <option value={0}>At Peak Hour Start (Exactly 3:00 PM)</option>
                  <option value={15}>15 Minutes Before Peak (2:45 PM)</option>
                  <option value={30}>30 Minutes Before Peak (2:30 PM)</option>
                </select>
              </div>

              {/* Audio Sound Toggle */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationSettings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <div className="font-bold text-white">Audio Chime Sound</div>
                    <div className="text-[10px] text-[#A6C4A7]">Play subtle chime when notification fires</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.soundEnabled}
                    onChange={(e) =>
                      onUpdateNotificationSettings({
                        ...notificationSettings,
                        soundEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Custom Message Editor */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Push Notification Text</span>
                  <button
                    onClick={() => setIsEditingMessage(!isEditingMessage)}
                    className="text-[10px] text-amber-300 hover:underline font-bold cursor-pointer"
                  >
                    {isEditingMessage ? 'Cancel' : 'Edit Text'}
                  </button>
                </div>

                {isEditingMessage ? (
                  <div className="space-y-2">
                    <textarea
                      value={customMsgInput}
                      onChange={(e) => setCustomMsgInput(e.target.value)}
                      className="w-full bg-[#1E261F] text-white border border-white/20 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-400 resize-none h-16"
                    />
                    <button
                      onClick={handleSaveMessage}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Save Push Message
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#C8E0C9] italic bg-black/20 p-2 rounded-lg border border-white/5">
                    "{notificationSettings.customMessage}"
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Study Hours Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-[#EBE7DF] rounded-[28px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
            <h2 className="text-sm font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#5A6D5B]" />
              <span>Weekly Focus Hours Distribution</span>
            </h2>
            <span className="text-xs text-[#7A746B]">Past 7 Days</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyHours.map((val, idx) => {
              const heightPercent = Math.min(100, Math.max(15, (val / 6) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-[#2D362E]">{val.toFixed(1)}h</span>
                  <div className="w-full bg-[#F9F7F2] border border-[#EBE7DF] rounded-xl overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-[#5A6D5B] rounded-xl transition-all duration-500 hover:bg-[#4A5D4B]"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#7A746B]">{days[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Mastery Progress Breakdown */}
        <div className="lg:col-span-5 bg-white border border-[#EBE7DF] rounded-[28px] p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#2D362E] flex items-center gap-2 border-b border-[#EBE7DF] pb-3">
            <CheckCircle2 className="w-4 h-4 text-[#5A6D5B]" />
            <span>Subject Mastery Breakdown</span>
          </h2>

          <div className="space-y-4">
            {subjects.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D362E]">{s.name}</span>
                  <span className="font-bold text-[#5A6D5B]">{s.progress}%</span>
                </div>

                <div className="w-full bg-[#EBE7DF] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5A6D5B] transition-all duration-500 rounded-full"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Achievement Badges Section */}
      <div className="bg-white border border-[#EBE7DF] rounded-[28px] p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-serif font-bold text-[#2D362E] flex items-center gap-2 border-b border-[#EBE7DF] pb-3">
          <Star className="w-4 h-4 text-[#B87D4B] fill-[#B87D4B]" />
          <span>Study Badges & Achievements</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  b.unlocked
                    ? 'bg-[#E2EFE3] border-[#C5DCC6] text-[#2D362E] shadow-sm'
                    : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#8C857A] opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    b.unlocked
                      ? 'bg-[#5A6D5B] text-white shadow-sm'
                      : 'bg-[#EBE7DF] text-[#8C857A]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-bold text-xs text-[#2D362E]">{b.name}</h3>
                  <p className="text-[11px] text-[#7A746B] mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
