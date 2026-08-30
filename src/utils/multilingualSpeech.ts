// Multilingual Voice Engine
// Supports English, Afrikaans (South Africa), and Spanish.
// Afrikaans uses the dedicated Azure South African neural voices.

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
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
    name: 'Manlik',
    role: 'Afrikaanse Manlike Stem',
    avatar: '👨',
  },
  {
    gender: 'female',
    name: 'Vroulik',
    role: 'Afrikaanse Vroulike Stem',
    avatar: '👩',
  },
];

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

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  preferredLanguage: 'en',
  voiceGender: 'female',
  voiceSpeed: 1,
  autoReadAiResponses: true,
  voicePitch: 1,
  voiceVolume: 1,
  forceAfrikaansVoice: true,
};

export const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

const AZURE_AFRIKAANS_VOICES = {
  male: 'af-ZA-WillemNeural',
  female: 'af-ZA-AdriNeural',
} as const;

const AZURE_VOICES: Record<
  string,
  Record<'male' | 'female', string>
> = {
  af: {
    male: AZURE_AFRIKAANS_VOICES.male,
    female: AZURE_AFRIKAANS_VOICES.female,
  },
  en: {
    male: 'en-US-GuyNeural',
    female: 'en-US-JennyNeural',
  },
  es: {
    male: 'es-ES-AlvaroNeural',
    female: 'es-ES-ElviraNeural',
  },
};

export function normalizeLanguage(language?: string): string {
  if (!language) return 'en';

  const value = language.toLowerCase();

  if (value === 'af' || value.startsWith('af-')) {
    return 'af';
  }

  if (value === 'es' || value.startsWith('es-')) {
    return 'es';
  }

  return 'en';
}

export function getAzureLocale(language?: string): string {
  const normalized = normalizeLanguage(language);

  switch (normalized) {
    case 'af':
      return 'af-ZA';

    case 'es':
      return 'es-ES';

    default:
      return 'en-US';
  }
}

export function getAzureVoice(
  language?: string,
  gender: 'male' | 'female' = 'female',
): string {
  const normalized = normalizeLanguage(language);

  return (
    AZURE_VOICES[normalized]?.[gender] ||
    AZURE_VOICES.en.female
  );
}

export function getVoiceForLanguage(
  language?: string,
  gender: 'male' | 'female' = 'female',
): {
  locale: string;
  voice: string;
} {
  return {
    locale: getAzureLocale(language),
    voice: getAzureVoice(language, gender),
  };
}

export function isAfrikaans(language?: string): boolean {
  return normalizeLanguage(language) === 'af';
}

export function getAfrikaansVoice(
  gender: 'male' | 'female',
): string {
  return gender === 'male'
    ? AZURE_AFRIKAANS_VOICES.male
    : AZURE_AFRIKAANS_VOICES.female;
}

export interface SpeechRequest {
  text: string;
  language?: string;
  gender?: 'male' | 'female';
  speed?: number;
  volume?: number;
  pitch?: number;
}

export interface SpeechResponse {
  audioUrl?: string;
  audioBase64?: string;
  voice: string;
  locale: string;
}

function getApiBaseUrl(): string {
  const configured =
    typeof import.meta !== 'undefined'
      ? (import.meta as any).env?.VITE_API_URL
      : undefined;

  if (configured) {
    return String(configured).replace(/\/+$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location?.origin
  ) {
    return window.location.origin;
  }

  return '';
}

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function synthesizeSpeech(
  request: SpeechRequest,
): Promise<SpeechResponse> {
  const language = normalizeLanguage(request.language);
  const gender = request.gender || 'female';

  const voice = getAzureVoice(language, gender);
  const locale = getAzureLocale(language);

  const baseUrl = getApiBaseUrl();

  const response = await fetch(
    `${baseUrl}/api/voice/synthesize`,
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        text: request.text,
        language,
        locale,
        voice,
        gender,
        speed: request.speed ?? 1,
        volume: request.volume ?? 1,
        pitch: request.pitch ?? 1,
      }),
    },
  );

  if (!response.ok) {
    let message = 'Speech synthesis failed.';

    try {
      const data = await response.json();

      if (data?.error) {
        message = String(data.error);
      }
    } catch {
      // Keep default error.
    }

    throw new Error(message);
  }

  const data = (await response.json()) as SpeechResponse;

  return {
    ...data,
    voice: data.voice || voice,
    locale: data.locale || locale,
  };
}

