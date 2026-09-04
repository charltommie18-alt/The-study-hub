// src/utils/multilingualSpeech.ts
// StudyHub Multilingual Voice Engine
// Device / Browser Text-to-Speech only.
// No Azure, no paid speech API, no external speech server.
//
// Languages:
// English    = en-US
// Afrikaans  = af-ZA
// Spanish    = es-ES
//
// Afrikaans NEVER silently falls back to English.

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

const voiceListeners = new Set<
  (voices: FormattedVoiceOption[]) => void
>();

let currentUtterance:
  SpeechSynthesisUtterance | null = null;

let speechGeneration = 0;

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.max(
    min,
    Math.min(max, value),
  );
}

function safeSpeed(
  value?: number,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return 1;
  }

  return clamp(value, 0.5, 2);
}

function safeVolume(
  value?: number,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return 1;
  }

  return clamp(value, 0, 1);
}

function cleanSpeechText(
  text: string,
): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSpeechSynthesis():
  SpeechSynthesis | null {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window)
  ) {
    return null;
  }

  return window.speechSynthesis;
}

function emitState(): void {
  const state = {
    ...speechState,
  };

  stateListeners.forEach(
    (listener) => {
      try {
        listener(state);
      } catch {
        // Ignore listener errors.
      }
    },
  );
}

function emitVoices(): void {
  const voices =
    getAvailableSystemVoices();

  voiceListeners.forEach(
    (listener) => {
      try {
        listener(voices);
      } catch {
        // Ignore listener errors.
      }
    },
  );
}

export function normalizeLanguage(
  language?: string,
): SupportedLanguage {
  const value = String(
    language || '',
  )
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
  switch (
    normalizeLanguage(language)
  ) {
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
  return (
    normalizeLanguage(language) ===
    'af'
  );
}

export function getLanguageConfig(
  language?: string,
): LanguageConfig | undefined {
  const locale =
    getSpeechLanguage(language);

  return LANGUAGES.find(
    (item) =>
      item.code === locale,
  );
}

function getBrowserVoices():
  SpeechSynthesisVoice[] {
  const synthesis =
    getSpeechSynthesis();

  if (!synthesis) {
    return [];
  }

  try {
    return synthesis.getVoices() || [];
  } catch {
    return [];
  }
}

function getVoiceLanguage(
  voice: SpeechSynthesisVoice,
): string {
  return String(
    voice.lang || '',
  ).toLowerCase();
}

function isVoiceForLocale(
  voice: SpeechSynthesisVoice,
  locale: SupportedLocale,
): boolean {
  const voiceLanguage =
    getVoiceLanguage(voice);

  const target =
    locale.toLowerCase();

  if (
    voiceLanguage === target
  ) {
    return true;
  }

  return voiceLanguage.startsWith(
    `${target.substring(0, 2)}-`,
  );
}

function guessGender(
  voice: SpeechSynthesisVoice,
): VoiceGender {
  const value =
    `${voice.name} ${voice.voiceURI}`
      .toLowerCase();

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
    maleWords.some(
      (word) =>
        value.includes(word),
    )
  ) {
    return 'male';
  }

  if (
    femaleWords.some(
      (word) =>
        value.includes(word),
    )
  ) {
    return 'female';
  }

  return 'female';
}

function formatBrowserVoices():
  FormattedVoiceOption[] {
  return getBrowserVoices().map(
    (voice) => ({
      voiceURI:
        voice.voiceURI ||
        voice.name,
      name: voice.name,
      label: voice.name,
      lang: voice.lang,
      localService:
        voice.localService,
      gender: guessGender(voice),
      isAfrikaans:
        getVoiceLanguage(
          voice,
        ).startsWith('af'),
    }),
  );
}

export function getAvailableSystemVoices():
  FormattedVoiceOption[] {
  return formatBrowserVoices();
}

export function getSupportedVoiceNames():
  string[] {
  return getAvailableSystemVoices().map(
    (voice) => voice.name,
  );
}

