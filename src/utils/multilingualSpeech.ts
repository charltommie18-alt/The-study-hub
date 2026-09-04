// src/utils/multilingualSpeech.ts
// Device/browser Text-to-Speech engine.
// No Azure Speech, API key, or paid speech service is required.

export type VoiceGender = 'male' | 'female';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface VoiceSettings {
  preferredLanguage: string;
  voiceGender: VoiceGender;
  voiceSpeed: number;
  autoReadAiResponses: boolean;
  voicePitch: number;
  voiceVolume: number;
  forceAfrikaansVoice: boolean;
  selectedVoiceURI?: string;
}

export interface FormattedVoiceOption {
  voice: SpeechSynthesisVoice;
  label: string;
  language: string;
  gender: VoiceGender | 'unknown';
}

export interface SpeechPlaybackState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  currentLanguage: string;
  currentVoiceURI: string;
  rate: number;
  volume: number;
  pitch: number;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'af-ZA',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

const LANGUAGE_KEY = 'studyhub_voice_settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  preferredLanguage: 'af-ZA',
  voiceGender: 'female',
  voiceSpeed: 1,
  autoReadAiResponses: true,
  voicePitch: 1,
  voiceVolume: 1,
  forceAfrikaansVoice: true,
};

const DEFAULT_STATE: SpeechPlaybackState = {
  isSpeaking: false,
  isPaused: false,
  currentText: '',
  currentLanguage: 'af-ZA',
  currentVoiceURI: '',
  rate: 1,
  volume: 1,
  pitch: 1,
};

let voiceSettings: VoiceSettings = {
  ...DEFAULT_SETTINGS,
};

let speechState: SpeechPlaybackState = {
  ...DEFAULT_STATE,
};

let availableVoices: SpeechSynthesisVoice[] = [];

let speechListeners: Array<
  (state: SpeechPlaybackState) => void
> = [];

let voiceListeners: Array<
  (voices: SpeechSynthesisVoice[]) => void
> = [];

let voicesLoaded = false;

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('speechSynthesis' in window)) {
    return null;
  }

  return window.speechSynthesis;
}

function emitSpeechState(): void {
  const state = {
    ...speechState,
  };

  speechListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (error) {
      console.error(
        'Speech state listener error:',
        error,
      );
    }
  });
}

function emitVoiceList(): void {
  const voices = [...availableVoices];

  voiceListeners.forEach((listener) => {
    try {
      listener(voices);
    } catch (error) {
      console.error(
        'Voice list listener error:',
        error,
      );
    }
  });
}

function normalizeLanguageCode(
  language: string | undefined | null,
): string {
  const value = String(language || '').trim().toLowerCase();

  if (value.startsWith('af')) {
    return 'af-ZA';
  }

  if (value.startsWith('es')) {
    return 'es-ES';
  }

  if (value.startsWith('en')) {
    return 'en-US';
  }

  return 'af-ZA';
}

export function validateLanguageCode(
  language: string | undefined | null,
): string {
  return normalizeLanguageCode(language);
}

export function normalizeLanguage(
  language: string | undefined | null,
): string {
  return normalizeLanguageCode(language);
}

export function getAzureLocale(
  language: string | undefined | null,
): string {
  // Kept only for backwards compatibility with older callers.
  // Azure is NOT used.
  return normalizeLanguageCode(language);
}

export function isAfrikaans(
  language: string | undefined | null,
): boolean {
  return normalizeLanguageCode(language) === 'af-ZA';
}

export function getAfrikaansVoice(): string {
  // Device voice is selected dynamically.
  return '';
}

export function getAzureVoice(
  language: string | undefined | null,
  gender: VoiceGender = 'female',
): string {
  // Kept for backwards compatibility.
  // No Azure voice is returned or used.
  void language;
  void gender;
  return '';
}

export function getSupportedVoiceNames(): string[] {
  return availableVoices.map((voice) => voice.name);
}

