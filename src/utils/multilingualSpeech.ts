// src/utils/multilingualSpeech.ts
// StudyHub device/browser Text-to-Speech engine.
// No Azure. No paid speech API. No external speech server.

export type SupportedLanguage = 'af' | 'en' | 'es';
export type SupportedLocale = 'af-ZA' | 'en-US' | 'es-ES';
export type VoiceGender = 'male' | 'female';

export interface LanguageConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

export interface FormattedVoiceOption {
  voiceURI: string;
  name: string;
  label: string;
  lang: string;
  localService: boolean;
  gender: VoiceGender;
  isAfrikaans: boolean;
}

export interface SpeechPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  playbackRate: number;
  pitch: number;
  volume: number;
  selectedVoiceURI: string;
  voiceGender: VoiceGender;
  langCode: SupportedLocale;
  detectedAfrikaansVoiceName?: string;
}

export interface VoiceSettings {
  preferredLanguage: string;
  voiceGender: VoiceGender;
  voiceSpeed: number;
  autoReadAiResponses: boolean;
  voicePitch: number;
  voiceVolume: number;
  selectedVoiceURI?: string;
  forceAfrikaansVoice?: boolean;
}

export interface SpeechRequest {
  text: string;
  language?: string;
  gender?: VoiceGender;
  speed?: number;
  volume?: number;
  pitch?: number;
  voiceURI?: string;
}

export interface SpeechResponse {
  audioUrl?: string;
  audioBase64?: string;
  voice: string;
  locale: string;
  mimeType?: string;
  success?: boolean;
}

export const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'af-ZA',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

export const SUPPORTED_LANGUAGES = LANGUAGES;

export const GENDER_VOICES = [
  {
    gender: 'male' as const,
    name: 'Manlik',
    role: 'Afrikaanse Manlike Stem',
    avatar: '👨',
  },
  {
    gender: 'female' as const,
    name: 'Vroulik',
    role: 'Afrikaanse Vroulike Stem',
    avatar: '👩',
  },
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  preferredLanguage: 'af-ZA',
  voiceGender: 'male',
  voiceSpeed: 1,
  autoReadAiResponses: true,
  voicePitch: 1,
  voiceVolume: 1,
  forceAfrikaansVoice: true,
};

const STORAGE_KEY = 'studyhub_voice_settings';

let speechState: SpeechPlaybackState = {
  isPlaying: false,
  isPaused: false,
  currentText: '',
  playbackRate: 1,
  pitch: 1,
  volume: 1,
  selectedVoiceURI: '',
  voiceGender: 'male',
  langCode: 'af-ZA',
};

const stateListeners = new Set<
  (state: SpeechPlaybackState) => void
>();

const voicesListeners = new Set<
  (voices: FormattedVoiceOption[]) => void
>();

let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechGeneration = 0;

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.max(min, Math.min(max, value));
}

function safeSpeed(value?: number): number {
  return clamp(
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : 1,
    0.5,
    2,
  );
}

function safeVolume(value?: number): number {
  return clamp(
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : 1,
    0,
    1,
  );
}

function cleanSpeechText(text: string): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function emitState(): void {
  const copy = { ...speechState };

  stateListeners.forEach((listener) => {
    try {
      listener(copy);
    } catch {
      // Never allow a listener error to break speech.
    }
  });
}

function emitVoices(): void {
  const voices = getAvailableSystemVoices();

  voicesListeners.forEach((listener) => {
    try {
      listener(voices);
    } catch {
      // Ignore listener errors.
    }
  });
}

export function normalizeLanguage(
  language?: string,
): SupportedLanguage {
  const value = String(language || '')
    .toLowerCase()
    .trim();

  if (
    value === 'af' ||
    value.startsWith('af-') ||
    value.includes('afrikaans')
  ) {
    return 'af';
  }

  if (
    value === 'es' ||
    value.startsWith('es-') ||
    value.includes('spanish') ||
    value.includes('español')
  ) {
    return 'es';
  }

  return 'en';
}

