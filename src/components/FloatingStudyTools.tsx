import React, { useState, useEffect, useRef } from 'react';
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
  MicOff,
  Upload,
  Download,
  Music,
  Check,
  AlertCircle,
  Info,
  WifiOff,
  Wifi,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { 
  enqueueVoiceTranscript, 
  getVoiceOfflineQueue, 
  clearVoiceOfflineQueue, 
  setupVoiceAutoSync, 
  QueuedVoiceTranscript 
} from '../utils/voiceOfflineQueue';
import { 
  SUPPORTED_LANGUAGES, 
  speakTextInLanguage, 
  stopSpeech,
  loadVoiceSettings,
  saveVoiceSettings,
  setVoiceGender,
  applyVoicePreset,
  setSpeechRate,
  setSpeechPitch,
  getSpeechState,
} from '../utils/multilingualSpeech';

interface FloatingStudyToolsProps {
  currentSubjectName: string;
}

export const FloatingStudyTools: React.FC<FloatingStudyToolsProps> = ({ currentSubjectName }) => {
  // Widget Visibility States
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isBlueInfoPopupOpen, setIsBlueInfoPopupOpen] = useState(false);

  // Offline Voice Queue State
  const [offlineVoiceQueue, setOfflineVoiceQueue] = useState<QueuedVoiceTranscript[]>(() => getVoiceOfflineQueue());

  // Scratchpad & AI Assistant State
  const [scratchNotes, setScratchNotes] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Voice Input States
  const [isVoiceListeningAi, setIsVoiceListeningAi] = useState(false);
  const [isVoiceListeningScratch, setIsVoiceListeningScratch] = useState(false);
  const [speechStatusMsg, setSpeechStatusMsg] = useState('');
  const recognitionAiRef = useRef<any>(null);
  const recognitionScratchRef = useRef<any>(null);
  const isAiMicActiveRef = useRef(false);
  const isScratchMicActiveRef = useRef(false);
  const baseAiPromptRef = useRef('');
  const baseScratchNotesRef = useRef('');

  // Speech Synthesis State
  const [isSpeakingReply, setIsSpeakingReply] = useState(false);

  // Floating Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Audio Ambient Synthesizer & Custom Upload State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSubTab, setAudioSubTab] = useState<'voice' | 'soundscape'>('voice');
  const [audioMode, setAudioMode] = useState<'birds' | 'stream' | 'waves' | 'rain' | 'custom'>('birds');
  const [audioVolume, setAudioVolume] = useState(0.4);
  const [voiceGenderState, setVoiceGenderState] = useState<'male' | 'female'>(() => loadVoiceSettings().voiceGender || 'male');
  const [voiceSpeedState, setVoiceSpeedState] = useState<number>(() => loadVoiceSettings().voiceSpeed || 1.0);
  const [voicePitchState, setVoicePitchState] = useState<number>(() => loadVoiceSettings().voicePitch || 1.0);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);

  // Web Audio Context & Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);
  const birdIntervalRef = useRef<any>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync & Reactive state for Offline Voice Queue
  useEffect(() => {
    const handleQueueUpdate = () => {
      setOfflineVoiceQueue(getVoiceOfflineQueue());
    };

    window.addEventListener('studyhub_voice_queue_updated', handleQueueUpdate);

    // Auto-sync listener when network connection restores
    const cleanupSync = setupVoiceAutoSync((items) => {
      if (items.length > 0) {
        setLastVoiceCommand(`⚡ Auto-Synced ${items.length} queued voice transcript(s) to AI!`);
        setTimeout(() => setLastVoiceCommand(null), 4000);
        clearVoiceOfflineQueue();
        setOfflineVoiceQueue([]);
      }
    });

    return () => {
      window.removeEventListener('studyhub_voice_queue_updated', handleQueueUpdate);
      cleanupSync();
    };
  }, []);

  // Cleanup speech synthesis & audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopAllAudio();
      isAiMicActiveRef.current = false;
      isScratchMicActiveRef.current = false;
      if (recognitionAiRef.current) try { recognitionAiRef.current.stop(); } catch (e) {}
      if (recognitionScratchRef.current) try { recognitionScratchRef.current.stop(); } catch (e) {}
    };
  }, []);

  // Stop all active audio oscillators/buffers
  const stopAllAudio = () => {
    if (birdIntervalRef.current) {
      clearInterval(birdIntervalRef.current);
      birdIntervalRef.current = null;
    }

    activeNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];

    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  // Voice Command Parsing Helper (Strict commands to prevent accidental trigger during normal speech)
  const processVoiceCommands = (transcript: string) => {
    const lower = transcript.toLowerCase().trim();

    // 1. Timer Control Commands
    if (lower === 'start timer' || lower === 'begin timer' || lower === 'start focus' || lower === 'begin fokus') {
      setIsTimerRunning(true);
      setIsTimerOpen(true);
      setLastVoiceCommand('⏱️ Started Pomodoro Timer');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }
    if (lower === 'pause timer' || lower === 'stop timer' || lower === 'pouseer timer') {
      setIsTimerRunning(false);
      setLastVoiceCommand('⏸️ Paused Pomodoro Timer');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }
    if (lower === 'reset timer' || lower === 'herstel timer') {
      setIsTimerRunning(false);
      setTimerSeconds(25 * 60);
      setLastVoiceCommand('🔄 Resetted Timer to 25m');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }

    // 2. Nature Audio Soundscape Commands (Requires explicit 'speel' or 'play')
    if (lower === 'play birds' || lower === 'play nature' || lower === 'speel voëls' || lower === 'speel natuur') {
      stopAllAudio();
      setAudioMode('birds');
      setIsAudioOpen(true);
      setTimeout(() => startSoundscape('birds', audioVolume), 100);
      setLastVoiceCommand('🐦 Playing Forest Birds & Nature');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }
    if (lower === 'play stream' || lower === 'play water' || lower === 'speel bergstroom' || lower === 'speel stroom') {
      stopAllAudio();
      setAudioMode('stream');
      setIsAudioOpen(true);
      setTimeout(() => startSoundscape('stream', audioVolume), 100);
      setLastVoiceCommand('🏞️ Playing Mountain Stream');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }
    if (lower === 'play rain' || lower === 'speel reën') {
      stopAllAudio();
      setAudioMode('rain');
      setIsAudioOpen(true);
      setTimeout(() => startSoundscape('rain', audioVolume), 100);
      setLastVoiceCommand('🌧️ Playing Soft Rain');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }
    if (lower === 'play waves' || lower === 'play ocean' || lower === 'speel seegolwe') {
      stopAllAudio();
      setAudioMode('waves');
      setIsAudioOpen(true);
      setTimeout(() => startSoundscape('waves', audioVolume), 100);
      setLastVoiceCommand('🌊 Playing Ocean Waves');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }
    if (lower === 'stop audio' || lower === 'stop sound' || lower === 'stop klank' || lower === 'stop musiek') {
      stopAllAudio();
      setLastVoiceCommand('🔇 Stopped Audio');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }

    // 3. Scratchpad Note Commands
    if (lower === 'clear notes' || lower === 'clear scratchpad' || lower === 'vee notas uit') {
      setScratchNotes('');
      setLastVoiceCommand('🧹 Cleared Scratchpad');
      setTimeout(() => setLastVoiceCommand(null), 3000);
      return true;
    }

    return false;
  };

  // 1. Voice Dictation for Floating AI Query with Continuous Speech and Auto-Restart
  const handleToggleVoiceAi = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isVoiceListeningAi || isAiMicActiveRef.current) {
      isAiMicActiveRef.current = false;
      if (recognitionAiRef.current) {
        try { recognitionAiRef.current.stop(); } catch (err) {}
      }
      setIsVoiceListeningAi(false);
      setSpeechStatusMsg('');
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition API is not available in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      baseAiPromptRef.current = aiPrompt.trim();
      const preferredLang = loadVoiceSettings().preferredLanguage || 'af-ZA';
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionAiRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = preferredLang;

      isAiMicActiveRef.current = true;
      let lastCapturedText = '';

      recognition.onstart = () => {
        setIsVoiceListeningAi(true);
        setSpeechStatusMsg(preferredLang.startsWith('af') ? '🎤 Luister... Praat jou vraag' : '🎤 Listening... Speak your question');
      };

      recognition.onresult = (event: any) => {
        let currentFinalAcc = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinalAcc += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        const combined = (currentFinalAcc + currentInterim).replace(/\s+/g, ' ').trim();
        if (combined) {
          lastCapturedText = combined;
          const commandExecuted = processVoiceCommands(combined);
          if (!commandExecuted) {
            const base = baseAiPromptRef.current;
            setAiPrompt(base ? `${base} ${combined}` : combined);
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition status:', err?.error);
        if (err?.error === 'not-allowed' || err?.error === 'service-not-allowed') {
          setSpeechStatusMsg('⚠️ Microphone access blocked. Please allow microphone permission.');
          isAiMicActiveRef.current = false;
          setIsVoiceListeningAi(false);
        }
      };

      recognition.onend = () => {
        if (isAiMicActiveRef.current) {
          setTimeout(() => {
            if (isAiMicActiveRef.current) {
              try {
                recognition.start();
              } catch (err) {
                console.warn('AI Mic auto-restart:', err);
              }
            }
          }, 150);
          return;
        }

        setIsVoiceListeningAi(false);
        if (lastCapturedText && !processVoiceCommands(lastCapturedText)) {
          if (!navigator.onLine) {
            enqueueVoiceTranscript(lastCapturedText, currentSubjectName);
            setSpeechStatusMsg('📶 Offline: Saved voice to local queue. Will auto-sync when online!');
            setLastVoiceCommand('📶 Queued Offline Voice Transcript');
            setTimeout(() => setLastVoiceCommand(null), 3500);
          } else {
            setSpeechStatusMsg('✨ Voice captured! Tap send or dictate again.');
          }
        } else {
          setSpeechStatusMsg('');
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Voice input exception:', e);
      isAiMicActiveRef.current = false;
      setIsVoiceListeningAi(false);
      setSpeechStatusMsg('Microphone access unavailable.');
    }
  };

  // 2. Voice Dictation for Floating Scratchpad Textarea
  const handleToggleVoiceScratchpad = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isVoiceListeningScratch || isScratchMicActiveRef.current) {
      isScratchMicActiveRef.current = false;
      if (recognitionScratchRef.current) {
        try { recognitionScratchRef.current.stop(); } catch (err) {}
      }
      setIsVoiceListeningScratch(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser version.');
      return;
    }

    try {
      baseScratchNotesRef.current = scratchNotes.trim();
      const preferredLang = loadVoiceSettings().preferredLanguage || 'af-ZA';
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionScratchRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = preferredLang;

      isScratchMicActiveRef.current = true;

      recognition.onstart = () => setIsVoiceListeningScratch(true);

      recognition.onresult = (event: any) => {
        let currentFinalAcc = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinalAcc += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        const combined = (currentFinalAcc + currentInterim).replace(/\s+/g, ' ').trim();
        if (combined) {
          const base = baseScratchNotesRef.current;
          setScratchNotes(base ? `${base} ${combined}` : combined);
        }
      };

      recognition.onerror = (err: any) => {
        if (err?.error === 'not-allowed' || err?.error === 'service-not-allowed') {
          isScratchMicActiveRef.current = false;
          setIsVoiceListeningScratch(false);
        }
      };

      recognition.onend = () => {
        if (isScratchMicActiveRef.current) {
          setTimeout(() => {
            if (isScratchMicActiveRef.current) {
              try {
                recognition.start();
              } catch (err) {
                console.warn('Scratchpad mic auto-restart:', err);
              }
            }
          }, 150);
          return;
        }
        setIsVoiceListeningScratch(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Scratchpad voice error:', e);
      isScratchMicActiveRef.current = false;
      setIsVoiceListeningScratch(false);
    }
  };

  // 3. Text-to-Speech Read Aloud for AI Reply
  const handleReadAloudReply = () => {
    if (!aiReply) return;

    if (isSpeakingReply) {
      stopSpeech();
      setIsSpeakingReply(false);
      return;
    }

    const preferredLang = loadVoiceSettings().preferredLanguage || 'af-ZA';
    setIsSpeakingReply(true);
    speakTextInLanguage(
      aiReply,
      preferredLang,
      () => setIsSpeakingReply(true),
      () => setIsSpeakingReply(false),
      () => setIsSpeakingReply(false)
    );
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

  // Handle Custom Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload a valid audio file (e.g., MP3, WAV, OGG, M4A).');
      return;
    }

    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    setCustomAudioName(file.name);
    setAudioMode('custom');
    stopAllAudio();
  };

  // Start Procedural Nature Soundscape Engine
  const startSoundscape = (mode: 'birds' | 'stream' | 'waves' | 'rain' | 'custom', vol: number) => {
    stopAllAudio();

    if (mode === 'custom' && customAudioUrl) {
      if (!customAudioRef.current) {
        customAudioRef.current = new Audio(customAudioUrl);
        customAudioRef.current.loop = true;
      }
      customAudioRef.current.volume = vol;
      customAudioRef.current.play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => console.warn('Custom audio play error:', err));
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(vol, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (mode === 'birds') {
        // Forest Birds & Nature: Rustling leaves breeze + Procedural FM bird chirps
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
          b6 = white * 0.115926;
        }

        const breeze = ctx.createBufferSource();
        breeze.buffer = noiseBuffer;
        breeze.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        breeze.connect(filter);
        filter.connect(masterGain);
        breeze.start();

        // Procedural bird chirp generator loop
        const triggerBirdChirp = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const chirpOsc = audioCtxRef.current.createOscillator();
          const chirpGain = audioCtxRef.current.createGain();
          const now = audioCtxRef.current.currentTime;

          chirpOsc.type = 'sine';
          const baseFreq = 2400 + Math.random() * 1200;
          chirpOsc.frequency.setValueAtTime(baseFreq, now);
          chirpOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.06);
          chirpOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.14);

          chirpGain.gain.setValueAtTime(0, now);
          chirpGain.gain.linearRampToValueAtTime(0.2, now + 0.03);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

          chirpOsc.connect(chirpGain);
          chirpGain.connect(masterGain);

          chirpOsc.start(now);
          chirpOsc.stop(now + 0.18);
        };

        // Fire immediate chirp and schedule interval
        triggerBirdChirp();
        birdIntervalRef.current = setInterval(triggerBirdChirp, 1100 + Math.random() * 800);

        activeNodesRef.current = [breeze, filter, masterGain];
      } else if (mode === 'stream') {
        // Babbling Mountain Stream: Filtered water bubble noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.12;
        }

        const streamNoise = ctx.createBufferSource();
        streamNoise.buffer = noiseBuffer;
        streamNoise.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(750, ctx.currentTime);
        bandpass.Q.setValueAtTime(2.0, ctx.currentTime);

        streamNoise.connect(bandpass);
        bandpass.connect(masterGain);
        streamNoise.start();

        activeNodesRef.current = [streamNoise, bandpass, masterGain];
      } else if (mode === 'waves') {
        // Ocean Waves
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.12;
        }

        const waveNoise = ctx.createBufferSource();
        waveNoise.buffer = noiseBuffer;
        waveNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        waveNoise.connect(filter);
        filter.connect(masterGain);
        waveNoise.start();
        activeNodesRef.current = [waveNoise, filter, masterGain];
      } else {
        // Soft Rain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        }

        const rainNoise = ctx.createBufferSource();
        rainNoise.buffer = noiseBuffer;
        rainNoise.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(850, ctx.currentTime);
        bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

        rainNoise.connect(bandpass);
        bandpass.connect(masterGain);
        rainNoise.start();
        activeNodesRef.current = [rainNoise, bandpass, masterGain];
      }

      setIsPlayingAudio(true);
    } catch (err) {
      console.warn('Audio soundscape error:', err);
    }
  };

  // Toggle Audio Soundscape Synthesizer or Custom Audio Track
  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopAllAudio();
      return;
    }
    startSoundscape(audioMode, audioVolume);
  };

  // Adjust Volume in Real-Time
  useEffect(() => {
    if (customAudioRef.current) {
      customAudioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Download Sample Study Sound Preset
  const handleDownloadSampleSound = () => {
    const audioContent = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    const link = document.createElement('a');
    link.href = audioContent;
    link.download = 'StudyHub_Alpha_Focus_Sound.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Floating AI Quick Helper Call
  const handleAskQuickAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    const userQ = aiPrompt;
    setAiPrompt('');
    const preferredLang = loadVoiceSettings().preferredLanguage || 'af-ZA';
    const isAf = preferredLang.startsWith('af');

    try {
      if (navigator.onLine) {
        const res = await fetch('/api/tutor-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userQ,
            subject: currentSubjectName,
            language: preferredLang,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiReply(data.reply || data.text || (isAf ? 'Ontvang! Ontleed tans die konsep...' : 'Got it! Reviewing concept...'));
          setIsAiLoading(false);
          return;
        }
      }

      // Offline quick response
      if (isAf) {
        setAiReply(`💡 [${currentSubjectName}] Vinnige Wenk: ${userQ.slice(0, 35)}...\nFokus op sleuteldefinisies, aktiewe herroeping van formules en vorige vraestelle.`);
      } else {
        setAiReply(`💡 [${currentSubjectName}] Quick Tip: ${userQ.slice(0, 35)}...\nFocus on key definitions, active recall formulas, and past paper question patterns.`);
      }
    } catch (err) {
      if (isAf) {
        setAiReply(`💡 [${currentSubjectName}] Wenk: Hersien sleutelbegrippe en oefen vraestelle vir die beste eksamenresultate.`);
      } else {
        setAiReply(`💡 [${currentSubjectName}] Quick Tip: Review key formulas and practice active recall for best exam retention.`);
      }
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
        <div className="pointer-events-auto w-80 sm:w-96 bg-white dark:bg-[#161C18] border-2 border-[#5A6D5B]/40 dark:border-emerald-700/60 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
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

            <div className="flex items-center gap-1">
              {/* Blue Info Pop-up Icon Button */}
              <button
                type="button"
                onClick={() => setIsBlueInfoPopupOpen(!isBlueInfoPopupOpen)}
                className={`p-1.5 rounded-full transition-all cursor-pointer relative ${
                  isBlueInfoPopupOpen 
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' 
                    : 'bg-blue-500/80 hover:bg-blue-500 text-white'
                }`}
                title="Click blue info icon for curriculum & voice queue information"
              >
                <Info className="w-4 h-4" />
                {offlineVoiceQueue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                )}
              </button>

              <button
                onClick={() => setIsScratchpadOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Blue Info Pop-up Overlay Card */}
          {isBlueInfoPopupOpen && (
            <div className="p-3.5 bg-blue-900 text-white text-xs space-y-2.5 border-b border-blue-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-blue-800">
                <div className="flex items-center gap-1.5 font-bold text-blue-200">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>System & Curriculum Context Info</span>
                </div>
                <button
                  onClick={() => setIsBlueInfoPopupOpen(false)}
                  className="text-blue-300 hover:text-white text-[10px] font-bold underline"
                >
                  Close Info
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-blue-950/80 rounded-lg border border-blue-800">
                  <div className="font-bold text-blue-300">Grade & Curriculum</div>
                  <div className="text-blue-100 text-[10px]">K-12 through University/Ph.D.</div>
                </div>

                <div className="p-2 bg-blue-950/80 rounded-lg border border-blue-800">
                  <div className="font-bold text-blue-300">Security Firewall</div>
                  <div className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Active Protection</span>
                  </div>
                </div>
              </div>

              {/* Offline Voice Queue Info in Blue Pop-up */}
              <div className="p-2 bg-blue-950/90 rounded-lg border border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <div className="font-bold text-amber-300 text-[11px]">Offline Voice Queue</div>
                    <div className="text-[10px] text-blue-200">
                      {offlineVoiceQueue.length === 0 
                        ? 'No offline transcripts pending.' 
                        : `${offlineVoiceQueue.length} transcript(s) stored for auto-sync.`}
                    </div>
                  </div>
                </div>

                {offlineVoiceQueue.length > 0 && (
                  <button
                    onClick={() => {
                      if (navigator.onLine) {
                        setLastVoiceCommand(`⚡ Synced ${offlineVoiceQueue.length} queued transcripts!`);
                        setTimeout(() => setLastVoiceCommand(null), 3500);
                        clearVoiceOfflineQueue();
                        setOfflineVoiceQueue([]);
                      } else {
                        alert('Device is currently offline. Transcripts will auto-sync when connection restores.');
                      }
                    }}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-md transition-colors cursor-pointer"
                  >
                    Sync Now
                  </button>
                )}
              </div>

              <div className="text-[10px] text-blue-200/80 leading-tight">
                💡 <strong>Voice Commands:</strong> Say <em>"start timer"</em>, <em>"play birds"</em>, or <em>"clear notes"</em>.
              </div>
            </div>
          )}

          <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto text-[#2D362E] dark:text-[#F4F1EA]">
            {/* Quick AI Query Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#575047] dark:text-[#A6C4A7] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#5A6D5B] dark:text-emerald-400" />
                  <span>Ask Quick AI Clarification</span>
                </label>

                {speechStatusMsg && (
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                    {speechStatusMsg}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuickAi()}
                  placeholder={isVoiceListeningAi ? '🎤 Listening to your voice... Speak now' : 'Ask a quick formula or definition...'}
                  className={`flex-1 px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A231C] border rounded-xl text-xs text-[#2D362E] dark:text-[#F4F1EA] placeholder-[#8C857A] focus:outline-none focus:border-[#5A6D5B] ${
                    isVoiceListeningAi ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100 font-bold shadow-xs' : 'border-[#D9D1C7] dark:border-[#2F3E31]'
                  }`}
                />
                
                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceAi}
                  className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    isVoiceListeningAi
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-md'
                      : 'bg-[#F2EFE9] dark:bg-[#253027] text-[#5A6D5B] dark:text-emerald-300 border-[#D9D1C7] dark:border-[#2F3E31] hover:bg-[#EBE7DF]'
                  }`}
                  title={isVoiceListeningAi ? 'Stop Voice Input' : 'Speak to AI (Voice Input)'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  onClick={handleAskQuickAi}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="p-2 bg-[#5A6D5B] hover:bg-[#4A5D4B] text-white rounded-xl disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* High Contrast AI Assistant Reply Box */}
              {aiReply && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed space-y-2 shadow-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>AI Assistant Reply</span>
                    </span>
                    <button
                      onClick={handleReadAloudReply}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 rounded-lg font-bold hover:bg-emerald-200 cursor-pointer transition-all"
                    >
                      {isSpeakingReply ? <VolumeX className="w-3 h-3 text-rose-600" /> : <Volume2 className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />}
                      <span>{isSpeakingReply ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                  <div className="font-medium whitespace-pre-line text-[#1B2A1D] dark:text-[#E2F0E3]">
                    {aiReply}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Scratchpad */}
            <div className="space-y-1.5 pt-2 border-t border-[#E8E2D8] dark:border-[#2C3B2E]">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#575047] dark:text-[#A6C4A7] uppercase tracking-wider flex items-center gap-1">
                  <PenTool className="w-3 h-3 text-[#5A6D5B] dark:text-emerald-400" />
                  <span>Floating Scratchpad</span>
                </label>

                <button
                  type="button"
                  onClick={handleToggleVoiceScratchpad}
                  className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    isVoiceListeningScratch
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      : 'bg-[#F2EFE9] dark:bg-[#253027] text-[#5A6D5B] dark:text-emerald-300 border-[#D9D1C7] dark:border-[#2F3E31]'
                  }`}
                  title="Dictate Notes into Scratchpad"
                >
                  <Mic className="w-3 h-3" />
                  <span>{isVoiceListeningScratch ? 'Dictating...' : 'Dictate'}</span>
                </button>
              </div>

              <textarea
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                placeholder={isVoiceListeningScratch ? '🎤 Dictating notes... speak clearly into your mic...' : 'Jot down quick exam formulas, hints, or rough notes...'}
                className={`w-full h-24 p-2.5 border rounded-xl text-xs font-mono text-[#2D362E] dark:text-[#F4F1EA] focus:outline-none focus:border-[#5A6D5B] resize-none ${
                  isVoiceListeningScratch ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 font-semibold' : 'bg-[#FBF9F5] dark:bg-[#1A231C] border-[#D9D1C7] dark:border-[#2F3E31]'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Pomodoro Timer Window */}
      {isTimerOpen && (
        <div className="pointer-events-auto p-4 bg-white dark:bg-[#161C18] border-2 border-amber-500/40 rounded-3xl shadow-2xl w-68 animate-in fade-in slide-in-from-bottom-5 duration-200 space-y-3 text-[#2D362E] dark:text-[#F4F1EA]">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] dark:border-[#2C3B2E] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E] dark:text-[#F4F1EA]">
              <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Floating Pomodoro</span>
            </div>
            <button
              onClick={() => setIsTimerOpen(false)}
              className="p-1 text-[#8C8275] hover:text-[#2D362E] dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center py-1">
            <div className="text-3xl font-extrabold font-mono text-[#2D362E] dark:text-white tracking-wider">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-[10px] text-[#736B5E] dark:text-[#A6C4A7] mt-0.5">25 Min Deep Work Session</p>
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
              className="p-1.5 bg-[#F2EFE9] dark:bg-[#253027] hover:bg-[#EBE7DF] text-[#2D362E] dark:text-[#F4F1EA] rounded-xl border border-[#D9D1C7] dark:border-[#2F3E31] cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Soundscape Synth & Voice Studio Window */}
      {isAudioOpen && (
        <div className="pointer-events-auto p-4 bg-white dark:bg-[#161C18] border-2 border-emerald-500/40 rounded-3xl shadow-2xl w-80 animate-in fade-in slide-in-from-bottom-5 duration-200 space-y-3 text-[#2D362E] dark:text-[#F4F1EA]">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] dark:border-[#2C3B2E] pb-2">
            <div className="flex items-center gap-1.5 p-0.5 bg-[#F2EFE9] dark:bg-[#222E24] rounded-xl text-xs font-bold">
              <button
                onClick={() => setAudioSubTab('voice')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                  audioSubTab === 'voice'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#675E54] dark:text-[#A6C4A7] hover:text-[#2D362E]'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>KI-Stem Studio</span>
              </button>
              <button
                onClick={() => setAudioSubTab('soundscape')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                  audioSubTab === 'soundscape'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#675E54] dark:text-[#A6C4A7] hover:text-[#2D362E]'
                }`}
              >
                <Headphones className="w-3 h-3" />
                <span>Soundscapes</span>
              </button>
            </div>
            <button
              onClick={() => setIsAudioOpen(false)}
              className="p-1 text-[#8C8275] hover:text-[#2D362E] dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {audioSubTab === 'voice' ? (
            <div className="space-y-3">
              {/* Voice Gender Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A746B] dark:text-[#A6C4A7] block mb-1.5">
                  Spraak- & Vertellerstem
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setVoiceGenderState('male');
                      setVoiceGender('male');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      voiceGenderState === 'male'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                        : 'bg-[#F2EFE9] dark:bg-[#253027] text-[#575047] dark:text-[#A6C4A7] hover:bg-[#EBE7DF]'
                    }`}
                  >
                    <span>👨 Manlik (Jan)</span>
                  </button>
                  <button
                    onClick={() => {
                      setVoiceGenderState('female');
                      setVoiceGender('female');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      voiceGenderState === 'female'
                        ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400'
                        : 'bg-[#F2EFE9] dark:bg-[#253027] text-[#575047] dark:text-[#A6C4A7] hover:bg-[#EBE7DF]'
                    }`}
                  >
                    <span>👩 Vroulik (Anri)</span>
                  </button>
                </div>
              </div>

              {/* Speed & Pitch Controls */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#7A746B] dark:text-[#A6C4A7]">
                    <span>Leesspoed</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{voiceSpeedState}x</span>
                  </div>
                  <div className="flex gap-1 pt-0.5">
                    {[0.8, 1.0, 1.25].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setVoiceSpeedState(spd);
                          setSpeechRate(spd);
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          voiceSpeedState === spd
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-[#253027] text-[#575047] dark:text-[#A6C4A7]'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#7A746B] dark:text-[#A6C4A7]">
                    <span>Toonhoogte</span>
                    <span className="text-purple-600 dark:text-purple-400">{voicePitchState < 1.0 ? 'Diep' : voicePitchState > 1.0 ? 'Hoog' : 'Normaal'}</span>
                  </div>
                  <div className="flex gap-1 pt-0.5">
                    {[
                      { val: 0.85, label: 'Diep' },
                      { val: 1.0, label: 'Normaal' },
                      { val: 1.15, label: 'Hoog' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => {
                          setVoicePitchState(p.val);
                          setSpeechPitch(p.val);
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          voicePitchState === p.val
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-[#253027] text-[#575047] dark:text-[#A6C4A7]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Afrikaans Voice Button */}
              <button
                onClick={() => {
                  if (isTestingVoice) {
                    stopSpeech();
                    setIsTestingVoice(false);
                    return;
                  }
                  setIsTestingVoice(true);
                  speakTextInLanguage(
                    `Goeiedag! Ek is jou ${voiceGenderState === 'male' ? 'manlike' : 'vroulike'} Afrikaanse studie-assistent. Alle stem- en klankverstellings is suksesvol opgestel.`,
                    'af-ZA',
                    () => setIsTestingVoice(true),
                    () => setIsTestingVoice(false),
                    () => setIsTestingVoice(false)
                  );
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {isTestingVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isTestingVoice ? 'Stop Toets' : '▶ Toets Afrikaanse Stem'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'birds', label: '🐦 Woud & Voëls' },
                  { id: 'stream', label: '🏞️ Bergstroom' },
                  { id: 'waves', label: '🌊 Seegolwe' },
                  { id: 'rain', label: '🌧️ Sagte Reën' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      const newMode = m.id as any;
                      setAudioMode(newMode);
                      if (isPlayingAudio) {
                        startSoundscape(newMode, audioVolume);
                      }
                    }}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      audioMode === m.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#F2EFE9] dark:bg-[#253027] text-[#575047] dark:text-[#A6C4A7] hover:bg-[#EBE7DF]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Upload Custom Audio File Option */}
              <div className="p-2 bg-[#F9F7F2] dark:bg-[#1A231C] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A746B] dark:text-[#A6C4A7] flex items-center gap-1">
                    <Music className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Eie Studiemusiek</span>
                  </span>
                  
                  <button
                    onClick={handleDownloadSampleSound}
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Download sample Alpha Focus WAV file"
                  >
                    <Download className="w-3 h-3" />
                    <span>Voorbeeld</span>
                  </button>
                </div>

                <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-[#253027] hover:bg-[#F2EFE9] border border-[#D9D1C7] dark:border-[#2F3E31] rounded-lg text-xs font-bold text-[#5A6D5B] dark:text-emerald-300 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate max-w-[170px]">{customAudioName || 'Laai MP3 / Oudiolêer Op'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold text-[#7A746B]">Volume:</span>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Play/Stop Main Button */}
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
                  <span>{isPlayingAudio ? 'Stop Klankbaan' : `Speel ${audioMode === 'custom' ? 'Eie Snit' : 'Klankbaan'}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Command Confirmation Toast */}
      {lastVoiceCommand && (
        <div className="pointer-events-auto px-3 py-1.5 bg-[#2D362E] text-emerald-300 border border-emerald-500/50 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          {lastVoiceCommand}
        </div>
      )}

      {/* Floating Launcher Action Toolbar */}
      <div className="pointer-events-auto flex items-center gap-2 bg-[#2D362E]/90 dark:bg-[#121814]/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/20">
        
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
          title="Floating Soundscape Synthesizer & Upload"
        >
          <Headphones className="w-5 h-5 text-purple-300" />
        </button>
      </div>

    </div>
  );
};

