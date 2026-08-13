import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Music, 
  BookOpen, 
  Zap, 
  CheckSquare, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  Wind,
  Flame,
  BellRing,
  Clock,
  Send
} from 'lucide-react';
import { playAmbientSound, stopAmbientSound, setVolume } from '../../utils/audioSynth';
import { PushNotificationSettings } from '../../types';

interface FocusTimerTabProps {
  onLogFocusSession: (minutes: number) => void;
  notificationSettings?: PushNotificationSettings;
  onSendTestNotification?: () => void;
}

export const FocusTimerTab: React.FC<FocusTimerTabProps> = ({
  onLogFocusSession,
  notificationSettings,
  onSendTestNotification,
}) => {
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Ambient sound states
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'lofi' | 'library' | 'binaural' | 'whiteNoise'>('none');
  const [soundVolume, setSoundVolumeState] = useState(0.5);

  // Task checklist
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: 't1', text: 'Review 10 flashcards for Cellular Biology', done: true },
    { id: 't2', text: 'Read BST AVL tree rotation section', done: false },
    { id: 't3', text: 'Take 5-question practice quiz', done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Breathing exercise
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const totalTime = timerMode === 'focus' ? 25 * 60 : timerMode === 'shortBreak' ? 5 * 60 : 15 * 60;

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);

            if (timerMode === 'focus') {
              onLogFocusSession(25);
              setCompletedSessions((c) => c + 1);
              setTimerMode('shortBreak');
              return 5 * 60;
            } else {
              setTimerMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMode, onLogFocusSession]);

  // Breathing phase loop
  useEffect(() => {
    let breathInterval: any = null;
    if (isBreathing) {
      let phaseIdx = 0;
      const phases: ('Inhale' | 'Hold' | 'Exhale')[] = ['Inhale', 'Hold', 'Exhale'];
      breathInterval = setInterval(() => {
        phaseIdx = (phaseIdx + 1) % 3;
        setBreathPhase(phases[phaseIdx]);
      }, 4000);
    }
    return () => clearInterval(breathInterval);
  }, [isBreathing]);

  const handleModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleToggleSound = (sound: 'rain' | 'lofi' | 'library' | 'binaural' | 'whiteNoise') => {
    if (activeSound === sound) {
      stopAmbientSound();
      setActiveSound('none');
    } else {
      setActiveSound(sound);
      playAmbientSound(sound, soundVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolumeState(vol);
    setVolume(vol);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks((prev) => [...prev, { id: `task-${Date.now()}`, text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Banner */}
      <div className="bg-[#EBE7DF] border border-[#D9D1C7] rounded-[24px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2EFE3] border border-[#C5DCC6] rounded-full text-[#5A6D5B] text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-[#5A6D5B]" />
              <span>Deep Focus & Pomodoro Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              Focus Studio & Ambient Sound Engine
            </h1>
            <p className="text-[#7A746B] text-sm mt-1 max-w-2xl">
              Eliminate distractions with adaptive Pomodoro intervals, custom Web Audio focus soundscapes, task sprint checklists, and break relaxation tools.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D9D1C7] rounded-full text-[#B87D4B] text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 fill-[#B87D4B]/20 text-[#B87D4B]" />
              <span>{completedSessions} Sprints Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Study Hour Reminder Strip */}
      <div className="bg-[#2D362E] text-white p-4 rounded-2xl shadow-md border border-[#3D4C3E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
            <BellRing className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Peak Focus Window Active: 3:00 PM – 6:00 PM</span>
            </div>
            <p className="text-[11px] text-[#C8E0C9] mt-0.5">
              {notificationSettings?.enabled
                ? 'Push reminders are active. You will receive a Pomodoro alert when your peak hour begins.'
                : 'Enable push notifications in Analytics to receive automated Pomodoro alerts.'}
            </p>
          </div>
        </div>

        {onSendTestNotification && (
          <button
            onClick={onSendTestNotification}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Push Notification</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pomodoro Ring & Controls */}
        <div className="lg:col-span-7 bg-white border border-[#EBE7DF] rounded-[28px] p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F9F7F2] border border-[#D9D1C7] rounded-full">
            <button
              onClick={() => handleModeChange('focus')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                timerMode === 'focus'
                  ? 'bg-[#5A6D5B] text-white shadow-sm'
                  : 'text-[#7A746B] hover:text-[#2D362E]'
              }`}
            >
              Focus Sprint (25m)
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                timerMode === 'shortBreak'
                  ? 'bg-[#5A6D5B] text-white shadow-sm'
                  : 'text-[#7A746B] hover:text-[#2D362E]'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                timerMode === 'longBreak'
                  ? 'bg-[#5A6D5B] text-white shadow-sm'
                  : 'text-[#7A746B] hover:text-[#2D362E]'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Radial SVG Timer Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-[#EBE7DF]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-[#5A6D5B] transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray="600"
                strokeDashoffset={600 - (600 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Timer Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2D362E] font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#5A6D5B] font-bold mt-2">
                {timerMode === 'focus' ? 'Active Focus' : 'Relaxation Break'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-[#B87D4B] hover:bg-[#A36C3C]'
                  : 'bg-[#5A6D5B] hover:bg-[#4A5D4B]'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                if (timerMode === 'focus') setTimeLeft(25 * 60);
                else if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
                else setTimeLeft(15 * 60);
              }}
              className="p-3 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] rounded-2xl border border-[#D9D1C7] transition-colors cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Right Column: Ambient Audio Synthesizer & Tasks */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ambient Sound Synthesizer Card */}
          <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <h2 className="text-sm font-serif font-bold text-[#2D362E] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#5A6D5B]" />
                <span>Ambient Focus Audio (Web Audio)</span>
              </h2>
              {activeSound !== 'none' && (
                <button
                  onClick={() => {
                    stopAmbientSound();
                    setActiveSound('none');
                  }}
                  className="text-xs text-[#B87D4B] hover:underline cursor-pointer"
                >
                  Turn Off
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'rain', name: 'Rainfall', icon: CloudRain },
                { id: 'lofi', name: 'Lo-Fi Chill', icon: Music },
                { id: 'library', name: 'Quiet Library', icon: BookOpen },
                { id: 'binaural', name: '40Hz Focus Wave', icon: Zap },
                { id: 'whiteNoise', name: 'White Noise', icon: Wind },
              ].map((s) => {
                const Icon = s.icon;
                const isActive = activeSound === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleToggleSound(s.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E2EFE3] border-[#5A6D5B] text-[#5A6D5B] shadow-sm'
                        : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#7A746B] hover:text-[#2D362E]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#5A6D5B] animate-pulse' : 'text-[#8C857A]'}`} />
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Volume Slider */}
            {activeSound !== 'none' && (
              <div className="flex items-center gap-3 pt-2">
                <Volume2 className="w-4 h-4 text-[#5A6D5B] shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-[#5A6D5B] cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Focus Sprint Task List */}
          <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#2D362E] flex items-center gap-2 border-b border-[#EBE7DF] pb-3">
              <CheckSquare className="w-4 h-4 text-[#5A6D5B]" />
              <span>Sprint Task Checklist</span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add sprint goal..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 bg-[#F9F7F2] border border-[#D9D1C7] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B]"
              />
              <button
                onClick={handleAddTask}
                className="px-3 py-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() =>
                    setTasks((prev) =>
                      prev.map((item) => (item.id === t.id ? { ...item, done: !item.done } : item))
                    )
                  }
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    t.done
                      ? 'bg-[#F9F7F2] border-[#EBE7DF] text-[#8C857A] line-through'
                      : 'bg-[#F9F7F2] border-[#D9D1C7] text-[#2D362E] hover:border-[#5A6D5B]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        t.done
                          ? 'bg-[#E2EFE3] border-[#C5DCC6] text-[#5A6D5B]'
                          : 'border-[#D9D1C7]'
                      }`}
                    >
                      {t.done && <Check className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{t.text}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTasks((prev) => prev.filter((item) => item.id !== t.id));
                    }}
                    className="text-[#8C857A] hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Guided Mind Refresh / Breathing Exercise */}
          <div className="bg-white border border-[#EBE7DF] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <h2 className="text-sm font-serif font-bold text-[#2D362E] flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#5A6D5B]" />
                <span>Break Breathing Relaxer</span>
              </h2>
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className="text-xs font-bold text-[#5A6D5B] hover:underline cursor-pointer"
              >
                {isBreathing ? 'Stop Exercise' : 'Start 1-Min Relax'}
              </button>
            </div>

            {isBreathing && (
              <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
                <div
                  className={`w-20 h-20 rounded-full bg-[#E2EFE3] border-2 border-[#5A6D5B] flex items-center justify-center transition-all duration-1000 ${
                    breathPhase === 'Inhale'
                      ? 'scale-125 bg-[#E2EFE3]'
                      : breathPhase === 'Hold'
                      ? 'scale-125 bg-[#D3E8D5]'
                      : 'scale-90 bg-[#F2EFE9]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#5A6D5B] uppercase">
                    {breathPhase}
                  </span>
                </div>
                <p className="text-xs text-[#7A746B]">
                  Follow the expanding circle for diaphragmatic oxygenation.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