export function getSpeechLanguage(
  language?: string,
): SupportedLocale {
  switch (normalizeLanguage(language)) {
    case 'af':
      return 'af-ZA';

    case 'es':
      return 'es-ES';

    case 'en':
    default:
      return 'en-US';
  }
}

export function validateLanguageCode(
  language?: string,
): SupportedLocale {
  return getSpeechLanguage(language);
}

export function getLocaleForLanguage(
  language?: string,
): SupportedLocale {
  return getSpeechLanguage(language);
}

export function isAfrikaans(
  language?: string,
): boolean {
  return normalizeLanguage(language) === 'af';
}

function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  ) {
    return [];
  }

  try {
    return window.speechSynthesis.getVoices() || [];
  } catch {
    return [];
  }
}

function getVoiceLanguage(
  voice: SpeechSynthesisVoice,
): string {
  return String(voice.lang || '').toLowerCase();
}

function isVoiceForLocale(
  voice: SpeechSynthesisVoice,
  locale: SupportedLocale,
): boolean {
  const lang = getVoiceLanguage(voice);
  const target = locale.toLowerCase();

  if (lang === target) {
    return true;
  }

  return lang.startsWith(
    `${target.substring(0, 2)}-`,
  );
}

function guessGender(
  voice: SpeechSynthesisVoice,
): VoiceGender {
  const value =
    `${voice.name} ${voice.voiceURI}`.toLowerCase();

  const maleWords = [
    'male',
    'man',
    'guy',
    'david',
    'daniel',
    'george',
    'mark',
    'james',
    'john',
    'alex',
    'tom',
    'willem',
    'thomas',
    'oliver',
  ];

  const femaleWords = [
    'female',
    'woman',
    'girl',
    'jenny',
    'samantha',
    'susan',
    'victoria',
    'zira',
    'karen',
    'sarah',
    'emma',
    'ava',
    'anna',
    'adri',
  ];

  if (
    maleWords.some((word) =>
      value.includes(word),
    )
  ) {
    return 'male';
  }

  if (
    femaleWords.some((word) =>
      value.includes(word),
    )
  ) {
    return 'female';
  }

  return 'female';
}

function formatBrowserVoices(): FormattedVoiceOption[] {
  return getBrowserVoices().map((voice) => ({
    voiceURI:
      voice.voiceURI || voice.name,
    name: voice.name,
    label: voice.name,
    lang: voice.lang,
    localService: voice.localService,
    gender: guessGender(voice),
    isAfrikaans:
      getVoiceLanguage(voice).startsWith('af'),
  }));
}

export function getAvailableSystemVoices():
  FormattedVoiceOption[] {
  return formatBrowserVoices();
}

export function subscribeVoicesList(
  listener: (
    voices: FormattedVoiceOption[],
  ) => void,
): () => void {
  voicesListeners.add(listener);

  try {
    listener(getAvailableSystemVoices());
  } catch {
    // Ignore.
  }

  if (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window
  ) {
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      emitVoices,
    );
  }

  return () => {
    voicesListeners.delete(listener);

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        emitVoices,
      );
    }
  };
}

export function findAfrikaansBrowserVoice(
  gender?: VoiceGender,
): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices().filter(
    (voice) =>
      getVoiceLanguage(voice).startsWith('af'),
  );

  if (!voices.length) {
    return null;
  }

  if (gender) {
    const matching = voices.find(
      (voice) =>
        guessGender(voice) === gender,
    );

    if (matching) {
      return matching;
    }
  }

  return voices[0];
}

