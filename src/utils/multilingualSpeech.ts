// Multilingual Voice Engine: Speech Recognition & Text-to-Speech in 14+ Languages including authentic Afrikaans AI Voice

export interface LanguageConfig {
  code: string;       // BCP-47 tag, e.g. 'af-ZA'
  name: string;       // Human readable, e.g. 'Afrikaans'
  nativeName: string; // e.g. 'Afrikaans'
  flag: string;       // Emoji flag or symbol
}

export interface VoiceGenderOption {
  gender: 'male' | 'female';
  name: string;
  role: string;
  avatar: string;
}

export const GENDER_VOICES: VoiceGenderOption[] = [
  {
    gender: 'male',
    name: 'Manlik (Man)',
    role: 'Afrikaanse Manlike Stem',
    avatar: '👨',
  },
  {
    gender: 'female',
    name: 'Vroulik (Vrou)',
    role: 'Afrikaanse Vroulike Stem',
    avatar: '👩',
  },
];

export interface VoiceSettings {
  preferredLanguage: string;
  voiceGender: 'male' | 'female';
  voiceSpeed: number; // 0.75, 0.85, 1.0, 1.25, 1.5, 2.0
  autoReadAiResponses: boolean;
  voicePitch: number; // 0.80 (deep male), 1.05 (natural female)
  voiceVolume: number;
  selectedVoiceURI?: string;
  forceAfrikaansVoice?: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  preferredLanguage: 'af-ZA',
  voiceGender: 'male',
  voiceSpeed: 1.0,
  voicePitch: 0.80, // Rich, deep, authoritative male pitch
  voiceVolume: 1.0,
  autoReadAiResponses: false,
  selectedVoiceURI: 'ai-neural-male-charon',
  forceAfrikaansVoice: true,
};

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-ZA', name: 'English (SA)', nativeName: 'English (SA)', flag: '🇿🇦' },
  { code: 'zu-ZA', name: 'isiZulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'st-ZA', name: 'Sesotho', nativeName: 'Sesotho', flag: '🇿🇦' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh-CN', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export interface FormattedVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  isAfrikaans: boolean;
  isNeuralOrHQ: boolean;
  label: string;
  rawVoice?: SpeechSynthesisVoice;
}

export interface SpeechPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  langCode: string;
  playbackRate: number;
  pitch: number;
  volume: number;
  selectedVoiceURI?: string;
  source: 'ai-audio' | 'web-speech' | 'idle';
  detectedAfrikaansVoiceName?: string;
}

let activeAudioElement: HTMLAudioElement | null = null;
let currentSpeechMode: 'ai-audio' | 'web-speech' | 'idle' = 'idle';
let currentSpeechText = '';
let currentLangCode = 'af-ZA';
let currentRate = 1.0;
let currentPitch = 0.85;
let currentVolume = 1.0;
let currentSelectedVoiceURI = '';
let isWebSpeechPaused = false;
let lastOnStart: (() => void) | undefined;
let lastOnEnd: (() => void) | undefined;
let lastOnError: ((err: any) => void) | undefined;

// Concurrency & Cancellation Control
let currentSessionToken = 0;
let inFlightAbortController: AbortController | null = null;

const stateListeners = new Set<(state: SpeechPlaybackState) => void>();

/**
 * Validation step to ensure language code is well-formed and strictly defaults to af-ZA when applicable
 */
export function validateLanguageCode(langCode?: string | null): string {
  if (!langCode || typeof langCode !== 'string') {
    return 'af-ZA';
  }
  const clean = langCode.trim();
  if (clean.toLowerCase().startsWith('af')) {
    return 'af-ZA';
  }
  const matched = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === clean.toLowerCase());
  return matched ? matched.code : clean || 'af-ZA';
}

/**
 * Normalize and prepare text for clear spoken Afrikaans (math, symbols, science)
 */
