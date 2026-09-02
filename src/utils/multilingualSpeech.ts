// ============================================================
// MULTILINGUAL AZURE VOICE ENGINE
// ============================================================
//
// Supported languages:
//
// English:
//   en-US-GuyNeural
//   en-US-JennyNeural
//
// Afrikaans:
//   af-ZA-WillemNeural
//   af-ZA-AdriNeural
//
// Spanish:
//   es-ES-AlvaroNeural
//   es-ES-ElviraNeural
//
// IMPORTANT:
// Afrikaans NEVER falls back to an English, Google,
// browser or unrelated voice.
// ============================================================

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
    role: 'Afrikaanse manlike Azure-stem',
    avatar: '👨',
  },
  {
    gender: 'female',
    name: 'Vroulik',
    role: 'Afrikaanse vroulike Azure-stem',
    avatar: '👩',
  },
];

export interface VoiceSettings {
  preferredLanguage: string;

  voiceGender: 'male' | 'female';

  voiceSpeed: number;

  autoReadAiResponses: boolean;

  // Kept for compatibility.
  // Pitch is controlled by the Azure server.
  voicePitch: number;

  voiceVolume: number;

  // Compatibility only.
  // NEVER trusted for Afrikaans.
  selectedVoiceURI?: string;

  forceAfrikaansVoice?: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  preferredLanguage: 'af',
  voiceGender: 'female',
  voiceSpeed: 1,
  autoReadAiResponses: true,
  voicePitch: 1,
  voiceVolume: 1,
  forceAfrikaansVoice: true,
};

// ============================================================
// LANGUAGES
// ============================================================

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

// ============================================================
// AZURE VOICES
// ============================================================

export const AZURE_AFRIKAANS_VOICES = {
  male: 'af-ZA-WillemNeural',
  female: 'af-ZA-AdriNeural',
} as const;

export const AZURE_VOICES: Record<
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

// ============================================================
// LANGUAGE NORMALIZATION
// ============================================================

export function normalizeLanguage(
  language?: string,
): 'af' | 'en' | 'es' {
  if (!language) {
    return 'af';
  }

  const value = String(language)
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

  if (
    value === 'en' ||
    value.startsWith('en-') ||
    value.includes('english')
  ) {
    return 'en';
  }

  // Safe default.
  return 'af';
}

// ============================================================
// AZURE LOCALE
// ============================================================

export function getAzureLocale(
  language?: string,
): 'af-ZA' | 'en-US' | 'es-ES' {
  const normalized = normalizeLanguage(language);

  switch (normalized) {
    case 'af':
      return 'af-ZA';

    case 'es':
      return 'es-ES';

    case 'en':
    default:
      return 'en-US';
  }
}

// ============================================================
// AZURE VOICE
// ============================================================

export function getAzureVoice(
  language?: string,
  gender: 'male' | 'female' = 'female',
): string {
  const normalized = normalizeLanguage(language);

  // Afrikaans is strictly locked to Azure Afrikaans.
  if (normalized === 'af') {
    return gender === 'male'
      ? AZURE_AFRIKAANS_VOICES.male
      : AZURE_AFRIKAANS_VOICES.female;
  }

  return (
    AZURE_VOICES[normalized]?.[gender] ||
    AZURE_VOICES.en.female
  );
}

// ============================================================
// VOICE + LOCALE
// ============================================================

export function getVoiceForLanguage(
  language?: string,
  gender: 'male' | 'female' = 'female',
): {
  locale: string;
  voice: string;
} {
  const normalized = normalizeLanguage(language);

  if (normalized === 'af') {
    return {
      locale: 'af-ZA',
      voice:
        gender === 'male'
          ? AZURE_AFRIKAANS_VOICES.male
          : AZURE_AFRIKAANS_VOICES.female,
    };
  }

  return {
    locale: getAzureLocale(normalized),
    voice: getAzureVoice(normalized, gender),
  };
}

// ============================================================
// LANGUAGE HELPERS
// ============================================================

export function isAfrikaans(
  language?: string,
): boolean {
  return normalizeLanguage(language) === 'af';
}

export function getAfrikaansVoice(
  gender: 'male' | 'female',
): string {
  return gender === 'male'
    ? AZURE_AFRIKAANS_VOICES.male
    : AZURE_AFRIKAANS_VOICES.female;
}

// ============================================================
// REQUEST TYPES
// ============================================================

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
  mimeType?: string;
  success?: boolean;
}