function findBestVoice(
  locale: SupportedLocale,
  gender: VoiceGender,
  selectedVoiceURI?: string,
): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices();

  if (!voices.length) {
    return null;
  }

  if (selectedVoiceURI) {
    const selected = voices.find(
      (voice) =>
        voice.voiceURI === selectedVoiceURI ||
        voice.name === selectedVoiceURI,
    );

    if (
      selected &&
      isVoiceForLocale(selected, locale)
    ) {
      return selected;
    }
  }

  const localeVoices = voices.filter(
    (voice) =>
      isVoiceForLocale(voice, locale),
  );

  if (!localeVoices.length) {
    return null;
  }

  const genderMatch = localeVoices.find(
    (voice) =>
      guessGender(voice) === gender,
  );

  return genderMatch || localeVoices[0];
}

function getCurrentVoice(
  language: SupportedLocale,
  gender: VoiceGender,
  selectedVoiceURI?: string,
): SpeechSynthesisVoice | null {
  // Afrikaans is strict.
  // Never replace Afrikaans with English.
  if (language === 'af-ZA') {
    return findAfrikaansBrowserVoice(
      gender,
    );
  }

  return findBestVoice(
    language,
    gender,
    selectedVoiceURI,
  );
}

export function getAfrikaansVoice(
  gender: VoiceGender = 'male',
): string {
  const voice =
    findAfrikaansBrowserVoice(gender);

  return (
    voice?.voiceURI ||
    voice?.name ||
    ''
  );
}

export function getVoiceForLanguage(
  language?: string,
  gender: VoiceGender = 'female',
): {
  locale: string;
  voice: string;
} {
  const locale =
    getSpeechLanguage(language);

  const voice = getCurrentVoice(
    locale,
    gender,
  );

  return {
    locale,
    voice:
      voice?.voiceURI ||
      voice?.name ||
      '',
  };
}

export function getSelectedVoice(
  language?: string,
  gender: VoiceGender = 'female',
  selectedVoiceURI?: string,
): SpeechSynthesisVoice | null {
  const locale =
    getSpeechLanguage(language);

  return getCurrentVoice(
    locale,
    gender,
    selectedVoiceURI,
  );
}

export function getSupportedVoiceNames(): string[] {
  return getAvailableSystemVoices().map(
    (voice) => voice.name,
  );
}

export function getSpeechState():
  SpeechPlaybackState {
  return {
    ...speechState,
  };
}

export function subscribeSpeechState(
  listener: (
    state: SpeechPlaybackState,
  ) => void,
): () => void {
  stateListeners.add(listener);

  try {
    listener({
      ...speechState,
    });
  } catch {
    // Ignore.
  }

  return () => {
    stateListeners.delete(listener);
  };
    }
export function loadVoiceSettings():
  VoiceSettings {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_VOICE_SETTINGS,
    };
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!stored) {
      return {
        ...DEFAULT_VOICE_SETTINGS,
      };
    }

    const parsed = JSON.parse(stored);

    const language =
      getSpeechLanguage(
        parsed.preferredLanguage ||
          DEFAULT_VOICE_SETTINGS.preferredLanguage,
      );

    const gender: VoiceGender =
      parsed.voiceGender === 'female'
        ? 'female'
        : 'male';

    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...parsed,
      preferredLanguage: language,
      voiceGender: gender,
      voiceSpeed: safeSpeed(
        parsed.voiceSpeed,
      ),
      voiceVolume: safeVolume(
        parsed.voiceVolume,
      ),
      voicePitch: 1,
      forceAfrikaansVoice: true,
    };
  } catch {
    return {
      ...DEFAULT_VOICE_SETTINGS,
    };
  }
}

