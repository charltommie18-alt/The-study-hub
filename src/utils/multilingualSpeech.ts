// StudyHub Multilingual Voice Engine
// English + South African Afrikaans + Spanish
//
// IMPORTANT:
// Afrikaans TTS is forced to Azure South African voices:
// Male   = af-ZA-WillemNeural
// Female = af-ZA-AdriNeural
//
// The browser's generic SpeechSynthesis voices are NOT used for
// Afrikaans narration when the Azure server is available.

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface FormattedVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  gender: 'male' | 'female';
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
  voiceGender: 'male' | 'female';
  langCode: string;
  detectedAfrikaansVoiceName?: string;
}

export interface VoiceSettings {
  preferredLanguage: string;
  voiceGender: 'male' | 'female';
  voiceSpeed: number;
  autoReadAiResponses: boolean;
  voicePitch: number;
  voiceVolume: number;
  selectedVoiceURI?: string;
  forceAfrikaansVoice?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
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

const AZURE_VOICES = {
  'af-ZA': {
    male: 'af-ZA-WillemNeural',
    female: 'af-ZA-AdriNeural',
  },
  'en-US': {
    male: 'en-US-GuyNeural',
    female: 'en-US-JennyNeural',
  },
  'es-ES': {
    male: 'es-ES-AlvaroNeural',
    female: 'es-ES-ElviraNeural',
  },
} as const;

let speechState: SpeechPlaybackState = {
  isPlaying: false,
  isPaused: false,
  currentText: '',
  playbackRate: 1,
  pitch: 1,
  volume: 1,
  selectedVoiceURI: 'af-ZA-WillemNeural',
  voiceGender: 'male',
  langCode: 'af-ZA',
};

const stateListeners = new Set<
  (state: SpeechPlaybackState) => void
>();

const voicesListeners = new Set<
  (voices: FormattedVoiceOption[]) => void
>();

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

function emitState(): void {
  const copy = { ...speechState };

  stateListeners.forEach((listener) => {
    try {
      listener(copy);
    } catch {
      // Listener errors must not break speech.
    }
  });
}

function normalizeLanguageCode(
  language?: string,
): 'af-ZA' | 'en-US' | 'es-ES' {
  const value = String(language || '')
    .toLowerCase()
    .trim();

  if (
    value === 'af' ||
    value.startsWith('af-')
  ) {
    return 'af-ZA';
  }

  if (
    value === 'es' ||
    value.startsWith('es-')
  ) {
    return 'es-ES';
  }

  return 'en-US';
}

export function validateLanguageCode(
  language?: string,
): 'af-ZA' | 'en-US' | 'es-ES' {
  return normalizeLanguageCode(language);
}

function getLanguageCode(
  language?: string,
): 'af-ZA' | 'en-US' | 'es-ES' {
  return normalizeLanguageCode(language);
}

export function getAzureVoice(
  language?: string,
  gender: 'male' | 'female' = 'female',
): string {
  const locale = normalizeLanguageCode(language);

  return AZURE_VOICES[locale][gender];
}

export function getAfrikaansVoice(
  gender: 'male' | 'female',
): string {
  return gender === 'male'
    ? AZURE_VOICES['af-ZA'].male
    : AZURE_VOICES['af-ZA'].female;
}

export function getVoiceForLanguage(
  language?: string,
  gender: 'male' | 'female' = 'female',
): {
  locale: string;
  voice: string;
} {
  const locale = normalizeLanguageCode(language);

  return {
    locale,
    voice: getAzureVoice(locale, gender),
  };
}

export function isAfrikaans(
  language?: string,
): boolean {
  return normalizeLanguageCode(language) === 'af-ZA';
}

export function getSpeechLanguage(
  language?: string,
): string {
  return normalizeLanguageCode(language);
}

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_VOICE_SETTINGS };
  }

  try {
    const stored = window.localStorage.getItem(
      STORAGE_KEY,
    );

    if (!stored) {
      return { ...DEFAULT_VOICE_SETTINGS };
    }

    const parsed = JSON.parse(stored);

    const language = normalizeLanguageCode(
      parsed.preferredLanguage ||
        parsed.langCode ||
        DEFAULT_VOICE_SETTINGS.preferredLanguage,
    );

    const gender =
      parsed.voiceGender === 'female'
        ? 'female'
        : 'male';

    return {
      ...DEFAULT_VOICE_SETTINGS,
      ...parsed,
      preferredLanguage: language,
      voiceGender: gender,
      voiceSpeed:
        typeof parsed.voiceSpeed === 'number'
          ? parsed.voiceSpeed
          : 1,
      voicePitch:
        typeof parsed.voicePitch === 'number'
          ? parsed.voicePitch
          : 1,
      voiceVolume:
        typeof parsed.voiceVolume === 'number'
          ? parsed.voiceVolume
          : 1,
      forceAfrikaansVoice: true,
    };
  } catch {
    return { ...DEFAULT_VOICE_SETTINGS };
  }
}