function loadStoredSettings(): VoiceSettings {
  if (typeof window === 'undefined') {
    return {
      ...DEFAULT_SETTINGS,
    };
  }

  try {
    const stored = window.localStorage.getItem(
      LANGUAGE_KEY,
    );

    if (!stored) {
      return {
        ...DEFAULT_SETTINGS,
      };
    }

    const parsed = JSON.parse(stored) as Partial<VoiceSettings>;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      preferredLanguage: normalizeLanguageCode(
        parsed.preferredLanguage,
      ),
      voiceGender:
        parsed.voiceGender === 'male'
          ? 'male'
          : 'female',
      voiceSpeed: clampRate(
        Number(parsed.voiceSpeed) || 1,
      ),
      voiceVolume: clampVolume(
        Number(parsed.voiceVolume) || 1,
      ),
      voicePitch: 1,
      forceAfrikaansVoice:
        parsed.forceAfrikaansVoice !== false,
    };
  } catch (error) {
    console.error(
      'Unable to load speech settings:',
      error,
    );

    return {
      ...DEFAULT_SETTINGS,
    };
  }
}

function saveStoredSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      LANGUAGE_KEY,
      JSON.stringify(voiceSettings),
    );
  } catch (error) {
    console.error(
      'Unable to save speech settings:',
      error,
    );
  }
}

export function loadVoiceSettings(): VoiceSettings {
  voiceSettings = loadStoredSettings();

  return {
    ...voiceSettings,
  };
}

export function getVoiceSettings(): VoiceSettings {
  return {
    ...voiceSettings,
  };
}

export function setVoiceSettings(
  settings: Partial<VoiceSettings>,
): VoiceSettings {
  voiceSettings = {
    ...voiceSettings,
    ...settings,
    preferredLanguage: normalizeLanguageCode(
      settings.preferredLanguage ??
        voiceSettings.preferredLanguage,
    ),
    voiceGender:
      settings.voiceGender === 'male' ||
      settings.voiceGender === 'female'
        ? settings.voiceGender
        : voiceSettings.voiceGender,
    voiceSpeed: clampRate(
      settings.voiceSpeed ??
        voiceSettings.voiceSpeed,
    ),
    voiceVolume: clampVolume(
      settings.voiceVolume ??
        voiceSettings.voiceVolume,
    ),
    voicePitch: 1,
  };

  saveStoredSettings();

  return {
    ...voiceSettings,
  };
}

export function setPreferredLanguage(
  language: string,
): VoiceSettings {
  return setVoiceSettings({
    preferredLanguage:
      normalizeLanguageCode(language),
  });
}

export function setVoiceGender(
  gender: VoiceGender,
): VoiceSettings {
  return setVoiceSettings({
    voiceGender: gender,
  });
}

export function setSpeechRate(
  rate: number,
): VoiceSettings {
  const value = clampRate(rate);

  voiceSettings = {
    ...voiceSettings,
    voiceSpeed: value,
  };

  saveStoredSettings();

  speechState = {
    ...speechState,
    rate: value,
  };

  emitSpeechState();

  return {
    ...voiceSettings,
  };
}

export function setSpeechVolume(
  volume: number,
): VoiceSettings {
  const value = clampVolume(volume);

  voiceSettings = {
    ...voiceSettings,
    voiceVolume: value,
  };

  saveStoredSettings();

  speechState = {
    ...speechState,
    volume: value,
  };

  emitSpeechState();

  return {
    ...voiceSettings,
  };
}

export function setSpeechPitch(
  pitch: number,
): VoiceSettings {
  // Pitch controls are intentionally disabled.
  // Keep this function for compatibility with older code.
  void pitch;

  voiceSettings = {
    ...voiceSettings,
    voicePitch: 1,
  };

  saveStoredSettings();

  speechState = {
    ...speechState,
    pitch: 1,
  };

  emitSpeechState();

  return {
    ...voiceSettings,
  };
}

function clampRate(rate: number): number {
  if (!Number.isFinite(rate)) {
    return 1;
  }

  return Math.min(
    2,
    Math.max(0.5, rate),
  );
}

function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) {
    return 1;
  }

  return Math.min(
    1,
    Math.max(0, volume),
  );
}