export function subscribeVoicesList(
  listener: (
    voices: FormattedVoiceOption[],
  ) => void,
): () => void {
  voiceListeners.add(listener);

  try {
    listener(
      getAvailableSystemVoices(),
    );
  } catch {
    // Ignore.
  }

  const synthesis =
    getSpeechSynthesis();

  if (synthesis) {
    synthesis.addEventListener(
      'voiceschanged',
      emitVoices,
    );
  }

  return () => {
    voiceListeners.delete(
      listener,
    );

    if (synthesis) {
      synthesis.removeEventListener(
        'voiceschanged',
        emitVoices,
      );
    }
  };
}

export function findAfrikaansBrowserVoice(
  gender?: VoiceGender,
): SpeechSynthesisVoice | null {
  const voices =
    getBrowserVoices().filter(
      (voice) =>
        getVoiceLanguage(
          voice,
        ).startsWith('af'),
    );

  if (!voices.length) {
    return null;
  }

  if (gender) {
    const matching =
      voices.find(
        (voice) =>
          guessGender(voice) ===
          gender,
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
  const voices =
    getBrowserVoices();

  if (!voices.length) {
    return null;
  }

  if (selectedVoiceURI) {
    const selected =
      voices.find(
        (voice) =>
          voice.voiceURI ===
            selectedVoiceURI ||
          voice.name ===
            selectedVoiceURI,
      );

    if (
      selected &&
      isVoiceForLocale(
        selected,
        locale,
      )
    ) {
      return selected;
    }
  }

  const matching =
    voices.filter(
      (voice) =>
        isVoiceForLocale(
          voice,
          locale,
        ),
    );

  if (!matching.length) {
    return null;
  }

  const genderMatch =
    matching.find(
      (voice) =>
        guessGender(voice) ===
        gender,
    );

  return (
    genderMatch ||
    matching[0]
  );
}

function getCurrentVoice(
  locale: SupportedLocale,
  gender: VoiceGender,
  selectedVoiceURI?: string,
): SpeechSynthesisVoice | null {
  // IMPORTANT:
  // Afrikaans is strict.
  // Never use an English voice for Afrikaans.
  if (locale === 'af-ZA') {
    return findAfrikaansBrowserVoice(
      gender,
    );
  }

  return findBestVoice(
    locale,
    gender,
    selectedVoiceURI,
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

  const voice =
    getCurrentVoice(
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

export function getAfrikaansVoice(
  gender: VoiceGender = 'male',
): string {
  const voice =
    findAfrikaansBrowserVoice(
      gender,
    );

  return (
    voice?.voiceURI ||
    voice?.name ||
    ''
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
    stateListeners.delete(
      listener,
    );
  };
}
export function loadVoiceSettings():
  VoiceSettings {
  if (
    typeof window === 'undefined'
  ) {
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

    const parsed =
      JSON.parse(stored);

    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...parsed,
      preferredLanguage:
        getSpeechLanguage(
          parsed.preferredLanguage,
        ),
      voiceGender:
        parsed.voiceGender ===
        'female'
          ? 'female'
          : 'male',
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

// Compatibility export required by
// SettingsModal.tsx.
export function saveVoiceSettings(
  changes: Partial<VoiceSettings>,
): void {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  try {
    const current =
      loadVoiceSettings();

    const updated: VoiceSettings =
      {
        ...current,
        ...changes,

        preferredLanguage:
          getSpeechLanguage(
            changes.preferredLanguage ??
              current.preferredLanguage,
          ),

        voiceGender:
          changes.voiceGender ===
          'female'
            ? 'female'
            : changes.voiceGender ===
                'male'
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

        voicePitch: 1,

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

export function setVoiceGender(
  gender: VoiceGender,
): void {
  saveVoiceSettings({
    voiceGender: gender,
  });

  const settings =
    loadVoiceSettings();

  const locale =
    getSpeechLanguage(
      settings.preferredLanguage,
    );

  const voice =
    getCurrentVoice(
      locale,
      gender,
      settings.selectedVoiceURI,
    );

  speechState = {
    ...speechState,
    voiceGender: gender,
    selectedVoiceURI:
      voice?.voiceURI ||
      voice?.name ||
      '',
    detectedAfrikaansVoiceName:
      locale === 'af-ZA'
        ? voice?.name
        : undefined,
  };

  emitState();
}

export function setSelectedVoiceURI(
  voiceURI: string,
): void {
  const settings =
    loadVoiceSettings();

  const locale =
    getSpeechLanguage(
      settings.preferredLanguage,
    );

  const selected =
    getBrowserVoices().find(
      (voice) =>
        voice.voiceURI ===
          voiceURI ||
        voice.name === voiceURI,
    );

  if (
    locale === 'af-ZA' &&
    (!selected ||
      !getVoiceLanguage(
        selected,
      ).startsWith('af'))
  ) {
    return;
  }

  saveVoiceSettings({
    selectedVoiceURI:
      voiceURI,
  });

  speechState = {
    ...speechState,
    selectedVoiceURI:
      voiceURI,
  };

  emitState();
}

export function setSpeechRate(
  rate: number,
): void {
  const value =
    safeSpeed(rate);

  saveVoiceSettings({
    voiceSpeed: value,
  });

  speechState = {
    ...speechState,
    playbackRate: value,
  };

  emitState();
}

export function setSpeechVolume(
  volume: number,
): void {
  const value =
    safeVolume(volume);

  saveVoiceSettings({
    voiceVolume: value,
  });

  speechState = {
    ...speechState,
    volume: value,
  };

  emitState();
}

export function setSpeechPitch(
  _pitch: number,
): void {
  // Pitch controls are disabled.
  saveVoiceSettings({
    voicePitch: 1,
  });

  speechState = {
    ...speechState,
    pitch: 1,
  };

  emitState();
}

export function applyVoicePreset(
  preset: string,
): void {
  if (
    preset === 'male' ||
    preset === 'male_default'
  ) {
    saveVoiceSettings({
      voiceGender: 'male',
      voiceSpeed: 1,
      voicePitch: 1,
    });

    speechState = {
      ...speechState,
      voiceGender: 'male',
      playbackRate: 1,
      pitch: 1,
    };

    emitState();
    return;
  }

  if (
    preset === 'female' ||
    preset === 'female_default'
  ) {
    saveVoiceSettings({
      voiceGender: 'female',
      voiceSpeed: 1,
      voicePitch: 1,
    });

    speechState = {
      ...speechState,
      voiceGender: 'female',
      playbackRate: 1,
      pitch: 1,
    };

    emitState();
    return;
  }

  if (preset === 'slow_tutor') {
    setSpeechRate(0.85);
    return;
  }

  if (preset === 'quick_review') {
    setSpeechRate(1.25);
    return;
  }

  if (preset === 'normal') {
    setSpeechRate(1);
  }
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

export function isSpeechSynthesisSupported():
  boolean {
  return (
    getSpeechSynthesis() !== null
  );
}

export function isLanguageAvailable(
  language: string,
): boolean {
  const locale =
    getSpeechLanguage(language);

  return getBrowserVoices().some(
    (voice) =>
      isVoiceForLocale(
        voice,
        locale,
      ),
  );
}

export function speak(
  text: string,
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  return new Promise<void>(
    (resolve, reject) => {
      const synthesis =
        getSpeechSynthesis();

      const cleanText =
        cleanSpeechText(text);

      if (!cleanText) {
        resolve();
        return;
      }

      if (!synthesis) {
        reject(
          new Error(
            'Text-to-speech is not available on this device.',
          ),
        );
        return;
      }

      stopSpeech();

      const merged: VoiceSettings =
        {
          ...loadVoiceSettings(),
          ...settings,
        };

      const locale =
        getSpeechLanguage(
          merged.preferredLanguage,
        );

      const gender: VoiceGender =
        merged.voiceGender ===
        'female'
          ? 'female'
          : 'male';

      const voice =
        getCurrentVoice(
          locale,
          gender,
          merged.selectedVoiceURI,
        );

      // Never silently substitute English
      // for Afrikaans.
      if (!voice) {
        const message =
          locale === 'af-ZA'
            ? 'Geen Afrikaanse TTS-stem is op hierdie toestel beskikbaar nie. Installeer of aktiveer ’n Afrikaans TTS-stem in Android se Teks-na-spraak instellings.'
            : `No ${locale} TTS voice is available on this device.`;

        reject(
          new Error(message),
        );
        return;
      }

      const utterance =
        new SpeechSynthesisUtterance(
          cleanText,
        );

      utterance.lang = locale;
      utterance.voice = voice;
      utterance.rate =
        safeSpeed(
          merged.voiceSpeed,
        );
      utterance.volume =
        safeVolume(
          merged.voiceVolume,
        );
      utterance.pitch = 1;

      currentUtterance =
        utterance;

      const generation =
        speechGeneration;

      speechState = {
        ...speechState,
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
      };

      emitState();

      utterance.onstart = () => {
        if (
          generation !==
          speechGeneration
        ) {
          return;
        }

        speechState = {
          ...speechState,
          isPlaying: true,
          isPaused: false,
        };

        emitState();
      };

      utterance.onpause = () => {
        if (
          generation !==
          speechGeneration
        ) {
          return;
        }

        speechState = {
          ...speechState,
          isPlaying: true,
          isPaused: true,
        };

        emitState();
      };

      utterance.onresume = () => {
        if (
          generation !==
          speechGeneration
        ) {
          return;
        }

        speechState = {
          ...speechState,
          isPlaying: true,
          isPaused: false,
        };

        emitState();
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
          generation ===
          speechGeneration
        ) {
          speechState = {
            ...speechState,
            isPlaying: false,
            isPaused: false,
          };

          emitState();
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
          generation ===
          speechGeneration
        ) {
          speechState = {
            ...speechState,
            isPlaying: false,
            isPaused: false,
          };

          emitState();
        }

        // Cancellation is normal when another
        // piece of speech starts.
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
        synthesis.speak(
          utterance,
        );
      } catch (error) {
        speechState = {
          ...speechState,
          isPlaying: false,
          isPaused: false,
        };

        emitState();
        reject(error);
      }
    },
  );
}

export function speakAfrikaans(
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

// Compatibility export required by
// NotesSummarizerTab.tsx and AudioPodcastTab.tsx.
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

// NEW: required by AudioPodcastTab.tsx.
export function pauseSpeech(): void {
  const synthesis =
    getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  try {
    if (
      synthesis.speaking &&
      !synthesis.paused
    ) {
      synthesis.pause();

      speechState = {
        ...speechState,
        isPlaying: true,
        isPaused: true,
      };

      emitState();
    }
  } catch (error) {
    console.error(
      'Unable to pause speech:',
      error,
    );
  }
}

// NEW: required by AudioPodcastTab.tsx.
export function resumeSpeech(): void {
  const synthesis =
    getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  try {
    if (synthesis.paused) {
      synthesis.resume();

      speechState = {
        ...speechState,
        isPlaying: true,
        isPaused: false,
      };

      emitState();
    }
  } catch (error) {
    console.error(
      'Unable to resume speech:',
      error,
    );
  }
}

export function togglePauseSpeech(): void {
  if (
    speechState.isPaused
  ) {
    resumeSpeech();
  } else {
    pauseSpeech();
  }
}

export function stopSpeech(): void {
  speechGeneration += 1;

  const synthesis =
    getSpeechSynthesis();

  if (synthesis) {
    try {
      synthesis.cancel();
    } catch {
      // Ignore cancellation errors.
    }
  }

  currentUtterance =
    null;

  speechState = {
    ...speechState,
    isPlaying: false,
    isPaused: false,
  };

  emitState();
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

export async function synthesizeSpeech(
  request: SpeechRequest,
): Promise<SpeechResponse> {
  const text =
    cleanSpeechText(
      request.text,
    );

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
    throw new Error(
      locale === 'af-ZA'
        ? 'Geen Afrikaanse TTS-stem is op hierdie toestel beskikbaar nie.'
        : `No ${locale} TTS voice is available.`,
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

// Browser/device TTS cannot provide the
// generated audio as an MP3/WAV Blob.
// Kept for compatibility with the podcast UI.
export async function downloadSpeechAudio(
  text: string,
  language: string = 'af-ZA',
  _filename?: string,
): Promise<void> {
  await speak(text, {
    preferredLanguage: language,
  });
}

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
  getLanguageConfig,

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

  setVoiceGender,
  setSelectedVoiceURI,
  setSpeechRate,
  setSpeechVolume,
  setSpeechPitch,
  applyVoicePreset,

  speak,
  speakAfrikaans,
  speakTextInLanguage,
  synthesizeSpeech,

  pauseSpeech,
  resumeSpeech,
  togglePauseSpeech,
  stopSpeech,
  restartSpeech,

  downloadSpeechAudio,
  isSpeechSynthesisSupported,
  isLanguageAvailable,
};