// IMPORTANT:
// SettingsModal.tsx imports this function.
export function saveVoiceSettings(
  changes: Partial<VoiceSettings>,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current =
      loadVoiceSettings();

    const updated: VoiceSettings = {
      ...current,
      ...changes,
      preferredLanguage:
        getSpeechLanguage(
          changes.preferredLanguage ??
            current.preferredLanguage,
        ),
      voiceGender:
        changes.voiceGender === 'female'
          ? 'female'
          : changes.voiceGender === 'male'
            ? 'male'
            : current.voiceGender,
      voiceSpeed: safeSpeed(
        changes.voiceSpeed ??
          current.voiceSpeed,
      ),
      voiceVolume: safeVolume(
        changes.voiceVolume ??
          current.voiceVolume,
      ),

      // Pitch stays neutral.
      voicePitch: 1,

      // Never allow Afrikaans to fall back
      // to another language.
      forceAfrikaansVoice: true,
    };

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.error(
      'Unable to save voice settings:',
      error,
    );
  }
}

function updateState(
  changes: Partial<SpeechPlaybackState>,
): void {
  speechState = {
    ...speechState,
    ...changes,
  };

  emitState();
}

function getSettings(): VoiceSettings {
  return loadVoiceSettings();
}

function saveAndApplySettings(
  changes: Partial<VoiceSettings>,
): VoiceSettings {
  const settings: VoiceSettings = {
    ...getSettings(),
    ...changes,
    voicePitch: 1,
    forceAfrikaansVoice: true,
  };

  saveVoiceSettings(settings);

  return settings;
}

export function setVoiceGender(
  gender: VoiceGender,
): void {
  const settings =
    saveAndApplySettings({
      voiceGender: gender,
    });

  const locale =
    getSpeechLanguage(
      settings.preferredLanguage,
    );

  const voice = getCurrentVoice(
    locale,
    gender,
    settings.selectedVoiceURI,
  );

  updateState({
    voiceGender: gender,
    selectedVoiceURI:
      voice?.voiceURI ||
      voice?.name ||
      '',
    detectedAfrikaansVoiceName:
      locale === 'af-ZA'
        ? voice?.name
        : undefined,
  });

  if (speechState.isPlaying) {
    void restartSpeech();
  }
}

export function setSelectedVoiceURI(
  voiceURI: string,
): void {
  const settings =
    getSettings();

  const locale =
    getSpeechLanguage(
      settings.preferredLanguage,
    );

  const voices =
    getBrowserVoices();

  const selected = voices.find(
    (voice) =>
      voice.voiceURI === voiceURI ||
      voice.name === voiceURI,
  );

  // Afrikaans can only use an Afrikaans voice.
  if (
    locale === 'af-ZA' &&
    (!selected ||
      !getVoiceLanguage(
        selected,
      ).startsWith('af'))
  ) {
    return;
  }

  saveAndApplySettings({
    selectedVoiceURI: voiceURI,
  });

  updateState({
    selectedVoiceURI: voiceURI,
  });

  if (speechState.isPlaying) {
    void restartSpeech();
  }
}

export function setSpeechRate(
  rate: number,
): void {
  const safe = safeSpeed(rate);

  saveAndApplySettings({
    voiceSpeed: safe,
  });

  updateState({
    playbackRate: safe,
  });
}

export function setSpeechVolume(
  volume: number,
): void {
  const safe = safeVolume(volume);

  saveAndApplySettings({
    voiceVolume: safe,
  });

  updateState({
    volume: safe,
  });
}

export function setSpeechPitch(
  _pitch: number,
): void {
  // Pitch controls are intentionally disabled.
  saveAndApplySettings({
    voicePitch: 1,
  });

  updateState({
    pitch: 1,
  });
}

export function applyVoicePreset(
  preset:
    | 'male'
    | 'female'
    | 'normal'
    | string,
): void {
  if (
    preset === 'male' ||
    preset === 'female'
  ) {
    setVoiceGender(preset);
    return;
  }

  saveAndApplySettings({
    voicePitch: 1,
  });

  updateState({
    pitch: 1,
  });
}

export function validateVoiceSelection(
  language: string,
  gender: VoiceGender,
  selectedVoice?: string,
): string {
  const locale =
    getSpeechLanguage(language);

  const voice =
    getCurrentVoice(
      locale,
      gender,
      selectedVoice,
    );

  return (
    voice?.voiceURI ||
    voice?.name ||
    ''
  );
}