function saveVoiceSettings(
  settings: VoiceSettings,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch {
    // Ignore storage errors.
  }
}

function syncSettingsToState(): void {
  const settings = loadVoiceSettings();

  speechState = {
    ...speechState,
    langCode: normalizeLanguageCode(
      settings.preferredLanguage,
    ),
    voiceGender: settings.voiceGender,
    playbackRate: settings.voiceSpeed,
    pitch: settings.voicePitch,
    volume: settings.voiceVolume,
    selectedVoiceURI:
      settings.selectedVoiceURI ||
      getAzureVoice(
        settings.preferredLanguage,
        settings.voiceGender,
      ),
  };
}

syncSettingsToState();

export function getSpeechState(): SpeechPlaybackState {
  return { ...speechState };
}

export function subscribeSpeechState(
  listener: (state: SpeechPlaybackState) => void,
): () => void {
  stateListeners.add(listener);
  listener({ ...speechState });

  return () => {
    stateListeners.delete(listener);
  };
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

function guessGender(
  voice: SpeechSynthesisVoice,
): 'male' | 'female' {
  const value =
    `${voice.name} ${voice.voiceURI}`.toLowerCase();

  if (
    value.includes('male') ||
    value.includes('guy') ||
    value.includes('david') ||
    value.includes('daniel') ||
    value.includes('george') ||
    value.includes('mark') ||
    value.includes('willem')
  ) {
    return 'male';
  }

  return 'female';
}

function formatBrowserVoices(): FormattedVoiceOption[] {
  return getBrowserVoices().map((voice) => ({
    voiceURI: voice.voiceURI || voice.name,
    name: voice.name,
    lang: voice.lang,
    localService: voice.localService,
    gender: guessGender(voice),
    isAfrikaans:
      voice.lang
        .toLowerCase()
        .startsWith('af'),
  }));
}

export function getAvailableSystemVoices(): FormattedVoiceOption[] {
  const browserVoices = formatBrowserVoices();

  const azureVoices: FormattedVoiceOption[] = [
    {
      voiceURI: AZURE_VOICES['af-ZA'].male,
      name: 'Willem — Afrikaans Manlik',
      lang: 'af-ZA',
      localService: false,
      gender: 'male',
      isAfrikaans: true,
    },
    {
      voiceURI: AZURE_VOICES['af-ZA'].female,
      name: 'Adri — Afrikaans Vroulik',
      lang: 'af-ZA',
      localService: false,
      gender: 'female',
      isAfrikaans: true,
    },
    {
      voiceURI: AZURE_VOICES['en-US'].male,
      name: 'Guy — English Male',
      lang: 'en-US',
      localService: false,
      gender: 'male',
      isAfrikaans: false,
    },
    {
      voiceURI: AZURE_VOICES['en-US'].female,
      name: 'Jenny — English Female',
      lang: 'en-US',
      localService: false,
      gender: 'female',
      isAfrikaans: false,
    },
    {
      voiceURI: AZURE_VOICES['es-ES'].male,
      name: 'Alvaro — Spanish Male',
      lang: 'es-ES',
      localService: false,
      gender: 'male',
      isAfrikaans: false,
    },
    {
      voiceURI: AZURE_VOICES['es-ES'].female,
      name: 'Elvira — Spanish Female',
      lang: 'es-ES',
      localService: false,
      gender: 'female',
      isAfrikaans: false,
    },
  ];

  const result = [
    ...azureVoices,
    ...browserVoices,
  ];

  return result;
}

export function subscribeVoicesList(
  listener: (
    voices: FormattedVoiceOption[],
  ) => void,
): () => void {
  voicesListeners.add(listener);

  const voices = getAvailableSystemVoices();

  listener(voices);

  return () => {
    voicesListeners.delete(listener);
  };
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

export function findAfrikaansBrowserVoice():
  | FormattedVoiceOption
  | undefined {
  const voices = formatBrowserVoices();

  return voices.find(
    (voice) =>
      voice.lang
        .toLowerCase()
        .startsWith('af-za'),
  );
}

if (
  typeof window !== 'undefined' &&
  'speechSynthesis' in window
) {
  try {
    window.speechSynthesis.onvoiceschanged = () => {
      emitVoices();
    };
  } catch {
    // Browser does not support the event.
  }
}

export function setVoiceGender(
  gender: 'male' | 'female',
): void {
  const settings = loadVoiceSettings();

  const language = normalizeLanguageCode(
    settings.preferredLanguage,
  );

  const selectedVoice = getAzureVoice(
    language,
    gender,
  );

  const updated: VoiceSettings = {
    ...settings,
    voiceGender: gender,
    selectedVoiceURI: selectedVoice,
    forceAfrikaansVoice:
      language === 'af-ZA'
      ? true
      : settings.forceAfrikaansVoice,
  };

  saveVoiceSettings(updated);

  speechState = {
    ...speechState,
    voiceGender: gender,
    selectedVoiceURI: selectedVoice,
    langCode: language,
  };

  emitState();
}

export function setSelectedVoiceURI(
  voiceURI: string,
): void {
  const settings = loadVoiceSettings();

  let selected = voiceURI;

  if (
    settings.preferredLanguage === 'af-ZA'
  ) {
    if (
      voiceURI !==
        AZURE_VOICES['af-ZA'].male &&
      voiceURI !==
        AZURE_VOICES['af-ZA'].female
    ) {
      selected = getAzureVoice(
        'af-ZA',
        settings.voiceGender,
      );
    }
  }

  const updated = {
    ...settings,
    selectedVoiceURI: selected,
  };

  saveVoiceSettings(updated);

  speechState = {
    ...speechState,
    selectedVoiceURI: selected,
  };

  emitState();
}

export function setSpeechRate(
  rate: number,
): void {
  const safeRate = Math.max(
    0.5,
    Math.min(2, rate),
  );

  const settings = loadVoiceSettings();

  saveVoiceSettings({
    ...settings,
    voiceSpeed: safeRate,
  });

  speechState = {
    ...speechState,
    playbackRate: safeRate,
  };

  if (currentAudio) {
    currentAudio.playbackRate = safeRate;
  }

  emitState();
}

export function setSpeechPitch(
  pitch: number,
): void {
  const safePitch = Math.max(
    0.8,
    Math.min(1.2, pitch),
  );

  const settings = loadVoiceSettings();

  saveVoiceSettings({
    ...settings,
    voicePitch: safePitch,
  });

  speechState = {
    ...speechState,
    pitch: safePitch,
  };

  emitState();
}

export function setSpeechVolume(
  volume: number,
): void {
  const safeVolume = Math.max(
    0,
    Math.min(1, volume),
  );

  const settings = loadVoiceSettings();

  saveVoiceSettings({
    ...settings,
    voiceVolume: safeVolume,
  });

  speechState = {
    ...speechState,
    volume: safeVolume,
  };

  if (currentAudio) {
    currentAudio.volume = safeVolume;
  }

  emitState();
}

export function applyVoicePreset(
  gender: 'male' | 'female',
  language = speechState.langCode,
): void {
  const locale = normalizeLanguageCode(language);
  const voice = getAzureVoice(
    locale,
    gender,
  );

  const settings: VoiceSettings = {
    ...loadVoiceSettings(),
    preferredLanguage: locale,
    voiceGender: gender,
    selectedVoiceURI: voice,
    forceAfrikaansVoice:
      locale === 'af-ZA',
  };

  saveVoiceSettings(settings);

  speechState = {
    ...speechState,
    langCode: locale,
    voiceGender: gender,
    selectedVoiceURI: voice,
  };

  emitState();
}

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const configured =
      (import.meta as any)?.env
        ?.VITE_API_URL;

    if (configured) {
      return String(configured).replace(
        /\/+$/,
        '',
      );
    }

    return window.location.origin;
  }

  return '';
}

