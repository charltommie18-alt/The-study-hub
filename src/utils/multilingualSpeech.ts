
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
//
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

  voiceGender:
    | 'male'
    | 'female';

  voiceSpeed: number;

  autoReadAiResponses: boolean;

  /*
   * Kept for compatibility with existing
   * app settings.
   *
   * Azure speech is always sent with pitch
   * controlled by the server.
   *
   * The UI no longer exposes a Deep/Normal/High
   * voice control.
   */
  voicePitch: number;

  voiceVolume: number;

  /*
   * Kept as an optional compatibility property.
   *
   * It is NEVER trusted for Afrikaans.
   */
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
  Record<
    'male' | 'female',
    string
  >
> = {
  af: {
    male:
      AZURE_AFRIKAANS_VOICES.male,

    female:
      AZURE_AFRIKAANS_VOICES.female,
  },

  en: {
    male:
      'en-US-GuyNeural',

    female:
      'en-US-JennyNeural',
  },

  es: {
    male:
      'es-ES-AlvaroNeural',

    female:
      'es-ES-ElviraNeural',
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

  const value =
    String(language)
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

  /*
   * Unknown language must not accidentally
   * select a random browser voice.
   *
   * Afrikaans is the app's safe default.
   */
  return 'af';
}

// ============================================================
// AZURE LOCALE
// ============================================================

export function getAzureLocale(
  language?: string,
): 'af-ZA' | 'en-US' | 'es-ES' {
  const normalized =
    normalizeLanguage(language);

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
  gender:
    | 'male'
    | 'female' = 'female',
): string {
  const normalized =
    normalizeLanguage(language);

  /*
   * Afrikaans is explicitly locked to
   * the two South African Azure neural voices.
   */
  if (normalized === 'af') {
    return gender === 'male'
      ? AZURE_AFRIKAANS_VOICES.male
      : AZURE_AFRIKAANS_VOICES.female;
  }

  return (
    AZURE_VOICES[
      normalized
    ]?.[gender] ||
    AZURE_VOICES.en.female
  );
}

// ============================================================
// VOICE + LOCALE
// ============================================================

export function getVoiceForLanguage(
  language?: string,
  gender:
    | 'male'
    | 'female' = 'female',
): {
  locale: string;
  voice: string;
} {
  const normalized =
    normalizeLanguage(language);

  /*
   * Afrikaans must always use af-ZA.
   */
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
    locale:
      getAzureLocale(
        normalized,
      ),

    voice:
      getAzureVoice(
        normalized,
        gender,
      ),
  };
}

// ============================================================
// LANGUAGE HELPERS
// ============================================================

export function isAfrikaans(
  language?: string,
): boolean {
  return (
    normalizeLanguage(language) ===
    'af'
  );
}