// ============================================================
// API BASE URL
// ============================================================

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

// ============================================================
// HEADERS
// ============================================================

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// ============================================================
// TEXT CLEANING
// ============================================================

function cleanSpeechText(
  text: string,
): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// VALUE SAFETY
// ============================================================

function safeSpeed(
  speed?: number,
): number {
  const value =
    typeof speed === 'number'
      ? speed
      : 1;

  return Math.max(
    0.5,
    Math.min(2, value),
  );
}

function safeVolume(
  volume?: number,
): number {
  const value =
    typeof volume === 'number'
      ? volume
      : 1;

  return Math.max(
    0,
    Math.min(1, value),
  );
}

// ============================================================
// SYNTHESIS
// ============================================================

export async function synthesizeSpeech(
  request: SpeechRequest,
): Promise<SpeechResponse> {
  const text = cleanSpeechText(request.text);

  if (!text) {
    throw new Error(
      'No text was supplied for speech synthesis.',
    );
  }

  const language =
    normalizeLanguage(request.language);

  const gender =
    request.gender === 'male'
      ? 'male'
      : 'female';

  const voice =
    getAzureVoice(language, gender);

  const locale =
    getAzureLocale(language);

  // Afrikaans can ONLY use the two Azure Afrikaans voices.
  if (
    language === 'af' &&
    voice !== AZURE_AFRIKAANS_VOICES.male &&
    voice !== AZURE_AFRIKAANS_VOICES.female
  ) {
    throw new Error(
      'Invalid Afrikaans voice selected.',
    );
  }

  const baseUrl = getApiBaseUrl();

  const response = await fetch(
    `${baseUrl}/api/voice/synthesize`,
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        text,
        language,
        locale,
        voice,
        gender,
        speed: safeSpeed(request.speed),
        volume: safeVolume(request.volume),

        // Always neutral.
        pitch: 1,
      }),
    },
  );

  if (!response.ok) {
    let message =
      'Speech synthesis failed.';

    try {
      const data =
        await response.json();

      if (data?.error) {
        message = String(data.error);
      }
    } catch {
      // Keep default error.
    }

    throw new Error(message);
  }

  const data =
    (await response.json()) as SpeechResponse;

  return {
    ...data,

    voice:
      data.voice || voice,

    locale:
      data.locale || locale,
  };
}

// ============================================================
// AUDIO CONVERSION
// ============================================================

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
    const slice =
      byteCharacters.slice(
        offset,
        offset + 512,
      );

    const bytes =
      new Uint8Array(slice.length);

    for (
      let i = 0;
      i < slice.length;
      i += 1
    ) {
      bytes[i] =
        slice.charCodeAt(i);
    }

    byteArrays.push(bytes);
  }

  return new Blob(
    byteArrays,
    {
      type: mimeType,
    },
  );
}

// ============================================================
// CURRENT AUDIO
// ============================================================

let currentAudio:
  HTMLAudioElement | null = null;

let currentObjectUrl:
  string | null = null;

let speechGeneration = 0;

// ============================================================
// STOP SPEECH
// ============================================================

