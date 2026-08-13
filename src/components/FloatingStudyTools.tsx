import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  PenTool, 
  Bot, 
  MessageSquare, 
  Headphones, 
  Flame,
  GripVertical,
  Mic,
  MicOff
} from 'lucide-react';

interface FloatingStudyToolsProps {
  currentSubjectName: string;
}

export const FloatingStudyTools: React.FC<FloatingStudyToolsProps> = ({ currentSubjectName }) => {
  // Widget Visibility States
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Scratchpad & AI Assistant State
  const [scratchNotes, setScratchNotes] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isSpeakingReply, setIsSpeakingReply] = useState(false);

  // Floating Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Audio Ambient Synthesizer State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMode, setAudioMode] = useState<'rain' | 'binaural' | 'waves'>('binaural');
  const [audioVolume, setAudioVolume] = useState(0.3);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Dictation for Floating AI Query
  const handleStartVoiceAi = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAiPrompt(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error in floating AI:', err);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Voice input error:', e);
      setIsVoiceListening(false);
    }
  };

  // Text-to-Speech for Floating AI Reply
  const handleReadAloudReply = () => {
    if (!('speechSynthesis' in window) || !aiReply) return;

    if (isSpeakingReply) {
      window.speechSynthesis.cancel();
      setIsSpeakingReply(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = aiReply.replace(/[*#_~`>]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeakingReply(true);
    utterance.onend = () => setIsSpeakingReply(false);
    utterance.onerror = () => setIsSpeakingReply(false);

    window.speechSynthesis.speak(utterance);
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Audio Synth Toggle
  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (audioMode === 'binaural') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, ctx.currentTime); // 220Hz Alpha Focus
        } else if (audioMode === 'waves') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(110, ctx.currentTime);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, ctx.currentTime);
        }

        gain.gain.setValueAtTime(audioVolume, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setAudioCtx(ctx);
        setOscillator(osc);
        setGainNode(gain);
        setIsPlayingAudio(true);
      } catch (err) {
        console.warn('Audio synth error:', err);
      }
    }
  };

  // Adjust Volume
  useEffect(() => {
    if (gainNode && audioCtx) {
      gainNode.gain.setValueAtTime(audioVolume, audioCtx.currentTime);
    }
  }, [audioVolume, gainNode, audioCtx]);

  // Floating AI Quick Helper
  const handleAskQuickAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const userQ = aiPrompt;
    setAiPrompt('');

    try {
      if (navigator.onLine) {
        const res = await fetch('/api/tutor-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userQ }],
            subject: currentSubjectName,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiReply(data.reply || data.text || 'Got it! Reviewing concept...');
          setIsAiLoading(false);
          return;
        }
      }

      // Offline quick response
      setAiReply(`💡 [${currentSubjectName}] Quick Tip: ${userQ.slice(0, 30)}... Focus on key formulas, active recall definitions, and past question patterns.`);
    } catch (err) {
      setAiReply('Offline helper response generated.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* 1. Floating Scratchpad & Mini AI Companion Window */}
      {isScratchpadOpen && (
        <div className="pointer-events-auto w-80 sm:w-96 bg-white/95 backdrop-blur-md border-2 border-[#5A6D5B]/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-gradient-to-r from-[#2D362E] via-[#3C4A3E] to-[#2D362E] p-3.5 text-white flex items-center justify-between cursor-move">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#E2EFE3]/20 rounded-lg text-[#C8E0C9]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-tight">Floating AI Companion & Notepad</h4>
                <p className="text-[10px] text-[#C8E0C9]">Active Context: {currentSubjectName}</p>
              </div>
            </div>
            <button
              onClick={() => setIsScratchpadOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Quick AI Query Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#575047] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#5A6D5B]" />
                <span>Ask Quick AI Clarification</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuickAi()}
                  placeholder={isVoiceListening ? 'Listening to voice...' : 'Ask a quick formula or definition...'}
                  className={`flex-1 px-3 py-1.5 bg-[#FBF9F5] border rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#5A6D5B] ${
                    isVoiceListening ? 'border-rose-500 bg-rose-50 text-rose-900 font-medium' : 'border-[#D9D1C7]'
                  }`}
                />
                
                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={handleStartVoiceAi}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isVoiceListening
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      : 'bg-[#F2EFE9] text-[#5A6D5B] border-[#D9D1C7] hover:bg-[#EBE7DF]'
                  }`}
                  title="Speak to Floating AI (Voice Input)"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleAskQuickAi}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="p-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white rounded-xl disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {aiReply && (
                <div className="p-3 bg-[#E2EFE3]/50 border border-[#C5DCC6] rounded-xl text-xs text-[#2D362E] leading-relaxed space-y-2">
                  <div className="flex items-center justify-between border-b border-[#C5DCC6]/60 pb-1 text-[10px] text-[#5A6D5B] font-bold">
                    <span>AI Assistant Reply</span>
                    <button
                      onClick={handleReadAloudReply}
                      className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-700" />
                      <span>{isSpeakingReply ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                  <div>{aiReply}</div>
                </div>
              )}
            </div>

            {/* Quick Scratchpad */}
            <div className="space-y-1.5 pt-2 border-t border-[#E8E2D8]">
              <label className="text-[11px] font-bold text-[#575047] uppercase tracking-wider flex items-center gap-1">
                <PenTool className="w-3 h-3 text-[#5A6D5B]" />
                <span>Floating Scratchpad</span>
              </label>
              <textarea
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                placeholder="Jot down quick exam formulas, hints, or rough notes..."
                className="w-full h-24 p-2.5 bg-[#FBF9F5] border border-[#D9D1C7] rounded-xl text-xs font-mono text-[#2D362E] focus:outline-none focus:border-[#5A6D5B] resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Pomodoro Timer Window */}
      {isTimerOpen && (
        <div className="pointer-events-auto p-4 bg-white/95 backdrop-blur-md border-2 border-amber-500/30 rounded-3xl shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-5 duration-200 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>Floating Pomodoro</span>
            </div>
            <button
              onClick={() => setIsTimerOpen(false)}
              className="p-1 text-[#8C8275] hover:text-[#2D362E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center py-1">
            <div className="text-3xl font-extrabold font-mono text-[#2D362E] tracking-wider">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-[10px] text-[#736B5E] mt-0.5">25 Min Deep Work Session</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(25 * 60);
              }}
              className="p-1.5 bg-[#F2EFE9] hover:bg-[#EBE7DF] text-[#2D362E] rounded-xl border border-[#D9D1C7] cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Soundscape Synth Window */}
      {isAudioOpen && (
        <div className="pointer-events-auto p-4 bg-white/95 backdrop-blur-md border-2 border-emerald-500/30 rounded-3xl shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-5 duration-200 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
              <Headphones className="w-4 h-4 text-emerald-600" />
              <span>Ambient Soundscape</span>
            </div>
            <button
              onClick={() => setIsAudioOpen(false)}
              className="p-1 text-[#8C8275] hover:text-[#2D362E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'binaural', label: 'Binaural 220Hz' },
                { id: 'waves', label: 'Alpha Waves' },
                { id: 'rain', label: 'Rain Noise' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAudioMode(m.id as any)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    audioMode === m.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F2EFE9] text-[#575047] hover:bg-[#EBE7DF]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={toggleAudio}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isPlayingAudio
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Stop Sound' : 'Play Soundscape'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher Action Toolbar */}
      <div className="pointer-events-auto flex items-center gap-2 bg-[#2D362E]/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/20">
        
        {/* Toggle Scratchpad */}
        <button
          onClick={() => {
            setIsScratchpadOpen(!isScratchpadOpen);
            setIsTimerOpen(false);
            setIsAudioOpen(false);
          }}
          className={`p-2.5 rounded-full text-white transition-all cursor-pointer relative ${
            isScratchpadOpen
              ? 'bg-[#5A6D5B] ring-2 ring-emerald-400 scale-105'
              : 'hover:bg-white/10'
          }`}
          title="Floating Scratchpad & AI Companion"
        >
          <Bot className="w-5 h-5 text-emerald-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </button>

        {/* Toggle Floating Timer */}
        <button
          onClick={() => {
            setIsTimerOpen(!isTimerOpen);
            setIsScratchpadOpen(false);
            setIsAudioOpen(false);
          }}
          className={`p-2.5 rounded-full text-white transition-all cursor-pointer ${
            isTimerOpen
              ? 'bg-amber-600 ring-2 ring-amber-300 scale-105'
              : 'hover:bg-white/10'
          }`}
          title="Floating Pomodoro Timer"
        >
          <Timer className="w-5 h-5 text-amber-300" />
        </button>

        {/* Toggle Audio Soundscape */}
        <button
          onClick={() => {
            setIsAudioOpen(!isAudioOpen);
            setIsScratchpadOpen(false);
            setIsTimerOpen(false);
          }}
          className={`p-2.5 rounded-full text-white transition-all cursor-pointer ${
            isAudioOpen
              ? 'bg-purple-600 ring-2 ring-purple-300 scale-105'
              : 'hover:bg-white/10'
          }`}
          title="Floating Soundscape Synthesizer"
        >
          <Headphones className="w-5 h-5 text-purple-300" />
        </button>
      </div>

    </div>
  );
};