function base64ToBlob(
  base64: string,
  mimeType = 'audio/mpeg',
): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(
    binary.length,
  );

  for (
    let i = 0;
    i < binary.length;
    i += 1
  ) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], {
    type: mimeType,
  });
}

async function requestSpeechAudio(
  text: string,
  language: string,
  gender: 'male' | 'female',
  speed: number,
  volume: number,
  pitch: number,
): Promise<{
  audioUrl?: string;
  audioBase64?: string;
}> {
  const locale =
    normalizeLanguageCode(language);

  // ALWAYS select the correct Azure voice.
  // Never use Gemini voice names for Afrikaans.
  const voice = getAzureVoice(
    locale,
    gender,
  );

  const response = await fetch(
    `${getApiBaseUrl()}/api/voice/synthesize`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text,
        language: locale,
        locale,
        voice,
        gender,
        speed,
        volume,
        pitch: 1,
      }),
    },
  );

  if (!response.ok) {
    let message =
      'Voice synthesis failed.';

    try {
      const data = await response.json();

      if (data?.error) {
        message = String(data.error);
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

function cleanupAudio(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // Ignore.
    }

    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(
        currentObjectUrl,
      );
    } catch {
      // Ignore.
    }

    currentObjectUrl = null;
  }
}

export async function speakText(
  text: string,
  language = speechState.langCode,
  gender = speechState.voiceGender,
): Promise<void> {
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return;
  }

  cleanupAudio();

  const locale =
    normalizeLanguageCode(language);

  const settings = loadVoiceSettings();

  speechState = {
    ...speechState,
    isPlaying: true,
    isPaused: false,
    currentText: cleanText,
    langCode: locale,
    voiceGender: gender,
    playbackRate: settings.voiceSpeed,
    pitch: settings.voicePitch,
    volume: settings.voiceVolume,
    selectedVoiceURI: getAzureVoice(
      locale,
      gender,
    ),
  };

  emitState();

  try {
    const result =
      await requestSpeechAudio(
        cleanText,
        locale,
        gender,
        settings.voiceSpeed,
        settings.voiceVolume,
        1,
      );

    if (result.audioBase64) {
      currentObjectUrl =
        URL.createObjectURL(
          base64ToBlob(
            result.audioBase64,
          ),
        );
    } else if (result.audioUrl) {
      currentObjectUrl =
        result.audioUrl;
    }

    if (!currentObjectUrl) {
      throw new Error(
        'No audio returned from voice server.',
      );
    }

    const audio = new Audio(
      currentObjectUrl,
    );

    currentAudio = audio;

    audio.volume =
      settings.voiceVolume;

    audio.playbackRate =
      settings.voiceSpeed;

    await new Promise<void>(
      (resolve, reject) => {
        audio.onended = () => {
          speechState = {
            ...speechState,
            isPlaying: false,
            isPaused: false,
          };

          emitState();

          cleanupAudio();

          resolve();
        };

        audio.onerror = () => {
          cleanupAudio();

          speechState = {
            ...speechState,
            isPlaying: false,
            isPaused: false,
          };

          emitState();

          reject(
            new Error(
              'Unable to play generated voice audio.',
            ),
          );
        };

        audio.play().catch(reject);
      },
    );
  } catch (error) {
    cleanupAudio();

    speechState = {
      ...speechState,
      isPlaying: false,
      isPaused: false,
    };

    emitState();

    throw error;
  }
}