export function prepareAfrikaansSpokenText(text: string): string {
  if (!text) return '';
  return text
    .replace(/#+/g, '')
    .replace(/\*+/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/(\d+)\s*\+\s*(\d+)/g, '$1 plus $2')
    .replace(/(\d+)\s*-\s*(\d+)/g, '$1 minus $2')
    .replace(/(\d+)\s*=\s*(\d+)/g, '$1 is gelyk aan $2')
    .replace(/(\d+)%/g, '$1 persent')
    .replace(/°C/g, ' grade Celsius')
    .replace(/\bCO2\b/g, 'koolstofdioksied')
    .replace(/\bH2O\b/g, 'water')
    .replace(/\bO2\b/g, 'suurstof')
    .replace(/\bATP\b/g, 'A-T-P')
    .replace(/\bDNA\b/g, 'D-N-A')
    .replace(/\bRNA\b/g, 'R-N-A')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper to explicitly find browser SpeechSynthesis voices that match Afrikaans
 */
export function findAfrikaansBrowserVoice(preferGender: 'male' | 'female' = 'male'): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return undefined;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return undefined;

  const isMalePreferred = preferGender === 'male';

  // 1. Search for gender-preferred Afrikaans voice first
  if (isMalePreferred) {
    const maleAfMatch = voices.find((v) => {
      const n = v.name.toLowerCase();
      const l = v.lang.toLowerCase();
      const isAf = l.startsWith('af') || n.includes('afrikaans');
      return isAf && (n.includes('jan') || n.includes('willem') || n.includes('dawid') || n.includes('male') || n.includes('david') || n.includes('manlik'));
    });
    if (maleAfMatch) return maleAfMatch;
  } else {
    const femaleAfMatch = voices.find((v) => {
      const n = v.name.toLowerCase();
      const l = v.lang.toLowerCase();
      const isAf = l.startsWith('af') || n.includes('afrikaans');
      return isAf && (n.includes('elsa') || n.includes('anri') || n.includes('female') || n.includes('vroulik'));
    });
    if (femaleAfMatch) return femaleAfMatch;
  }

  // 2. Check for named Afrikaans voices (Google Afrikaans, Microsoft Elsa)
  const priorityMatch = voices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return nameLower.includes('google afrikaans') || 
           nameLower.includes('microsoft elsa') || 
           nameLower.includes('elsa');
  });
  if (priorityMatch) return priorityMatch;

  // 3. Check for any voice tagged with af-ZA or af
  const langMatch = voices.find((v) => {
    const langLower = v.lang.toLowerCase();
    return langLower === 'af-za' || langLower === 'af_za' || langLower.startsWith('af');
  });
  if (langMatch) return langMatch;

  // 4. Check for any voice with 'afrikaans' in its name
  const nameContains = voices.find((v) => v.name.toLowerCase().includes('afrikaans'));
  if (nameContains) return nameContains;

  return undefined;
}

export function getSpeechState(): SpeechPlaybackState {
  const isAudioPlaying = !!(activeAudioElement && !activeAudioElement.paused && !activeAudioElement.ended);
  const isAudioPaused = !!(activeAudioElement && activeAudioElement.paused && activeAudioElement.currentTime > 0 && !activeAudioElement.ended);
  
  const isSyntheticSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  const isSyntheticPaused = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused;

  const isPlaying = isAudioPlaying || (isSyntheticSpeaking && !isSyntheticPaused);
  const isPaused = isAudioPaused || isSyntheticPaused || isWebSpeechPaused;

  const savedSettings = loadVoiceSettings();
  const afVoice = findAfrikaansBrowserVoice(savedSettings.voiceGender || 'male');

  return {
    isPlaying,
    isPaused,
    currentText: currentSpeechText,
    langCode: validateLanguageCode(currentLangCode),
    playbackRate: currentRate,
    pitch: currentPitch,
    volume: currentVolume,
    selectedVoiceURI: currentSelectedVoiceURI,
    source: currentSpeechMode,
    detectedAfrikaansVoiceName: afVoice ? afVoice.name : undefined,
  };
}

function notifyStateChange() {
  const state = getSpeechState();
  stateListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.warn('Speech listener error:', e);
    }
  });
}