export async function synthesizeSpeech(
  request: SpeechRequest,
): Promise<SpeechResponse> {
  const text =
    cleanSpeechText(request.text);

  if (!text) {
    throw new Error(
      'No text was supplied for speech synthesis.',
    );
  }

  const locale =
    getSpeechLanguage(
      request.language,
    );

  const gender: VoiceGender =
    request.gender === 'female'
      ? 'female'
      : 'male';

  const voice =
    getCurrentVoice(
      locale,
      gender,
      request.voiceURI,
    );

  if (!voice) {
    if (locale === 'af-ZA') {
      throw new Error(
        'Geen Afrikaanse stem is op hierdie toestel geïnstalleer nie. Installeer of aktiveer ’n Afrikaans TTS-stem in Android se Teks-na-spraak instellings.',
      );
    }

    throw new Error(
      `No ${locale} text-to-speech voice is available on this device.`,
    );
  }

  return {
    success: true,
    voice:
      voice.voiceURI ||
      voice.name,
    locale,
    mimeType:
      'application/x-device-tts',
  };
}

export async function speak(
  text: string,
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  const cleanText =
    cleanSpeechText(text);

  if (!cleanText) {
    return;
  }

  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  ) {
    throw new Error(
      'Text-to-speech is not available on this device.',
    );
  }

  stopSpeech();

  const myGeneration =
    speechGeneration;

  const merged: VoiceSettings = {
    ...getSettings(),
    ...settings,
  };

  const locale =
    getSpeechLanguage(
      merged.preferredLanguage,
    );

  const gender: VoiceGender =
    merged.voiceGender === 'female'
      ? 'female'
      : 'male';

  const voice =
    getCurrentVoice(
      locale,
      gender,
      merged.selectedVoiceURI,
    );

  if (!voice) {
    if (locale === 'af-ZA') {
      throw new Error(
        'Geen Afrikaanse TTS-stem is op hierdie toestel beskikbaar nie. Installeer of aktiveer ’n Afrikaans TTS-stem in Android se Teks-na-spraak instellings.',
      );
    }

    throw new Error(
      `No ${locale} TTS voice is available on this device.`,
    );
  }

  const utterance =
    new SpeechSynthesisUtterance(
      cleanText,
    );

  utterance.lang = locale;
  utterance.voice = voice;
  utterance.rate = safeSpeed(
    merged.voiceSpeed,
  );
  utterance.volume = safeVolume(
    merged.voiceVolume,
  );

  // Always neutral.
  utterance.pitch = 1;

  currentUtterance =
    utterance;

  updateState({
    isPlaying: true,
    isPaused: false,
    currentText: cleanText,
    playbackRate:
      utterance.rate,
    pitch: 1,
    volume:
      utterance.volume,
    selectedVoiceURI:
      voice.voiceURI ||
      voice.name,
    voiceGender: gender,
    langCode: locale,
    detectedAfrikaansVoiceName:
      locale === 'af-ZA'
        ? voice.name
        : undefined,
  });

  await new Promise<void>(
    (resolve, reject) => {
      utterance.onstart = () => {
        if (
          myGeneration !==
          speechGeneration
        ) {
          return;
        }

        updateState({
          isPlaying: true,
          isPaused: false,
        });
      };

      utterance.onpause = () => {
        if (
          myGeneration !==
          speechGeneration
        ) {
          return;
        }

        updateState({
          isPlaying: true,
          isPaused: true,
        });
      };

      utterance.onresume = () => {
        if (
          myGeneration !==
          speechGeneration
        ) {
          return;
        }

        updateState({
          isPlaying: true,
          isPaused: false,
        });
      };

      utterance.onend = () => {
        if (
          currentUtterance ===
          utterance
        ) {
          currentUtterance =
            null;
        }

        if (
          myGeneration ===
          speechGeneration
        ) {
          updateState({
            isPlaying: false,
            isPaused: false,
          });
        }

        resolve();
      };

      utterance.onerror = (
        event,
      ) => {
        if (
          currentUtterance ===
          utterance
        ) {
          currentUtterance =
            null;
        }

        if (
          myGeneration ===
          speechGeneration
        ) {
          updateState({
            isPlaying: false,
            isPaused: false,
          });
        }

        if (
          event.error ===
          'canceled'
        ) {
          resolve();
          return;
        }

        reject(
          new Error(
            `Text-to-speech error: ${
              event.error ||
              'unknown error'
            }`,
          ),
        );
      };

      try {
        window.speechSynthesis.speak(
          utterance,
        );
      } catch (error) {
        reject(error);
      }
    },
  );
}