export function stopSpeech(): void {
  speechGeneration += 1;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
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

// ============================================================
// SPEAK
// ============================================================

export async function speak(
  text: string,
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  const cleanText =
    cleanSpeechText(text);

  if (!cleanText) {
    return;
  }

  stopSpeech();

  const myGeneration =
    speechGeneration;

  const merged: VoiceSettings = {
    ...DEFAULT_VOICE_SETTINGS,
    ...settings,
  };

  const language =
    normalizeLanguage(
      merged.preferredLanguage,
    );

  const gender =
    merged.voiceGender === 'male'
      ? 'male'
      : 'female';

  const result =
    await synthesizeSpeech({
      text: cleanText,
      language,
      gender,
      speed: merged.voiceSpeed,
      volume: merged.voiceVolume,
      pitch: 1,
    });

  if (
    myGeneration !==
    speechGeneration
  ) {
    return;
  }

  // ==========================================================
  // BASE64 AUDIO
  // ==========================================================

  if (result.audioBase64) {
    const blob =
      base64ToBlob(
        result.audioBase64,
        result.mimeType ||
          'audio/mpeg',
      );

    const objectUrl =
      URL.createObjectURL(blob);

    if (
      myGeneration !==
      speechGeneration
    ) {
      URL.revokeObjectURL(
        objectUrl,
      );

      return;
    }

    currentObjectUrl =
      objectUrl;

    const audio =
      new Audio(objectUrl);

    currentAudio =
      audio;

    audio.volume =
      safeVolume(
        merged.voiceVolume,
      );

    await new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        audio.onended = () => {
          if (
            currentAudio ===
            audio
          ) {
            currentAudio =
              null;
          }

          if (
            currentObjectUrl ===
            objectUrl
          ) {
            try {
              URL.revokeObjectURL(
                objectUrl,
              );
            } catch {
              // Ignore.
            }

            currentObjectUrl =
              null;
          }

          resolve();
        };

        audio.onerror = () => {
          if (
            currentAudio ===
            audio
          ) {
            currentAudio =
              null;
          }

          if (
            currentObjectUrl ===
            objectUrl
          ) {
            try {
              URL.revokeObjectURL(
                objectUrl,
              );
            } catch {
              // Ignore.
            }

            currentObjectUrl =
              null;
          }

          reject(
            new Error(
              'Unable to play generated speech.',
            ),
          );
        };

        if (
          myGeneration !==
          speechGeneration
        ) {
          resolve();
          return;
        }

        audio
          .play()
          .catch(reject);
      },
    );

    return;
    }
    // ==========================================================
  // AUDIO URL
  // ==========================================================

  if (result.audioUrl) {
    if (
      myGeneration !==
      speechGeneration
    ) {
      return;
    }

    const audio =
      new Audio(
        result.audioUrl,
      );

    currentAudio =
      audio;

    audio.volume =
      safeVolume(
        merged.voiceVolume,
      );

    await new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        audio.onended =
          () => {
            if (
              currentAudio ===
              audio
            ) {
              currentAudio =
                null;
            }

            resolve();
          };

        audio.onerror =
          () => {
            if (
              currentAudio ===
              audio
            ) {
              currentAudio =
                null;
            }

            reject(
              new Error(
                'Unable to play generated speech.',
              ),
            );
          };

        if (
          myGeneration !==
          speechGeneration
        ) {
          resolve();

          return;
        }

        audio
          .play()
          .catch(
            reject,
          );
      },
    );

    return;
  }

  throw new Error(
    'No audio was returned by the voice server.',
  );
}

// ============================================================
// AFRIKAANS SPEECH
// ============================================================

export async function speakAfrikaans(
  text: string,
  gender:
    | 'male'
    | 'female' = 'female',
  settings: Partial<VoiceSettings> = {},
): Promise<void> {
  return speak(
    text,
    {
      ...settings,

      // Force Afrikaans.
      preferredLanguage: 'af',

      voiceGender: gender,

      forceAfrikaansVoice: true,
    },
  );
}

// ============================================================
// SUPPORTED VOICES
// ============================================================

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

// ============================================================
// VOICE VALIDATION
// ============================================================

export function validateVoiceSelection(
  language: string,
  gender:
    | 'male'
    | 'female',
  selectedVoice?: string,
): string {
  const normalized =
    normalizeLanguage(
      language,
    );

  const expected =
    getAzureVoice(
      normalized,
      gender,
    );

  /*
   * Afrikaans is STRICT.
   *
   * No browser voice.
   * No Google voice.
   * No Gemini voice.
   * No English voice.
   * No unrelated voice.
   */
  if (
    normalized === 'af'
  ) {
    if (
      selectedVoice !==
        AZURE_AFRIKAANS_VOICES.male &&
      selectedVoice !==
        AZURE_AFRIKAANS_VOICES.female
    ) {
      return expected;
    }
  }

  /*
   * English and Spanish are also
   * restricted to configured Azure voices.
   */
  if (
    selectedVoice &&
    selectedVoice ===
      getAzureVoice(
        normalized,
        gender,
      )
  ) {
    return selectedVoice;
  }

  return expected;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  LANGUAGES,
  GENDER_VOICES,
  DEFAULT_VOICE_SETTINGS,
  AZURE_AFRIKAANS_VOICES,
  AZURE_VOICES,

  normalizeLanguage,
  getAzureLocale,
  getAzureVoice,
  getVoiceForLanguage,

  isAfrikaans,
  getAfrikaansVoice,

  synthesizeSpeech,
  speak,
  speakAfrikaans,
  stopSpeech,

  getSupportedVoiceNames,
  validateVoiceSelection,
};