export function subscribeSpeechState(listener: (state: SpeechPlaybackState) => void): () => void {
  stateListeners.add(listener);
  listener(getSpeechState());
  return () => {
    stateListeners.delete(listener);
  };
}

// Load voice settings from storage
export function loadVoiceSettings(): VoiceSettings {
  try {
    const raw = localStorage.getItem('studyhub_voice_settings');
    if (raw) {
      return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load voice settings:', e);
  }
  return DEFAULT_VOICE_SETTINGS;
}

// Save voice settings to storage
export function saveVoiceSettings(settings: Partial<VoiceSettings>): VoiceSettings {
  try {
    const current = loadVoiceSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('studyhub_voice_settings', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save voice settings:', e);
    return DEFAULT_VOICE_SETTINGS;
  }
}

// Pause active speech (both HTML Audio & Web Speech)
export function pauseSpeech(): void {
  if (activeAudioElement && !activeAudioElement.paused) {
    activeAudioElement.pause();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      isWebSpeechPaused = true;
    }
  }
  notifyStateChange();
}

// Resume paused speech
export function resumeSpeech(): void {
  if (activeAudioElement && activeAudioElement.paused && activeAudioElement.currentTime > 0) {
    activeAudioElement.play().catch((err) => console.warn('Resume audio failed:', err));
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.paused || isWebSpeechPaused) {
      window.speechSynthesis.resume();
      isWebSpeechPaused = false;
    }
  }
  notifyStateChange();
}

// Toggle between Pause and Resume
export function togglePauseSpeech(): void {
  const state = getSpeechState();
  if (state.isPaused) {
    resumeSpeech();
  } else if (state.isPlaying) {
    pauseSpeech();
  }
}

// Adjust playback rate on active speech
export function setSpeechRate(rate: number): void {
  currentRate = rate;
  if (activeAudioElement) {
    activeAudioElement.playbackRate = rate;
  }
  saveVoiceSettings({ voiceSpeed: rate });
  notifyStateChange();
}

// Adjust pitch
export function setSpeechPitch(pitch: number): void {
  currentPitch = pitch;
  saveVoiceSettings({ voicePitch: pitch });
  notifyStateChange();
}

// Adjust volume (0.0 to 1.0)
export function setSpeechVolume(volume: number): void {
  currentVolume = Math.max(0, Math.min(1, volume));
  if (activeAudioElement) {
    activeAudioElement.volume = currentVolume;
  }
  saveVoiceSettings({ voiceVolume: currentVolume });
  notifyStateChange();
}

// Select a specific system or AI voice
export function setSelectedVoiceURI(voiceURI: string): void {
  if (currentSelectedVoiceURI === voiceURI) return;
  currentSelectedVoiceURI = voiceURI;
  saveVoiceSettings({ selectedVoiceURI: voiceURI });
  notifyStateChange();

  // If currently playing, replay with new voice from the beginning
  if (currentSpeechText && (getSpeechState().isPlaying || getSpeechState().isPaused)) {
    restartSpeech();
  }
}

// Restart current speech from beginning
export function restartSpeech(): void {
  if (!currentSpeechText) return;
  const text = currentSpeechText;
  const lang = currentLangCode;
  const speed = currentRate;
  speakTextInLanguage(text, lang, lastOnStart, lastOnEnd, lastOnError, speed);
}

// Skip forward or back
export function skipSpeechSeconds(seconds: number): void {
  if (activeAudioElement) {
    activeAudioElement.currentTime = Math.max(0, Math.min(activeAudioElement.duration || 0, activeAudioElement.currentTime + seconds));
  }
}

