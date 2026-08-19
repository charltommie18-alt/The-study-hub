import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  FastForward, 
  RotateCcw, 
  Sliders, 
  X, 
  Sparkles, 
  Globe, 
  ChevronDown, 
  Check,
  Download,
  User,
  Zap,
  GraduationCap,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { 
  getSpeechState, 
  subscribeSpeechState, 
  togglePauseSpeech, 
  stopSpeech, 
  restartSpeech,
  setSpeechRate,
  setSpeechPitch,
  setSpeechVolume,
  setSelectedVoiceURI,
  setVoiceGender,
  applyVoicePreset,
  downloadSpeechAudio,
  getAvailableSystemVoices,
  subscribeVoicesList,
  FormattedVoiceOption,
  SpeechPlaybackState,
  SUPPORTED_LANGUAGES,
  loadVoiceSettings,
  validateLanguageCode,
  findAfrikaansBrowserVoice,
} from '../utils/multilingualSpeech';

export const VoiceNarrationController: React.FC = () => {
  const [speechState, setSpeechState] = useState<SpeechPlaybackState>(getSpeechState());
  const [isMinimized, setIsMinimized] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<FormattedVoiceOption[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Validation Step: Validate and ensure langCode is af-ZA
  const validatedLanguage = useMemo(() => {
    return validateLanguageCode(speechState.langCode || 'af-ZA');
  }, [speechState.langCode]);

  useEffect(() => {
    const unsubState = subscribeSpeechState((state) => {
      setSpeechState(state);
    });
    const unsubVoices = subscribeVoicesList((voices) => {
      setAvailableVoices(voices);

      // Force browser SpeechSynthesis to select an Afrikaans-specific voice (Google Afrikaans or Microsoft Elsa)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const afVoice = findAfrikaansBrowserVoice();
        if (afVoice) {
          const currentUri = loadVoiceSettings().selectedVoiceURI;
          // If no voice is set or if an English/foreign voice was previously selected, switch to native Afrikaans
          if (!currentUri || (!currentUri.startsWith('ai-neural-') && !currentUri.toLowerCase().includes('af') && !currentUri.toLowerCase().includes('elsa') && !currentUri.toLowerCase().includes('google'))) {
            setSelectedVoiceURI(afVoice.voiceURI || afVoice.name);
          }
        }
      }
    });

    return () => {
      unsubState();
      unsubVoices();
    };
  }, []);

  if (!speechState.isPlaying && !speechState.isPaused) {
    return null;
  }

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === validatedLanguage) || {
    code: 'af-ZA',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];
  const pitchOptions = [0.8, 1.0, 1.2];

  const handleCycleSpeed = () => {
    const currentIndex = speedOptions.indexOf(speechState.playbackRate);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    setSpeechRate(speedOptions[nextIndex]);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setSpeechVolume(1.0);
      setIsMuted(false);
    } else {
      setSpeechVolume(0.0);
      setIsMuted(true);
    }
  };

  const handleSelectVoice = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    setShowVoiceMenu(false);
  };

  // Explicitly force select Google Afrikaans or Microsoft Elsa browser voice
  const handleForceAfrikaansBrowserVoice = (voiceNameKeyword: 'google' | 'elsa') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    const matched = voices.find(v => v.name.toLowerCase().includes(voiceNameKeyword) || v.lang.toLowerCase().startsWith('af'));
    if (matched) {
      setSelectedVoiceURI(matched.voiceURI || matched.name);
    } else {
      // If offline voice not installed, use Google Cloud neural Afrikaans voice
      setSelectedVoiceURI('ai-neural-male-puck');
    }
  };

  const handleDownloadAudio = async () => {
    if (!speechState.currentText || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadSpeechAudio(speechState.currentText, validatedLanguage, 'studyhub_audio_les');
    } finally {
      setIsDownloading(false);
    }
  };

  // Find currently selected voice label
  const activeVoiceOption = availableVoices.find(
    (v) => v.voiceURI === speechState.selectedVoiceURI
  ) || availableVoices[0];

  const currentSettings = loadVoiceSettings();
  const currentGender = currentSettings.voiceGender || 'male';

  // Detected browser Afrikaans voice name
  const detectedAfVoice = speechState.detectedAfrikaansVoiceName || findAfrikaansBrowserVoice()?.name;

  return (
    <aside aria-label="Audio narration controls" className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-xl animate-slide-up">
      <div className="bg-[#2D362E]/95 dark:bg-[#121A14]/95 backdrop-blur-md border border-[#5A6D5B]/40 dark:border-emerald-600/40 text-white rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 transition-all">
        
        {/* Top Info Bar: Language Validation Badge, Title, Pulse Indicator, Actions */}
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{langObj.flag}</span>
            <div className="flex items-center gap-1.5 font-bold truncate">
              <span className="text-emerald-400 text-[11px] uppercase tracking-wider">
                {currentGender === 'male' ? '👨 Manlike KI-Stem' : '👩 Vroulike KI-Stem'}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/90 text-xs truncate">{langObj.name}</span>
            </div>
            
            {/* Validation badge guaranteeing af-ZA language code */}
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-md border border-emerald-500/30" title="Taal-validering: af-ZA aktief">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>af-ZA</span>
            </span>

            {speechState.isPlaying && !speechState.isPaused && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Praat
              </span>
            )}
            {speechState.isPaused && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full">
                Gepouseer
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Download Audio Button */}
            <button
              onClick={handleDownloadAudio}
              disabled={isDownloading || !speechState.currentText}
              className="p-1.5 rounded-lg text-white/70 hover:text-emerald-300 hover:bg-white/10 transition-colors cursor-pointer text-xs"
              title="Laai Oudio Af (MP3 / WAV)"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                showAdvancedSettings ? 'bg-emerald-500/30 text-emerald-300' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Stem- & Oudioverstellings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer text-[11px]"
              title={isMinimized ? 'Wys Teks' : 'Versteek Teks'}
            >
              {isMinimized ? 'Wys' : 'Versteek'}
            </button>
            <button
              onClick={stopSpeech}
              className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Stop Oudio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Afrikaans Voice Selection Bar (1 Voice for Men, 1 Voice for Women) */}
        <div className="flex items-center justify-between gap-1.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white/70">Kies Stem:</span>
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl shrink-0">
              <button
                onClick={() => setVoiceGender('male')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  currentGender === 'male' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
                title="Skakel na Afrikaanse Manlike Stem (Man)"
              >
                <span>👨 Manlik</span>
              </button>
              <button
                onClick={() => setVoiceGender('female')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  currentGender === 'female' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
                title="Skakel na Afrikaanse Vroulike Stem (Vrou)"
              >
                <span>👩 Vroulik</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
            <span>🇿🇦 {currentGender === 'male' ? 'Manlike Stem' : 'Vroulike Stem'}</span>
          </div>
        </div>

        {/* Advanced TTS Controls Drawer (Pitch, Volume Slider) */}
        {showAdvancedSettings && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
            {/* Pitch Selection */}
            <div>
              <span className="text-white/60 text-[10px] uppercase font-bold block mb-1">Toonhoogte (Pitch):</span>
              <div className="flex items-center gap-1.5">
                {pitchOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSpeechPitch(p)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      speechState.pitch === p
                        ? 'bg-emerald-500 text-gray-950 font-bold'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {p === 0.8 ? 'Diep (Manlik)' : p === 1.0 ? 'Normaal' : 'Hoog'} ({p}x)
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div>
              <span className="text-white/60 text-[10px] uppercase font-bold block mb-1">Klankvolume:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMute}
                  className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 cursor-pointer"
                >
                  {speechState.volume === 0 || isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={speechState.volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSpeechVolume(val);
                    setIsMuted(val === 0);
                  }}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
                />
                <span className="text-[10px] font-mono text-emerald-300 w-8 text-right">
                  {Math.round(speechState.volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Spoken Text Preview (if not minimized) */}
        {!isMinimized && speechState.currentText && (
          <p className="text-xs text-white/80 line-clamp-2 leading-relaxed italic bg-white/5 rounded-xl p-2 border border-white/5">
            "{speechState.currentText}"
          </p>
        )}

        {/* Audio Controls Bar (Waveform, Restart, Play/Pause, Stop, Speed Multiplier) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Wave visualizer */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-xl">
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex items-end gap-0.5 h-4 w-10 sm:w-14">
              <span className={`w-1 bg-emerald-400 rounded-full transition-all ${speechState.isPlaying && !speechState.isPaused ? 'h-3.5 animate-bounce' : 'h-1.5'}`}></span>
              <span className={`w-1 bg-emerald-300 rounded-full transition-all ${speechState.isPlaying && !speechState.isPaused ? 'h-4 animate-pulse' : 'h-1'}`}></span>
              <span className={`w-1 bg-emerald-400 rounded-full transition-all ${speechState.isPlaying && !speechState.isPaused ? 'h-2 animate-bounce' : 'h-2'}`}></span>
              <span className={`w-1 bg-emerald-300 rounded-full transition-all ${speechState.isPlaying && !speechState.isPaused ? 'h-3 animate-pulse' : 'h-1.5'}`}></span>
            </div>
          </div>

          {/* Center Play/Pause, Replay & Stop Buttons */}
          <div className="flex items-center gap-2">
            {/* Replay from Start Button */}
            <button
              onClick={restartSpeech}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
              title="Herbegin Oudio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Main Pause / Resume Button */}
            <button
              onClick={togglePauseSpeech}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 ${
                speechState.isPaused 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' 
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
              }`}
              title={speechState.isPaused ? 'Gaan Voort met KI-Stem' : 'Pouseer KI-Stem'}
            >
              {speechState.isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Voortgaan</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pouseer</span>
                </>
              )}
            </button>

            {/* Stop Button */}
            <button
              onClick={stopSpeech}
              className="p-2 bg-white/10 hover:bg-red-500/30 text-white hover:text-red-300 rounded-xl transition-all cursor-pointer"
              title="Stop Oudio"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Speed Toggle Button */}
          <button
            onClick={handleCycleSpeed}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Verander Speelspoed"
          >
            <FastForward className="w-3.5 h-3.5 text-emerald-400" />
            <span>{speechState.playbackRate}x</span>
          </button>
        </div>

      </div>
    </aside>
  );
};