export function getAfrikaansVoice(
  gender:
    | 'male'
    | 'female',
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

  gender?:
    | 'male'
    | 'female';

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

// ============================================================
// API BASE URL
// ============================================================

function getApiBaseUrl(): string {
  const configured =
    typeof import.meta !==
      'undefined'
      ? (import.meta as any)
          .env?.VITE_API_URL
      : undefined;

  if (configured) {
    return String(
      configured,
    ).replace(
      /\/+$/,
      '',
    );
  }

  if (
    typeof window !==
      'undefined' &&
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
    'Content-Type':
      'application/json',

    Accept:
      'application/json',
  };
}

// ============================================================
// TEXT CLEANING
// ============================================================

function cleanSpeechText(
  text: string,
): string {
  return String(text || '')
    .replace(
      /\s+/g,
      ' ',
    )
    .trim();
}

// ============================================================
// VALUE SAFETY
// ============================================================

function safeSpeed(
  speed?: number,
): number {
  const value =
    typeof speed ===
    'number'
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
    typeof volume ===
    'number'
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
  const text =
    cleanSpeechText(
      request.text,
    );

  if (!text) {
    throw new Error(
      'No text was supplied for speech synthesis.',
    );
  }

  /*
   * Normalize language FIRST.
   */
  const language =
    normalizeLanguage(
      request.language,
    );

  const gender =
    request.gender === 'male'
      ? 'male'
      : 'female';

  /*
   * Select the Azure voice from the
   * normalized language and gender.
   */
  const voice =
    getAzureVoice(
      language,
      gender,
    );

  /*
   * Select the matching Azure locale.
   */
  const locale =
    getAzureLocale(
      language,
    );

  /*
   * Safety check:
   *
   * If Afrikaans is selected, the voice
   * MUST be one of these two voices.
   */
  if (
    language === 'af' &&
    voice !==
      AZURE_AFRIKAANS_VOICES.male &&
    voice !==
      AZURE_AFRIKAANS_VOICES.female
  ) {
    throw new Error(
      'Invalid Afrikaans voice selected.',
    );
  }

  const baseUrl =
    getApiBaseUrl();

  const response =
    await fetch(
      `${baseUrl}/api/voice/synthesize`,
      {
        method: 'POST',

        headers:
          buildHeaders(),

        body: JSON.stringify({
          text,

          language,

          locale,

          voice,

          gender,

          speed:
            safeSpeed(
              request.speed,
            ),

          volume:
            safeVolume(
              request.volume,
            ),

          /*
           * Keep pitch neutral.
           *
           * The previous Deep/Normal/High
           * UI is removed.
           */
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
        message =
          String(
            data.error,
          );
      }
    } catch {
      // Keep default error.
    }

    throw new Error(
      message,
    );
  }

  const data =
    (await response.json()) as SpeechResponse;

  return {
    ...data,

    voice:
      data.voice ||
      voice,

    locale:
      data.locale ||
      locale,
  };
}

// ============================================================
// AUDIO CONVERSION
// ============================================================

function base64ToBlob(
  base64: string,
  mimeType =
    'audio/mpeg',
): Blob {
  const byteCharacters =
    atob(base64);

  const byteArrays:
    Uint8Array[] = [];

  for (
    let offset = 0;
    offset <
    byteCharacters.length;
    offset += 512
  ) {
    const slice =
      byteCharacters.slice(
        offset,
        offset + 512,
      );

    const bytes =
      new Uint8Array(
        slice.length,
      );

    for (
      let i = 0;
      i < slice.length;
      i += 1
    ) {
      bytes[i] =
        slice.charCodeAt(i);
    }

    byteArrays.push(
      bytes,
    );
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
  HTMLAudioElement | null =
  null;

let currentObjectUrl:
  string | null = null;

/*
 * Every speech request receives a unique
 * generation number.
 *
 * This prevents an old request from starting
 * after a newer request has already started.
 */
let speechGeneration = 0;

// ============================================================
// STOP SPEECH
// ============================================================

export function stopSpeech(): void {
  /*
   * Invalidate all previous speech requests.
   */
  speechGeneration += 1;

  if (currentAudio) {
    try {
      currentAudio.pause();

      currentAudio.currentTime =
        0;

      currentAudio.src = '';
    } catch {
      // Ignore.
    }

    currentAudio.onended =
      null;

    currentAudio.onerror =
      null;

    currentAudio =
      null;
  }

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(
        currentObjectUrl,
      );
    } catch {
      // Ignore.
    }

    currentObjectUrl =
      null;
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

  /*
   * Stop any currently playing audio.
   */
  stopSpeech();

  /*
   * Capture this request's generation.
   */
  const myGeneration =
    speechGeneration;

  const merged:
    VoiceSettings = {
      ...DEFAULT_VOICE_SETTINGS,
      ...settings,
    };

  const language =
    normalizeLanguage(
      merged.preferredLanguage,
    );

  const gender =
    merged.voiceGender ===
    'male'
      ? 'male'
      : 'female';

  /*
   * Afrikaans is explicitly forced
   * to the selected Azure Afrikaans voice.
   */
  const result =
    await synthesizeSpeech({
      text: cleanText,

      language,

      gender,

      speed:
        merged.voiceSpeed,

      volume:
        merged.voiceVolume,

      pitch: 1,
    });

  /*
   * The user may have pressed Stop while
   * Azure was generating the audio.
   *
   * If so, DO NOT play the old result.
   */
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
      );

    const objectUrl =
      URL.createObjectURL(
        blob,
      );

    /*
     * Another request could have started
     * between blob creation and assignment.
     */
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
      new Audio(
        objectUrl,
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

        audio.onerror =
          () => {
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

        /*
         * Do not play an obsolete request.
         */
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

  // ==========================================================
  // AUDIO URL
  // ==========================================================

  if (result.audioUrl) {
    /*
     * Do not play an old request.
     */
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

      /*
       * Never allow the caller to accidentally
       * use English or another language here.
       */
      preferredLanguage:
        'af',

      voiceGender:
        gender,

      forceAfrikaansVoice:
        true,
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
   * No browser voice,
   * Google voice,
   * Gemini voice,
   * English voice,
   * or unrelated voice
   * may be accepted.
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
   * restricted to their configured
   * Azure voices.
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

// ========================================
// ============================================================
// REQUEST TYPES
// ============================================================

export interface SpeechRequest {
  text: string;

  language?: string;

  gender?:
    | 'male'
    | 'female';

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

// ============================================================
// API BASE URL
// ============================================================

function getApiBaseUrl(): string {
  const configured =
    typeof import.meta !==
      'undefined'
      ? (import.meta as any)
          .env?.VITE_API_URL
      : undefined;

  if (configured) {
    return String(
      configured,
    ).replace(
      /\/+$/,
      '',
    );
  }

  if (
    typeof window !==
      'undefined' &&
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
    'Content-Type':
      'application/json',

    Accept:
      'application/json',
  };
}

// ============================================================
// TEXT CLEANING
// ============================================================

function cleanSpeechText(
  text: string,
): string {
  return String(text || '')
    .replace(
      /\s+/g,
      ' ',
    )
    .trim();
}

// ============================================================
// VALUE SAFETY
// ============================================================

function safeSpeed(
  speed?: number,
): number {
  const value =
    typeof speed ===
    'number'
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
    typeof volume ===
    'number'
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
  const text =
    cleanSpeechText(
      request.text,
    );

  if (!text) {
    throw new Error(
      'No text was supplied for speech synthesis.',
    );
  }

  /*
   * Normalize language FIRST.
   */
  const language =
    normalizeLanguage(
      request.language,
    );

  const gender =
    request.gender === 'male'
      ? 'male'
      : 'female';

  /*
   * Select Azure voice from language
   * and gender.
   */
  const voice =
    getAzureVoice(
      language,
      gender,
    );

  /*
   * Select matching Azure locale.
   */
  const locale =
    getAzureLocale(
      language,
    );

  /*
   * HARD SAFETY CHECK FOR AFRIKAANS.
   */
  if (
    language === 'af' &&
    voice !==
      AZURE_AFRIKAANS_VOICES.male &&
    voice !==
      AZURE_AFRIKAANS_VOICES.female
  ) {
    throw new Error(
      'Invalid Afrikaans voice selected.',
    );
  }

  const baseUrl =
    getApiBaseUrl();

  const response =
    await fetch(
      `${baseUrl}/api/voice/synthesize`,
      {
        method: 'POST',

        headers:
          buildHeaders(),

        body: JSON.stringify({
          text,

          language,

          locale,

          /*
           * The server also validates the
           * voice. Never put an Azure key here.
           */
          voice,

          gender,

          speed:
            safeSpeed(
              request.speed,
            ),

          volume:
            safeVolume(
              request.volume,
            ),

          /*
           * Keep pitch neutral.
           * No Deep/Normal/High voice control.
           */
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
        message =
          String(
            data.error,
          );
      }
    } catch {
      // Keep default message.
    }

    throw new Error(
      message,
    );
  }

  const data =
    (await response.json()) as SpeechResponse;

  return {
    ...data,

    voice:
      data.voice ||
      voice,

    locale:
      data.locale ||
      locale,
  };
}

// ============================================================
// AUDIO CONVERSION
// ============================================================

function base64ToBlob(
  base64: string,
  mimeType =
    'audio/mpeg',
): Blob {
  const byteCharacters =
    atob(base64);

  const byteArrays:
    Uint8Array[] = [];

  for (
    let offset = 0;
    offset <
    byteCharacters.length;
    offset += 512
  ) {
    const slice =
      byteCharacters.slice(
        offset,
        offset + 512,
      );

    const bytes =
      new Uint8Array(
        slice.length,
      );

    for (
      let i = 0;
      i < slice.length;
      i += 1
    ) {
      bytes[i] =
        slice.charCodeAt(i);
    }

    byteArrays.push(
      bytes,
    );
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
  HTMLAudioElement | null =
  null;

let currentObjectUrl:
  string | null = null;

/*
 * Every speech request receives a unique
 * generation number.
 *
 * This prevents an old Azure response
 * from playing after a newer request.
 */
let speechGeneration = 0;

// ============================================================
// STOP SPEECH
// ============================================================

export function stopSpeech(): void {
  /*
   * Invalidate previous speech requests.
   */
  speechGeneration += 1;

  if (currentAudio) {
    try {
      currentAudio.pause();

      currentAudio.currentTime =
        0;

      currentAudio.src = '';
    } catch {
      // Ignore cleanup errors.
    }

    currentAudio.onended =
      null;

    currentAudio.onerror =
      null;

    currentAudio =
      null;
  }

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(
        currentObjectUrl,
      );
    } catch {
      // Ignore cleanup errors.
    }

    currentObjectUrl =
      null;
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

  /*
   * Stop currently playing speech.
   */
  stopSpeech();

  /*
   * Capture this request generation.
   */
  const myGeneration =
    speechGeneration;

  const merged:
    VoiceSettings = {
      ...DEFAULT_VOICE_SETTINGS,
      ...settings,
    };

  const language =
    normalizeLanguage(
      merged.preferredLanguage,
    );

  const gender =
    merged.voiceGender ===
    'male'
      ? 'male'
      : 'female';

  /*
   * Always select the voice from the
   * language and gender.
   */
  const result =
    await synthesizeSpeech({
      text: cleanText,

      language,

      gender,

      speed:
        merged.voiceSpeed,

      volume:
        merged.voiceVolume,

      /*
       * Always neutral.
       */
      pitch: 1,
    });

  /*
   * User may have pressed Stop while
   * Azure was generating audio.
   */
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
      );

    const objectUrl =
      URL.createObjectURL(
        blob,
      );

    /*
     * Do not play obsolete audio.
     */
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
      new Audio(
        objectUrl,
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

        audio.onerror =
          () => {
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
          .catch(
            reject,
          );
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

      /*
       * HARD-LOCK this function to Afrikaans.
       */
      preferredLanguage:
        'af',

      voiceGender:
        gender,

      forceAfrikaansVoice:
        true,
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
   * AFRIKAANS MUST ONLY USE AZURE
   * AFRIKAANS VOICES.
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
   * English and Spanish are also restricted
   * to the configured Azure voices.
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

  getAfrikaansVoice,

  getVoiceForLanguage,

  isAfrikaans,

  synthesizeSpeech,

  speak,

  speakAfrikaans,

  stopSpeech,

  getSupportedVoiceNames,

  validateVoiceSelection,
};