// Stop any currently playing audio or speech
export function stopSpeech(): void {
  // 1. Invalidate any in-flight async operations
  currentSessionToken++;

  // 2. Abort active network requests
  if (inFlightAbortController) {
    try {
      inFlightAbortController.abort();
    } catch (e) {}
    inFlightAbortController = null;
  }

  // 3. Halt and reset active HTML5 Audio element
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
      activeAudioElement.load();
    } catch (e) {
      console.warn('Audio pause error:', e);
    }
    activeAudioElement = null;
  }

  // 4. Cancel all browser speech synthesis utterances
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    isWebSpeechPaused = false;
  }

  currentSpeechMode = 'idle';
  currentSpeechText = '';
  notifyStateChange();
}

// Set voice gender (1 Male voice & 1 Female voice)
export function setVoiceGender(gender: 'male' | 'female'): void {
  const isMale = gender === 'male';
  const newPitch = isMale ? 0.80 : 1.05;
  const newVoiceURI = isMale ? 'ai-neural-male-charon' : 'ai-neural-female-kore';
  
  saveVoiceSettings({ 
    voiceGender: gender, 
    voicePitch: newPitch,
    selectedVoiceURI: newVoiceURI 
  });
  currentPitch = newPitch;
  currentSelectedVoiceURI = newVoiceURI;
  notifyStateChange();

  if (currentSpeechText && (getSpeechState().isPlaying || getSpeechState().isPaused)) {
    restartSpeech();
  }
}

// 1-Tap Quick Presets for Voice
export function applyVoicePreset(preset: 'male_default' | 'female_default' | 'slow_tutor' | 'natural_pace' | 'quick_review'): void {
  let speed = 1.0;
  let pitch = 0.80;
  let gender: 'male' | 'female' = 'male';
  let voiceURI = 'ai-neural-male-charon';

  switch (preset) {
    case 'male_default':
      speed = 1.0;
      pitch = 0.80;
      gender = 'male';
      voiceURI = 'ai-neural-male-charon';
      break;
    case 'female_default':
      speed = 1.0;
      pitch = 1.05;
      gender = 'female';
      voiceURI = 'ai-neural-female-kore';
      break;
    case 'slow_tutor':
      speed = 0.85;
      pitch = 0.80;
      gender = 'male';
      voiceURI = 'ai-neural-male-charon';
      break;
    case 'natural_pace':
      speed = 1.0;
      pitch = 0.85;
      gender = 'male';
      voiceURI = 'ai-neural-male-charon';
      break;
    case 'quick_review':
      speed = 1.25;
      pitch = 0.85;
      gender = 'male';
      voiceURI = 'ai-neural-male-charon';
      break;
  }

  saveVoiceSettings({
    voiceSpeed: speed,
    voicePitch: pitch,
    voiceGender: gender,
    selectedVoiceURI: voiceURI,
  });

  currentRate = speed;
  currentPitch = pitch;
  currentSelectedVoiceURI = voiceURI;
  if (activeAudioElement) {
    activeAudioElement.playbackRate = speed;
  }
  notifyStateChange();

  if (currentSpeechText && (getSpeechState().isPlaying || getSpeechState().isPaused)) {
    restartSpeech();
  }
}

// Export / Download Speech Audio as WAV / MP3 file
export async function downloadSpeechAudio(
  text: string,
  langCode: string = 'af-ZA',
  filename: string = 'studyhub_audio_lesson'
): Promise<boolean> {
  const cleanText = text
    .replace(/#+/g, '')
    .replace(/\*+/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .trim();

  if (!cleanText) return false;

  const settings = loadVoiceSettings();
  const isAf = langCode.startsWith('af');

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        langCode,
        voiceName: settings.voiceGender === 'male' ? 'Puck' : 'Aoede',
        voiceGender: settings.voiceGender,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioUrl) {
        // Fetch audio blob and trigger instant browser download
        const audioRes = await fetch(data.audioUrl);
        const blob = await audioRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}_${isAf ? 'afrikaans' : 'lesson'}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
      }
    }
  } catch (e) {
    console.warn('Direct audio download failed:', e);
  }
  return false;
}