function languageMatches(
  voiceLanguage: string,
  requestedLanguage: string,
): boolean {
  const voice = voiceLanguage
    .toLowerCase()
    .replace('_', '-');

  const requested = requestedLanguage
    .toLowerCase()
    .replace('_', '-');

  if (voice === requested) {
    return true;
  }

  const voiceBase = voice.split('-')[0];
  const requestedBase =
    requested.split('-')[0];

  return voiceBase === requestedBase;
}

function isAfrikaansVoice(
  voice: SpeechSynthesisVoice,
): boolean {
  return languageMatches(
    voice.lang,
    'af-ZA',
  );
}

function isEnglishVoice(
  voice: SpeechSynthesisVoice,
): boolean {
  return languageMatches(
    voice.lang,
    'en-US',
  );
}

function isSpanishVoice(
  voice: SpeechSynthesisVoice,
): boolean {
  return languageMatches(
    voice.lang,
    'es-ES',
  );
}

function guessVoiceGender(
  voice: SpeechSynthesisVoice,
): VoiceGender | 'unknown' {
  const name = voice.name.toLowerCase();

  const femaleWords = [
    'female',
    'woman',
    'girl',
    'samantha',
    'victoria',
    'zira',
    'susan',
    'karen',
    'moira',
    'fiona',
    'ava',
    'allison',
    'siri',
  ];

  const maleWords = [
    'male',
    'man',
    'boy',
    'david',
    'mark',
    'daniel',
    'alex',
    'james',
    'fred',
  ];

  if (
    femaleWords.some((word) =>
      name.includes(word),
    )
  ) {
    return 'female';
  }

  if (
    maleWords.some((word) =>
      name.includes(word),
    )
  ) {
    return 'male';
  }

  return 'unknown';
}

export function getAvailableSystemVoices(): SpeechSynthesisVoice[] {
  refreshAvailableVoices();
  return [...availableVoices];
}

export function refreshAvailableVoices(): SpeechSynthesisVoice[] {
  const synthesis = getSpeechSynthesis();

  if (!synthesis) {
    availableVoices = [];
    return [];
  }

  try {
    availableVoices =
      synthesis.getVoices() || [];

    voicesLoaded =
      availableVoices.length > 0;

    if (voicesLoaded) {
      emitVoiceList();
    }

    return [...availableVoices];
  } catch (error) {
    console.error(
      'Unable to read device voices:',
      error,
    );

    availableVoices = [];

    return [];
  }
}

export function subscribeVoicesList(
  listener: (
    voices: SpeechSynthesisVoice[],
  ) => void,
): () => void {
  voiceListeners.push(listener);

  refreshAvailableVoices();

  try {
    listener([...availableVoices]);
  } catch (error) {
    console.error(
      'Voice listener error:',
      error,
    );
  }

  return () => {
    voiceListeners =
      voiceListeners.filter(
        (item) => item !== listener,
      );
  };
}

function initializeVoiceLoading(): void {
  const synthesis = getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  refreshAvailableVoices();

  synthesis.onvoiceschanged = () => {
    refreshAvailableVoices();
  };
}

if (
  typeof window !== 'undefined'
) {
  initializeVoiceLoading();
}

function selectVoiceForLanguage(
  language: string,
): SpeechSynthesisVoice | null {
  refreshAvailableVoices();

  const normalized =
    normalizeLanguageCode(language);

  const matching =
    availableVoices.filter((voice) =>
      languageMatches(
        voice.lang,
        normalized,
      ),
    );

  if (matching.length === 0) {
    return null;
  }

  const selectedURI =
    voiceSettings.selectedVoiceURI;

  if (selectedURI) {
    const selected =
      matching.find(
        (voice) =>
          voice.voiceURI === selectedURI,
      );

    if (selected) {
      return selected;
    }
  }

  const requestedGender =
    voiceSettings.voiceGender;

  const genderMatch =
    matching.find(
      (voice) =>
        guessVoiceGender(voice) ===
        requestedGender,
    );

  if (genderMatch) {
    return genderMatch;
  }

  return matching[0] || null;
}

export function findAfrikaansBrowserVoice():
  SpeechSynthesisVoice | null {
  refreshAvailableVoices();

  return (
    availableVoices.find(
      (voice) =>
        isAfrikaansVoice(voice),
    ) || null
  );
}