export async function speak(
  text: string,
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  const merged: VoiceSettings = {
    ...loadVoiceSettings(),
    ...settings,
  };

  const language =
    normalizeLanguageCode(
      merged.preferredLanguage,
    );

  return speakText(
    text,
    language,
    merged.voiceGender,
  );
}

export async function speakAfrikaans(
  text: string,
  gender: 'male' | 'female' = 'female',
): Promise<void> {
  return speakText(
    text,
    'af-ZA',
    gender,
  );
}

export function stopSpeech(): void {
  cleanupAudio();

  speechState = {
    ...speechState,
    isPlaying: false,
    isPaused: false,
  };

  emitState();
}

export function togglePauseSpeech(): void {
  if (!currentAudio) {
    return;
  }

  if (currentAudio.paused) {
    currentAudio
      .play()
      .then(() => {
        speechState = {
          ...speechState,
          isPlaying: true,
          isPaused: false,
        };

        emitState();
      })
      .catch(() => {
        stopSpeech();
      });

    return;
  }

  currentAudio.pause();

  speechState = {
    ...speechState,
    isPlaying: true,
    isPaused: true,
  };

  emitState();
}

export async function restartSpeech(): Promise<void> {
  const text = speechState.currentText;

  const language =
    speechState.langCode;

  const gender =
    speechState.voiceGender;

  stopSpeech();

  if (!text) {
    return;
  }

  await speakText(
    text,
    language,
    gender,
  );
}