// Query all available voices and sort with Afrikaans & South African voices at the top
export function getAvailableSystemVoices(): FormattedVoiceOption[] {
  const options: FormattedVoiceOption[] = [
    {
      voiceURI: 'ai-neural-male-charon',
      name: 'Karel / Dawid — Afrikaans Nuwe Manlike KI-Stem (Charon HD Male ★ Verstek)',
      lang: 'af-ZA',
      isAfrikaans: true,
      isNeuralOrHQ: true,
      label: '🇿🇦 Karel / Dawid (Nuwe Diep Manlike KI-Stem ★ Verstek)',
    },
    {
      voiceURI: 'ai-neural-male-fenrir',
      name: 'Dawid Diep — Manlike Resonantie (Fenrir HD Male)',
      lang: 'af-ZA',
      isAfrikaans: true,
      isNeuralOrHQ: true,
      label: '🇿🇦 Fenrir / Dawid (Diep Manlike Afrikaanse Stem HD)',
    },
    {
      voiceURI: 'ai-neural-male-puck',
      name: 'Jan / Dawid — Helder Manlike Stem (Puck HD Male)',
      lang: 'af-ZA',
      isAfrikaans: true,
      isNeuralOrHQ: true,
      label: '🇿🇦 Jan / Dawid (Helder Manlike Stem HD)',
    },
    {
      voiceURI: 'ai-neural-female-kore',
      name: 'Sanet / Kore — Afrikaans Vroulike KI-Stem (Female AI Voice HD)',
      lang: 'af-ZA',
      isAfrikaans: true,
      isNeuralOrHQ: true,
      label: '🇿🇦 Sanet / Kore (Vroulike KI-Stem HD)',
    },
    {
      voiceURI: 'ai-neural-female-aoede',
      name: 'Elsa / Annelize — Afrikaans Vroulike KI-Stem (Melodic Female AI)',
      lang: 'af-ZA',
      isAfrikaans: true,
      isNeuralOrHQ: true,
      label: '🇿🇦 Elsa / Annelize (Helder Vroulike KI-Stem)',
    },
  ];

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return options;
  }

  const rawVoices = window.speechSynthesis.getVoices() || [];
  
  const parsedVoices: FormattedVoiceOption[] = rawVoices.map((v) => {
    const isAf = v.lang.toLowerCase().startsWith('af') || v.name.toLowerCase().includes('afrikaans');
    const isZA = v.lang.toLowerCase().includes('za') || v.name.toLowerCase().includes('south africa');
    const isHQ = v.name.toLowerCase().includes('natural') || 
                 v.name.toLowerCase().includes('neural') || 
                 v.name.toLowerCase().includes('google') ||
                 v.name.toLowerCase().includes('enhanced') ||
                 v.name.toLowerCase().includes('premium');

    let flag = '🌐';
    if (isAf || isZA) flag = '🇿🇦';
    else if (v.lang.startsWith('en-US')) flag = '🇺🇸';
    else if (v.lang.startsWith('en-GB')) flag = '🇬🇧';
    else if (v.lang.startsWith('nl')) flag = '🇳🇱';
    else if (v.lang.startsWith('de')) flag = '🇩🇪';
    else if (v.lang.startsWith('fr')) flag = '🇫🇷';
    else if (v.lang.startsWith('es')) flag = '🇪🇸';

    const qualityBadge = isHQ ? ' [HQ]' : '';
    const afBadge = isAf ? ' ★ [Afrikaans Ready]' : isZA ? ' [SA English]' : '';

    return {
      voiceURI: v.voiceURI || v.name,
      name: v.name,
      lang: v.lang,
      isAfrikaans: isAf,
      isNeuralOrHQ: isHQ,
      label: `${flag} ${v.name} (${v.lang})${afBadge}${qualityBadge}`,
      rawVoice: v,
    };
  });

  // Sort with Afrikaans FIRST, then South African, then High Quality, then remainder
  parsedVoices.sort((a, b) => {
    if (a.isAfrikaans && !b.isAfrikaans) return -1;
    if (!a.isAfrikaans && b.isAfrikaans) return 1;
    
    const aIsZA = a.lang.toLowerCase().includes('za');
    const bIsZA = b.lang.toLowerCase().includes('za');
    if (aIsZA && !bIsZA) return -1;
    if (!aIsZA && bIsZA) return 1;

    if (a.isNeuralOrHQ && !b.isNeuralOrHQ) return -1;
    if (!a.isNeuralOrHQ && b.isNeuralOrHQ) return 1;

    return a.name.localeCompare(b.name);
  });

  return [...options, ...parsedVoices];
}