export async function speakAfrikaans(
  text: string,
  gender: VoiceGender = 'male',
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  return speak(text, {
    ...settings,
    preferredLanguage: 'af-ZA',
    voiceGender: gender,
    forceAfrikaansVoice: true,
  });
}

// Compatibility function used by NotesSummarizerTab.
export function speakTextInLanguage(
  text: string,
  language: string = 'af-ZA',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (
    error?: unknown,
  ) => void,
): void {
  onStart?.();

  speak(text, {
    preferredLanguage: language,
  })
    .then(() => {
      onEnd?.();
    })
    .catch((error) => {
      console.error(
        'Text-to-speech error:',
        error,
      );

      onError?.(error);
      onEnd?.();
    });
}

export function togglePauseSpeech(): void {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  ) {
    return;
  }

  try {
    if (
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();

      updateState({
        isPlaying: true,
        isPaused: false,
      });

      return;
    }

    if (
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.pause();

      updateState({
        isPlaying: true,
        isPaused: true,
      });
    }
  } catch {
    // Ignore pause/resume errors.
  }
}

export async function restartSpeech():
  Promise<void> {
  const text =
    speechState.currentText;

  if (!text) {
    return;
  }

  await speak(
    text,
    loadVoiceSettings(),
  );
}

export function stopSpeech(): void {
  speechGeneration += 1;

  if (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window
  ) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore.
    }
  }

  currentUtterance = null;

  updateState({
    isPlaying: false,
    isPaused: false,
  });
}

export async function downloadSpeechAudio(
  _text: string,
  _language?: string,
  _filename?: string,
): Promise<void> {
  // Browser/device SpeechSynthesis does not
  // expose generated audio as an MP3/WAV file.
  return;
}

export function initializeSpeechVoices(): void {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  ) {
    return;
  }

  try {
    window.speechSynthesis.getVoices();

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      emitVoices,
    );
  } catch {
    // Ignore.
  }
}

initializeSpeechVoices();

export default {
  LANGUAGES,
  SUPPORTED_LANGUAGES,
  GENDER_VOICES,
  DEFAULT_VOICE_SETTINGS,

  normalizeLanguage,
  getSpeechLanguage,
  getLocaleForLanguage,
  validateLanguageCode,
  isAfrikaans,

  getAfrikaansVoice,
  getVoiceForLanguage,
  getSelectedVoice,
  getAvailableSystemVoices,
  findAfrikaansBrowserVoice,
  getSupportedVoiceNames,

  getSpeechState,
  subscribeSpeechState,
  subscribeVoicesList,

  loadVoiceSettings,
  saveVoiceSettings,
  validateVoiceSelection,

  synthesizeSpeech,
  speak,
  speakAfrikaans,
  speakTextInLanguage,

  stopSpeech,
  togglePauseSpeech,
  restartSpeech,

  setSpeechRate,
  setSpeechVolume,
  setSpeechPitch,
  setVoiceGender,
  setSelectedVoiceURI,
  applyVoicePreset,

  downloadSpeechAudio,
};