export function getVoiceForLanguage(
  language: string,
  gender: VoiceGender = voiceSettings.voiceGender,
): SpeechSynthesisVoice | null {
  const normalized =
    normalizeLanguageCode(language);

  refreshAvailableVoices();

  const matching =
    availableVoices.filter((voice) =>
      languageMatches(
        voice.lang,
        normalized,
      ),
    );

  if (matching.length === 0) {
    return null;
  }

  const genderMatch =
    matching.find(
      (voice) =>
        guessVoiceGender(voice) ===
        gender,
    );

  return genderMatch || matching[0];
}

export function getFormattedVoiceOptions(
  language?: string,
): FormattedVoiceOption[] {
  refreshAvailableVoices();

  const normalized = language
    ? normalizeLanguageCode(language)
    : voiceSettings.preferredLanguage;

  return availableVoices
    .filter((voice) =>
      languageMatches(
        voice.lang,
        normalized,
      ),
    )
    .map((voice) => ({
      voice,
      label: voice.name,
      language: voice.lang,
      gender: guessVoiceGender(voice),
    }));
}

export function getVoiceOptions(
  language?: string,
): FormattedVoiceOption[] {
  return getFormattedVoiceOptions(
    language,
  );
}

export function setSelectedVoiceURI(
  voiceURI: string,
): VoiceSettings {
  return setVoiceSettings({
    selectedVoiceURI:
      voiceURI || undefined,
  });
}

export function validateVoiceSelection(
  language: string,
  voiceURI?: string,
): boolean {
  refreshAvailableVoices();

  const normalized =
    normalizeLanguageCode(language);

  if (!voiceURI) {
    return Boolean(
      selectVoiceForLanguage(normalized),
    );
  }

  return availableVoices.some(
    (voice) =>
      voice.voiceURI === voiceURI &&
      languageMatches(
        voice.lang,
        normalized,
      ),
  );
        }
export function applyVoicePreset(
  gender: VoiceGender,
  language: string = voiceSettings.preferredLanguage,
): VoiceSettings {
  const normalized =
    normalizeLanguageCode(language);

  const voice =
    getVoiceForLanguage(
      normalized,
      gender,
    );

  voiceSettings = {
    ...voiceSettings,
    preferredLanguage: normalized,
    voiceGender: gender,
    selectedVoiceURI:
      voice?.voiceURI ||
      voiceSettings.selectedVoiceURI,
  };

  saveStoredSettings();

  return {
    ...voiceSettings,
  };
}

export function getSpeechState(): SpeechPlaybackState {
  return {
    ...speechState,
  };
}

export function subscribeSpeechState(
  listener: (
    state: SpeechPlaybackState,
  ) => void,
): () => void {
  speechListeners.push(listener);

  try {
    listener({
      ...speechState,
    });
  } catch (error) {
    console.error(
      'Speech listener error:',
      error,
    );
  }

  return () => {
    speechListeners =
      speechListeners.filter(
        (item) => item !== listener,
      );
  };
}

function finishSpeech(): void {
  speechState = {
    ...speechState,
    isSpeaking: false,
    isPaused: false,
  };

  emitSpeechState();
}

export function stopSpeech(): void {
  const synthesis =
    getSpeechSynthesis();

  if (synthesis) {
    try {
      synthesis.cancel();
    } catch (error) {
      console.error(
        'Unable to stop speech:',
        error,
      );
    }
  }

  speechState = {
    ...speechState,
    isSpeaking: false,
    isPaused: false,
    currentText: '',
  };

  emitSpeechState();
}

export function togglePauseSpeech(): void {
  const synthesis =
    getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  if (
    speechState.isSpeaking &&
    !speechState.isPaused
  ) {
    try {
      synthesis.pause();

      speechState = {
        ...speechState,
        isPaused: true,
      };

      emitSpeechState();
    } catch (error) {
      console.error(
        'Unable to pause speech:',
        error,
      );
    }

    return;
  }

  if (
    speechState.isSpeaking &&
    speechState.isPaused
  ) {
    try {
      synthesis.resume();

      speechState = {
        ...speechState,
        isPaused: false,
      };

      emitSpeechState();
    } catch (error) {
      console.error(
        'Unable to resume speech:',
        error,
      );
    }
  }
}