// Subscribe to browser voice list population
export function subscribeVoicesList(callback: (voices: FormattedVoiceOption[]) => void): () => void {
  const update = () => {
    callback(getAvailableSystemVoices());
  };

  update();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = update;
  }

  return () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.onvoiceschanged === update) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    }
  };
}

// Speak text back in target language using High-Fidelity AI Voice Narration (/api/tts) with Web Speech fallback
export async function speakTextInLanguage(
  text: string, 
  langCode: string = 'af-ZA',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void,
  customSpeed?: number,
  customPitch?: number,
  customVoiceURI?: string
): Promise<void> {
  // Always stop prior speech and cancel pending requests
  stopSpeech();

  // Strip markdown formatting and normalize scientific/math expressions
  const cleanText = prepareAfrikaansSpokenText(text);

  if (!cleanText) return;

  const thisSession = ++currentSessionToken;
  const abortController = new AbortController();
  inFlightAbortController = abortController;

  lastOnStart = onStart;
  lastOnEnd = onEnd;
  lastOnError = onError;

  // Language Validation Step: ensure valid BCP-47 tag, defaulting to af-ZA
  const validatedLang = validateLanguageCode(langCode);

  const savedSettings = loadVoiceSettings();
  const speed = customSpeed || savedSettings.voiceSpeed || 1.0;
  const isMale = savedSettings.voiceGender === 'male';
  const defaultPitch = isMale ? 0.85 : 1.12;
  const pitch = customPitch || savedSettings.voicePitch || defaultPitch;
  const volume = Math.max(0.2, (savedSettings.voiceVolume !== undefined ? savedSettings.voiceVolume : 1.0));
  const voiceURI = customVoiceURI || savedSettings.selectedVoiceURI || '';

  currentRate = speed;
  currentPitch = pitch;
  currentVolume = volume;
  currentSelectedVoiceURI = voiceURI;
  currentSpeechText = cleanText;
  currentLangCode = validatedLang;

  const isNeuralAIVoice = !voiceURI || voiceURI.startsWith('ai-neural-');
  let selectedVoiceName = isMale ? 'Charon' : 'Kore';
  if (voiceURI === 'ai-neural-male-charon') selectedVoiceName = 'Charon';
  if (voiceURI === 'ai-neural-male-fenrir') selectedVoiceName = 'Fenrir';
  if (voiceURI === 'ai-neural-male-puck') selectedVoiceName = 'Puck';
  if (voiceURI === 'ai-neural-female-kore') selectedVoiceName = 'Kore';
  if (voiceURI === 'ai-neural-female-aoede') selectedVoiceName = 'Aoede';

  // If user selected a specific system voice (and not the AI Neural cloud voices)
  if (!isNeuralAIVoice && voiceURI) {
    fallbackWebSpeech(cleanText, validatedLang, speed, pitch, volume, voiceURI, thisSession, onStart, onEnd, onError);
    return;
  }

  currentSpeechMode = 'ai-audio';
  notifyStateChange();

  // 1. Try High-Fidelity AI Voice Narration API Endpoint (/api/tts)
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify({
        text: cleanText,
        langCode: validatedLang,
        voiceGender: isMale ? 'male' : 'female',
      }),
    });

    // Check if session was superseded during fetch
    if (thisSession !== currentSessionToken) return;

    if (res.ok) {
      const data = await res.json();
      if (thisSession !== currentSessionToken) return;

      if (data.audioUrl && typeof data.audioUrl === 'string' && data.audioUrl.trim().length > 0) {
        const audio = new Audio();
        if (!data.audioUrl.startsWith('data:')) {
          audio.crossOrigin = 'anonymous';
        }
        audio.src = data.audioUrl;
        
        // If server returned Google TTS (which is naturally female) and user selected Male,
        // we transpose pitch into authoritative deep male tone. If Female selected, preserve authentic crisp female pitch!
        const isServerGtts = data.isServerGttsFallback === true || (data.provider && (data.provider.includes('Stem') || data.provider.includes('Voice')));
        if (isMale && isServerGtts) {
          (audio as any).preservesPitch = false;
          (audio as any).mozPreservesPitch = false;
          (audio as any).webkitPreservesPitch = false;
          audio.playbackRate = Math.max(0.72, Math.min(0.92, speed * 0.82));
        } else {
          (audio as any).preservesPitch = true;
          (audio as any).mozPreservesPitch = true;
          (audio as any).webkitPreservesPitch = true;
          audio.playbackRate = speed;
        }
        audio.volume = Math.max(0.5, volume);
        activeAudioElement = audio;

        audio.onplay = () => {
          if (thisSession !== currentSessionToken) {
            try { audio.pause(); } catch (e) {}
            return;
          }
          notifyStateChange();
          onStart?.();
        };
        audio.onpause = () => {
          if (thisSession === currentSessionToken) {
            notifyStateChange();
          }
        };
        audio.onended = () => {
          if (thisSession === currentSessionToken) {
            activeAudioElement = null;
            currentSpeechMode = 'idle';
            notifyStateChange();
            onEnd?.();
          }
        };
        audio.onerror = (e) => {
          if (thisSession !== currentSessionToken) return;
          console.warn('AI Voice Audio play error, attempting fallback:', e);
          fallbackWebSpeech(cleanText, validatedLang, speed, pitch, volume, voiceURI, thisSession, onStart, onEnd, onError);
        };

        try {
          await audio.play();
          return;
        } catch (playErr) {
          console.warn('Direct audio.play() blocked or failed, attempting Web Speech fallback:', playErr);
          fallbackWebSpeech(cleanText, validatedLang, speed, pitch, volume, voiceURI, thisSession, onStart, onEnd, onError);
          return;
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError' || thisSession !== currentSessionToken) {
      return;
    }
    console.warn('AI Voice API call failed, attempting browser Web Speech fallback:', err);
  }

  if (thisSession !== currentSessionToken) return;

  // 2. Fallback to Browser Web Speech API with explicit Afrikaans voice selection
  fallbackWebSpeech(cleanText, validatedLang, speed, pitch, volume, voiceURI, thisSession, onStart, onEnd, onError);
}