export function getSupportedVoiceNames(): string[] {
  return [
    AZURE_VOICES['af-ZA'].male,
    AZURE_VOICES['af-ZA'].female,
    AZURE_VOICES['en-US'].male,
    AZURE_VOICES['en-US'].female,
    AZURE_VOICES['es-ES'].male,
    AZURE_VOICES['es-ES'].female,
  ];
}

export function validateVoiceSelection(
  language: string,
  gender: 'male' | 'female',
  selectedVoice?: string,
): string {
  const locale =
    normalizeLanguageCode(language);

  const expected =
    getAzureVoice(locale, gender);

  if (!selectedVoice) {
    return expected;
  }

  // Afrikaans must NEVER accept an English,
  // Gemini, Google or unrelated voice.
  if (locale === 'af-ZA') {
    if (
          selectedVoice !==
        AZURE_VOICES['af-ZA'].female
    ) {
      return expected;
    }
  }

  return selectedVoice;
}

export async function downloadSpeechAudio(
  text: string,
  language = speechState.langCode,
  filename = 'studyhub_audio',
): Promise<void> {
  const locale =
    normalizeLanguageCode(language);

  const settings =
    loadVoiceSettings();

  const gender =
    settings.voiceGender;

  const result =
    await requestSpeechAudio(
      text,
      locale,
      gender,
      settings.voiceSpeed,
      settings.voiceVolume,
      1,
    );

  let blob: Blob | null = null;

  if (result.audioBase64) {
    blob = base64ToBlob(
      result.audioBase64,
    );
  } else if (result.audioUrl) {
    const response =
      await fetch(result.audioUrl);

    blob = await response.blob();
  }

  if (!blob) {
    throw new Error(
      'No audio available for download.',
    );
  }

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement('a');

  anchor.href = url;
  anchor.download =
    `${filename}.mp3`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function getCurrentVoice(): string {
  return getAzureVoice(
    speechState.langCode,
    speechState.voiceGender,
  );
}

export function setLanguage(
  language: string,
): void {
  const locale =
    normalizeLanguageCode(language);

  const settings =
    loadVoiceSettings();

  const voice =
    getAzureVoice(
      locale,
      settings.voiceGender,
    );

  saveVoiceSettings({
    ...settings,
    preferredLanguage: locale,
    selectedVoiceURI: voice,
    forceAfrikaansVoice:
      locale === 'af-ZA',
  });

  speechState = {
    ...speechState,
    langCode: locale,
    selectedVoiceURI: voice,
  };

  emitState();
}

export function resetVoiceSettings(): void {
  saveVoiceSettings({
    ...DEFAULT_VOICE_SETTINGS,
  });

  syncSettingsToState();

  emitState();
}

export default {
  SUPPORTED_LANGUAGES,
  GENDER_VOICES,
  DEFAULT_VOICE_SETTINGS,
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
  findAfrikaansBrowserVoice,
  loadVoiceSettings,
  validateLanguageCode,
  speak,
  speakText,
  speakAfrikaans,
  getAzureVoice,
  getAfrikaansVoice,
  getVoiceForLanguage,
  isAfrikaans,
  setLanguage,
};