export function pauseSpeech(): void {
  const synthesis =
    getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  try {
    synthesis.pause();

    speechState = {
      ...speechState,
      isPaused: true,
    };

    emitSpeechState();
  } catch (error) {
    console.error(
      'Unable to pause speech:',
      error,
    );
  }
}

export function resumeSpeech(): void {
  const synthesis =
    getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  try {
    synthesis.resume();

    speechState = {
      ...speechState,
      isPaused: false,
    };

    emitSpeechState();
  } catch (error) {
    console.error(
      'Unable to resume speech:',
      error,
    );
  }
}

export function restartSpeech(): void {
  const text =
    speechState.currentText;

  const language =
    speechState.currentLanguage;

  if (!text) {
    return;
  }

  speak(text, {
    preferredLanguage: language,
  }).catch((error) => {
    console.error(
      'Unable to restart speech:',
      error,
    );
  });
}

export interface SpeakOptions {
  preferredLanguage?: string;
  language?: string;
  voiceGender?: VoiceGender;
  rate?: number;
  volume?: number;
  pitch?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export function speak(
  text: string,
  options: SpeakOptions = {},
): Promise<void> {
  return new Promise<void>(
    (resolve, reject) => {
      const synthesis =
        getSpeechSynthesis();

      const cleanText =
        String(text || '').trim();

      if (!cleanText) {
        resolve();
        return;
      }

      if (!synthesis) {
        const error = new Error(
          'Text-to-speech is not available on this device or browser.',
        );

        options.onError?.(error);
        reject(error);
        return;
      }

      const language = normalizeLanguageCode(
        options.preferredLanguage ||
          options.language ||
          voiceSettings.preferredLanguage,
      );

      const rate = clampRate(
        options.rate ??
          voiceSettings.voiceSpeed,
      );

      const volume = clampVolume(
        options.volume ??
          voiceSettings.voiceVolume,
      );

      const gender =
        options.voiceGender ||
        voiceSettings.voiceGender;

      try {
        synthesis.cancel();
      } catch (error) {
        console.warn(
          'Could not cancel previous speech:',
          error,
        );
      }

      refreshAvailableVoices();

      let selectedVoice: SpeechSynthesisVoice | null =
        null;

      if (options.voiceURI) {
        selectedVoice =
          availableVoices.find(
            (voice) =>
              voice.voiceURI ===
                options.voiceURI &&
              languageMatches(
                voice.lang,
                language,
              ),
          ) || null;
      }

      if (!selectedVoice) {
        selectedVoice =
          getVoiceForLanguage(
            language,
            gender,
          );
      }

      // Afrikaans is deliberately strict.
      // Never silently use an English voice for Afrikaans.
      if (
        language === 'af-ZA' &&
        !selectedVoice
      ) {
        const error = new Error(
          'No Afrikaans text-to-speech voice is installed on this device. Please install or enable an Afrikaans voice in the Android Text-to-Speech settings.',
        );

        speechState = {
          ...speechState,
          isSpeaking: false,
          isPaused: false,
          currentText: cleanText,
          currentLanguage: language,
          currentVoiceURI: '',
          rate,
          volume,
          pitch: 1,
        };

        emitSpeechState();
        options.onError?.(error);
        reject(error);
        return;
      }

      const utterance =
        new SpeechSynthesisUtterance(
          cleanText,
        );

      utterance.lang = language;
      utterance.rate = rate;
      utterance.volume = volume;

      // Pitch is intentionally fixed.
      utterance.pitch = 1;

      if (selectedVoice) {
        utterance.voice =
          selectedVoice;
      }

      speechState = {
        isSpeaking: true,
        isPaused: false,
        currentText: cleanText,
        currentLanguage: language,
        currentVoiceURI:
          selectedVoice?.voiceURI || '',
        rate,
        volume,
        pitch: 1,
      };

      emitSpeechState();

      utterance.onstart = () => {
        speechState = {
          ...speechState,
          isSpeaking: true,
          isPaused: false,
        };

        emitSpeechState();
        options.onStart?.();
      };

      utterance.onpause = () => {
        speechState = {
          ...speechState,
          isSpeaking: true,
          isPaused: true,
        };

        emitSpeechState();
      };

      utterance.onresume = () => {
        speechState = {
          ...speechState,
          isSpeaking: true,
          isPaused: false,
        };

        emitSpeechState();
      };

      utterance.onend = () => {
        finishSpeech();
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (
        event: SpeechSynthesisErrorEvent,
      ) => {
        finishSpeech();

        const error = new Error(
          `Text-to-speech error: ${event.error || 'unknown error'}`,
        );

        console.error(
          'Text-to-speech error:',
          event.error,
        );

        options.onError?.(error);
        reject(error);
      };

      try {
        synthesis.speak(
          utterance,
        );
      } catch (error) {
        finishSpeech();
        options.onError?.(error);
        reject(error);
      }
    },
  );
}

export function speakAfrikaans(
  text: string,
  options: Omit<
    SpeakOptions,
    'preferredLanguage' | 'language'
  > = {},
): Promise<void> {
  return speak(text, {
    ...options,
    preferredLanguage: 'af-ZA',
  });
}

// Compatibility function required by
// NotesSummarizerTab.tsx.
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

export async function synthesizeSpeech(
  text: string,
  language: string = voiceSettings.preferredLanguage,
  options: Omit<
    SpeakOptions,
    'preferredLanguage' | 'language'
  > = {},
): Promise<void> {
  await speak(text, {
    ...options,
    preferredLanguage: language,
  });
}

export async function downloadSpeechAudio(
  text: string,
  language: string = voiceSettings.preferredLanguage,
): Promise<Blob | null> {
  // Browser SpeechSynthesis does not expose
  // the generated audio as a downloadable Blob.
  // Speaking the text remains available.
  await speak(text, {
    preferredLanguage: language,
  });

  return null;
}

export function isSpeechSynthesisSupported(): boolean {
  return getSpeechSynthesis() !== null;
}

export function isLanguageAvailable(
  language: string,
): boolean {
  const normalized =
    normalizeLanguageCode(language);

  refreshAvailableVoices();

  return availableVoices.some(
    (voice) =>
      languageMatches(
        voice.lang,
        normalized,
      ),
  );
}

export function getLanguageConfig(
  language: string,
): LanguageConfig | undefined {
  const normalized =
    normalizeLanguageCode(language);

  return SUPPORTED_LANGUAGES.find(
    (item) =>
      item.code === normalized,
  );
}

export function setAutoReadAiResponses(
  enabled: boolean,
): VoiceSettings {
  return setVoiceSettings({
    autoReadAiResponses: enabled,
  });
}

export function getSpeechLanguageName(
  language: string,
): string {
  return (
    getLanguageConfig(language)
      ?.name || 'Afrikaans'
  );
}

// Initialize settings once.
voiceSettings =
  loadStoredSettings();

// Make sure device voices are loaded after
// the browser/Android WebView exposes them.
if (
  typeof window !== 'undefined'
) {
  initializeVoiceLoading();
}

export default {
  SUPPORTED_LANGUAGES,
  loadVoiceSettings,
  getVoiceSettings,
  setVoiceSettings,
  setPreferredLanguage,
  setVoiceGender,
  setSpeechRate,
  setSpeechVolume,
  setSpeechPitch,
  setSelectedVoiceURI,
  applyVoicePreset,
  getSpeechState,
  subscribeSpeechState,
  subscribeVoicesList,
  getAvailableSystemVoices,
  getFormattedVoiceOptions,
  getVoiceOptions,
  getVoiceForLanguage,
  findAfrikaansBrowserVoice,
  validateVoiceSelection,
  validateLanguageCode,
  normalizeLanguage,
  isAfrikaans,
  getAfrikaansVoice,
  getSupportedVoiceNames,
  speak,
  speakAfrikaans,
  speakTextInLanguage,
  synthesizeSpeech,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  togglePauseSpeech,
  restartSpeech,
  downloadSpeechAudio,
  isSpeechSynthesisSupported,
  isLanguageAvailable,
  getLanguageConfig,
  getSpeechLanguageName,
  setAutoReadAiResponses,
};