function fallbackWebSpeech(
  cleanText: string,
  langCode: string,
  speed: number,
  pitch: number,
  volume: number,
  voiceURI: string,
  sessionToken: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (sessionToken !== currentSessionToken) return;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported');
    currentSpeechMode = 'idle';
    notifyStateChange();
    return;
  }

  // Validation step: ensure valid language code (defaulting to af-ZA for Afrikaans)
  const validatedLang = validateLanguageCode(langCode);
  const savedSettings = loadVoiceSettings();
  const isMale = savedSettings.voiceGender === 'male';

  // Ensure any paused synthesis is resumed and cancel lingering utterances
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
  } catch (e) {}

  isWebSpeechPaused = false;
  currentSpeechMode = 'web-speech';
  notifyStateChange();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = validatedLang;
  utterance.rate = Math.max(0.7, Math.min(1.6, speed));

  const voices = window.speechSynthesis.getVoices() || [];
  let chosenVoice: SpeechSynthesisVoice | undefined;

  // If user passed a specific voiceURI
  if (voiceURI && !voiceURI.startsWith('ai-neural-')) {
    chosenVoice = voices.find((v) => v.voiceURI === voiceURI || v.name === voiceURI);
  }

  // If language is Afrikaans (or starts with af), EXPLICITLY find matching Afrikaans voice
  if (!chosenVoice && validatedLang.toLowerCase().startsWith('af')) {
    chosenVoice = findAfrikaansBrowserVoice(savedSettings.voiceGender || 'male');
  }

  // Non-Afrikaans matching
  if (!chosenVoice && !validatedLang.toLowerCase().startsWith('af')) {
    chosenVoice = voices.find((v) => v.lang.toLowerCase() === validatedLang.toLowerCase());
    if (!chosenVoice) {
      chosenVoice = voices.find((v) => v.lang.toLowerCase().startsWith(validatedLang.split('-')[0].toLowerCase()));
    }
  }

  // Apply voice and calibrate pitch for gender authenticity
  if (chosenVoice) {
    utterance.voice = chosenVoice;
    const isVoiceNaturallyFemale = /google\s*afrikaans|elsa|female|vrou|zira|samantha|victoria|karen|anri|sanet|afrikaans|af-za/i.test(chosenVoice.name);
    if (isMale) {
      // Scale down pitch into a distinct, authentic deep masculine resonance
      utterance.pitch = isVoiceNaturallyFemale ? 0.58 : 0.65;
      utterance.rate = Math.max(0.7, Math.min(1.3, speed * 0.90));
    } else {
      // Clear, authentic feminine vocal range
      utterance.pitch = isVoiceNaturallyFemale ? 1.05 : 1.15;
      utterance.rate = Math.max(0.75, Math.min(1.4, speed));
    }
  } else {
    // If no specific voice, set language tag and pitch according to requested gender
    if (validatedLang.startsWith('af')) {
      utterance.lang = 'af-ZA';
    }
    utterance.pitch = isMale ? 0.58 : 1.12;
    utterance.rate = isMale ? Math.max(0.7, speed * 0.90) : speed;
  }

  utterance.volume = Math.max(0.5, Math.min(1.0, volume || 1.0));

  utterance.onstart = () => {
    if (sessionToken !== currentSessionToken) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      return;
    }
    notifyStateChange();
    onStart?.();
  };

  utterance.onend = () => {
    if (sessionToken === currentSessionToken) {
      currentSpeechMode = 'idle';
      notifyStateChange();
      onEnd?.();
    }
  };

  utterance.onerror = (e) => {
    if (sessionToken !== currentSessionToken) return;
    console.warn('Web Speech Synthesis error:', e);
    currentSpeechMode = 'idle';
    notifyStateChange();
    onError?.(e);
  };

  // Small timeout to allow cancel to flush cleanly in WebKit/Blink
  setTimeout(() => {
    if (sessionToken === currentSessionToken) {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('window.speechSynthesis.speak exception:', err);
        currentSpeechMode = 'idle';
        notifyStateChange();
        onError?.(err);
      }
    }
  }, 50);
}