function base64ToBlob(
  base64: string,
  mimeType = 'audio/mpeg',
): Blob {
  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];

  for (
    let offset = 0;
    offset < byteCharacters.length;
    offset += 512
  ) {
    const slice = byteCharacters.slice(
      offset,
      offset + 512,
    );

    const bytes = new Uint8Array(slice.length);

    for (let i = 0; i < slice.length; i += 1) {
      bytes[i] = slice.charCodeAt(i);
    }

    byteArrays.push(bytes);
  }

  return new Blob(byteArrays, {
    type: mimeType,
  });
}

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

export function stopSpeech(): void {
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
      URL.revokeObjectURL(currentObjectUrl);
    } catch {
      // Ignore.
    }

    currentObjectUrl = null;
  }
}

export async function speak(
  text: string,
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return;
  }

  stopSpeech();

  const merged: VoiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    ...settings,
  };

  const language = normalizeLanguage(
    merged.preferredLanguage,
  );

  const gender = merged.voiceGender;

  const result = await synthesizeSpeech({
    text: cleanText,
    language,
    gender,
    speed: merged.voiceSpeed,
    volume: merged.voiceVolume,
    pitch: 1,
  });

  if (result.audioBase64) {
    const blob = base64ToBlob(result.audioBase64);
    currentObjectUrl = URL.createObjectURL(blob);

    const audio = new Audio(currentObjectUrl);

    currentAudio = audio;
    audio.volume = Math.max(
      0,
      Math.min(1, merged.voiceVolume),
    );

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        currentAudio = null;

        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
          currentObjectUrl = null;
        }

        resolve();
      };

      audio.onerror = () => {
        currentAudio = null;

        if (currentObjectUrl) {
          URL.revokeObjectURL(currentObjectUrl);
          currentObjectUrl = null;
        }

        reject(
          new Error('Unable to play generated speech.'),
        );
      };

      audio.play().catch(reject);
    });

    return;
  }

  if (result.audioUrl) {
    const audio = new Audio(result.audioUrl);

    currentAudio = audio;
    audio.volume = Math.max(
      0,
      Math.min(1, merged.voiceVolume),
    );

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        currentAudio = null;
        reject(
          new Error('Unable to play generated speech.'),
        );
      };

      audio.play().catch(reject);
    });

    return;
  }

  throw new Error('No audio was returned by the voice server.');
}

export async function speakAfrikaans(
  text: string,
  gender: 'male' | 'female' = 'female',
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  return speak(text, {
    ...settings,
    preferredLanguage: 'af',
    voiceGender: gender,
    forceAfrikaansVoice: true,
  });
}

export function getSupportedVoiceNames(): string[] {
  return [
    AZURE_AFRIKAANS_VOICES.male,
    AZURE_AFRIKAANS_VOICES.female,
    AZURE_VOICES.en.male,
    AZURE_VOICES.en.female,
    AZURE_VOICES.es.male,
    AZURE_VOICES.es.female,
  ];
}

export function validateVoiceSelection(
  language: string,
  gender: 'male' | 'female',
  selectedVoice?: string,
): string {
  const expected = getAzureVoice(language, gender);

  if (!selectedVoice) {
    return expected;
  }

  if (normalizeLanguage(language) === 'af') {
    if (
      selectedVoice !==
        AZURE_AFRIKAANS_VOICES.male &&
      selectedVoice !==
        AZURE_AFRIKAANS_VOICES.female
    ) {
      return expected;
    }
  }

  return selectedVoice;
}

export default {
  LANGUAGES,
  GENDER_VOICES,
  DEFAULT_VOICE_SETTINGS,
  getAzureLocale,
  getAzureVoice,
  getAfrikaansVoice,
  getVoiceForLanguage,
  isAfrikaans,
  synthesizeSpeech,
  speak,
  speakAfrikaans,
  stopSpeech,
};