// Helper to create SpeechRecognition configured for target language with robust continuous dictation
export function createMultilingualSpeechRecognition(
  langCode: string = 'af-ZA',
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: string) => void,
  onEnd?: () => void
): any | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError?.('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    return null;
  }

  const validatedLang = validateLanguageCode(langCode);
  const recognition = new SpeechRecognition();
  recognition.continuous = true; // Continues listening until explicitly stopped
  recognition.interimResults = true;
  recognition.lang = validatedLang;

  let sessionFinalText = '';

  recognition.onresult = (event: any) => {
    let interimText = '';
    let currentFinalAcc = '';

    for (let i = 0; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        currentFinalAcc += result[0].transcript + ' ';
      } else {
        interimText += result[0].transcript;
      }
    }

    sessionFinalText = currentFinalAcc;
    const combined = (sessionFinalText + interimText).replace(/\s+/g, ' ').trim();
    if (combined) {
      const isLatestFinal = event.results[event.results.length - 1]?.isFinal || false;
      onResult(combined, isLatestFinal);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Multilingual speech recognition status:', event.error);
    // 'no-speech' is a normal silence timeout; do not terminate dictation session
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      onError?.(event.error);
    }
  };

  recognition.onend = () => {
    onEnd?.();
  };

  return recognition;
}

