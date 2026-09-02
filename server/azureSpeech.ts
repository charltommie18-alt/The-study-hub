import { Router } from 'express';

const router = Router();

/*
 * ============================================================
 * AZURE SPEECH SERVER
 * ============================================================
 *
 * IMPORTANT:
 *
 * AZURE_SPEECH_KEY must NEVER be placed in the React app.
 *
 * Server environment variables:
 *
 * AZURE_SPEECH_KEY
 * AZURE_SPEECH_REGION
 *
 * Supported:
 *
 * Afrikaans = af-ZA
 * English   = en-US
 * Spanish   = es-ES
 *
 * Afrikaans:
 *
 * Male   = af-ZA-WillemNeural
 * Female = af-ZA-AdriNeural
 * ============================================================
 */

const AZURE_SPEECH_KEY =
  process.env.AZURE_SPEECH_KEY?.trim();

const AZURE_SPEECH_REGION =
  process.env.AZURE_SPEECH_REGION
    ?.trim()
    .toLowerCase();

const AZURE_SPEECH_API_VERSION =
  '2025-10-15';

const AFRIKAANS_VOICES = {
  male: 'af-ZA-WillemNeural',
  female: 'af-ZA-AdriNeural',
} as const;

const LANGUAGE_VOICES = {
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

type SupportedLocale =
  | 'af-ZA'
  | 'en-US'
  | 'es-ES';

type Gender =
  | 'male'
  | 'female';

// ============================================================
// NORMALIZE LANGUAGE
// ============================================================

function normalizeLocale(
  language?: string,
): SupportedLocale {
  const value =
    String(language || '')
      .toLowerCase()
      .trim();

  if (
    value === 'af' ||
    value.startsWith('af-') ||
    value.includes('afrikaans')
  ) {
    return 'af-ZA';
  }

  if (
    value === 'es' ||
    value.startsWith('es-') ||
    value.includes('spanish') ||
    value.includes('español')
  ) {
    return 'es-ES';
  }

  if (
    value === 'en' ||
    value.startsWith('en-') ||
    value.includes('english')
  ) {
    return 'en-US';
  }

  // Server safe default.
  return 'af-ZA';
}

// ============================================================
// NORMALIZE GENDER
// ============================================================

function normalizeGender(
  gender?: string,
): Gender {
  return String(gender || '')
    .toLowerCase()
    .trim() === 'male'
    ? 'male'
    : 'female';
}

// ============================================================
// SELECT AZURE VOICE
// ============================================================

function getAzureVoice(
  locale: SupportedLocale,
  gender: Gender,
): string {
  /*
   * AFRIKAANS IS STRICT.
   */
  if (locale === 'af-ZA') {
    return gender === 'male'
      ? AFRIKAANS_VOICES.male
      : AFRIKAANS_VOICES.female;
  }

  return LANGUAGE_VOICES[locale][gender];
}

// ============================================================
// CHECK AZURE CONFIGURATION
// ============================================================

function requireAzureConfig(): void {
  if (!AZURE_SPEECH_KEY) {
    throw new Error(
      'AZURE_SPEECH_KEY is not configured on the server.',
    );
  }

  if (!AZURE_SPEECH_REGION) {
    throw new Error(
      'AZURE_SPEECH_REGION is not configured on the server.',
    );
  }
}

// ============================================================
// ESCAPE XML
// ============================================================

function escapeXml(
  value: string,
): string {
  return String(value)
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&apos;',
    );
}

// ============================================================
// CLEAN TEXT
// ============================================================

function cleanText(
  value: unknown,
): string {
  return String(value || '')
    .replace(
      /\s+/g,
      ' ',
    )
    .trim();
}

// ============================================================
// SAFE SPEED
// ============================================================

function safeSpeed(
  value: unknown,
): number {
  const number =
    typeof value === 'number'
      ? value
      : Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 1;
  }

  return Math.max(
    0.5,
    Math.min(
      2,
      number,
    ),
  );
}

// ============================================================
// SPEED TO SSML RATE
// ============================================================

function speedToRate(
  speed: number,
): string {
  const percentage =
    Math.round(
      (speed - 1) * 100,
    );

  if (
    percentage === 0
  ) {
    return '0%';
  }

  return `${
    percentage > 0
      ? '+'
      : ''
  }${percentage}%`;
}

// ============================================================
// SAFE VOLUME
// ============================================================

function safeVolume(
  value: unknown,
): number {
  const number =
    typeof value === 'number'
      ? value
      : Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 1;
  }

  return Math.max(
    0,
    Math.min(
      1,
      number,
    ),
  );
}

// ============================================================
// VOLUME TO SSML
// ============================================================

function volumeToSsml(
  volume: number,
): string {
  if (volume <= 0) {
    return 'silent';
  }

  if (volume < 0.5) {
    return 'soft';
  }

  if (volume < 0.85) {
    return 'medium';
  }

  return 'loud';
}

// ============================================================
// POST /api/voice/synthesize
// ============================================================

router.post(
  '/voice/synthesize',
  async (
    req,
    res,
  ) => {
    try {
      requireAzureConfig();

      const text =
        cleanText(
          req.body?.text,
        );

      if (!text) {
        return res
          .status(400)
          .json({
            error:
              'No text was supplied for speech synthesis.',
          });
      }

      const locale =
        normalizeLocale(
          req.body?.language ||
            req.body?.locale,
        );

      const gender =
        normalizeGender(
          req.body?.gender,
        );

      /*
       * NEVER trust the voice name supplied
       * by the phone.
       *
       * The server selects the voice.
       */
      const voice =
        getAzureVoice(
          locale,
          gender,
        );

      const speed =
        safeSpeed(
          req.body?.speed,
        );

      const volume =
        safeVolume(
          req.body?.volume,
        );

      // Always neutral pitch.
      const pitch = '0%';

      const rate =
        speedToRate(
          speed,
        );

      const ssml =
        `<speak version="1.0" ` +
        `xmlns="http://www.w3.org/2001/10/synthesis" ` +
        `xmlns:mstts="http://www.w3.org/2001/mstts" ` +
        `xml:lang="${locale}">` +

        `<voice ` +
        `name="${escapeXml(voice)}" ` +
        `xml:lang="${locale}">` +

        `<prosody ` +
        `rate="${rate}" ` +
        `pitch="${pitch}" ` +
        `volume="${volumeToSsml(volume)}">` +

        `${escapeXml(text)}` +

        `</prosody>` +

        `</voice>` +

        `</speak>`;

      const endpoint =
        `https://${AZURE_SPEECH_REGION}` +
        `.tts.speech.microsoft.com` +
        `/cognitiveservices/v1`;

      const response =
        await fetch(
          endpoint,
          {
            method: 'POST',

            headers: {
              'Ocp-Apim-Subscription-Key':
                AZURE_SPEECH_KEY!,

              'Content-Type':
                'application/ssml+xml',

              'X-Microsoft-OutputFormat':
                'audio-16khz-128kbitrate-mono-mp3',

              Accept:
                'audio/mpeg',
            },

            body: ssml,
          },
        );

      if (!response.ok) {
        const errorText =
          await response
            .text()
            .catch(
              () => '',
            );

        console.error(
          'Azure TTS error:',
          response.status,
          errorText,
        );

        return res
          .status(502)
          .json({
            error:
              'Azure Speech synthesis failed.',
          });
      }

      const audioBuffer =
        Buffer.from(
          await response.arrayBuffer(),
        );

      if (
        audioBuffer.length ===
        0
      ) {
        return res
          .status(502)
          .json({
            error:
              'Azure returned empty audio.',
          });
      }

      return res.json({
        success: true,

        language: locale,

        locale,

        voice,

        gender,

        audioBase64:
          audioBuffer.toString(
            'base64',
          ),

        mimeType:
          'audio/mpeg',
      });
    } catch (error: any) {
      console.error(
        'Azure speech synthesis error:',
        error?.message ||
          error,
      );

      return res
        .status(500)
        .json({
          error:
            error?.message ||
            'Azure Speech synthesis failed.',
        });
    }
  },
);

// ============================================================
// POST /api/transcribe-audio
// ============================================================

router.post(
  '/transcribe-audio',
  async (
    req,
    res,
  ) => {
    try {
      requireAzureConfig();

      const audioData =
        req.body?.audioData;

      if (
        !audioData ||
        typeof audioData !==
          'string'
      ) {
        return res
          .status(400)
          .json({
            error:
              'No audio data was supplied.',
          });
      }

      /*
       * Accept:
       *
       * data:audio/webm;base64,...
       *
       * OR raw base64.
       */
      const match =
        audioData.match(
          /^data:([^;]+);base64,(.+)$/s,
        );

      let mimeType =
        String(
          req.body?.mimeType ||
            'audio/webm',
        );

      let base64 =
        audioData;

      if (match) {
        mimeType =
          match[1] ||
          mimeType;

        base64 =
          match[2];
      }

      // IMPORTANT: remove whitespace correctly.
      base64 =
        base64.replace(
          /\s/g,
          '',
        );

      if (!base64) {
        return res
          .status(400)
          .json({
            error:
              'Audio data is empty.',
          });
      }

      let audioBuffer:
        Buffer;

      try {
        audioBuffer =
          Buffer.from(
            base64,
            'base64',
          );
      } catch {
        return res
          .status(400)
          .json({
            error:
              'Invalid base64 audio data.',
          });
      }

      if (
        audioBuffer.length <
        100
      ) {
        return res
          .status(400)
          .json({
            error:
              'The audio recording is too short.',
          });
      }

      const locale =
        normalizeLocale(
          req.body?.targetLanguage ||
            req.body?.language,
        );

      /*
       * Azure Fast Transcription
       * uses multipart/form-data.
       */
      const form =
        new FormData();

      const audioBlob =
        new Blob(
          [audioBuffer],
          {
            type: mimeType,
          },
        );

      form.append(
        'audio',
        audioBlob,
        getAudioFilename(
          mimeType,
        ),
      );

      form.append(
        'definition',
        JSON.stringify({
          locales: [
            locale,
          ],
        }),
      );

      const endpoint =
        `https://${AZURE_SPEECH_REGION}` +
        `.api.cognitive.microsoft.com` +
        `/speechtotext/transcriptions:transcribe` +
        `?api-version=${AZURE_SPEECH_API_VERSION}`;

      const response =
        await fetch(
          endpoint,
          {
            method: 'POST',

            headers: {
              'Ocp-Apim-Subscription-Key':
                AZURE_SPEECH_KEY!,
            },

            body: form,
          },
        );

      const responseText =
        await response.text();

      if (!response.ok) {
        console.error(
          'Azure STT error:',
          response.status,
          responseText,
        );

        return res
          .status(502)
          .json({
            error:
              'Azure Speech transcription failed.',
          });
      }

      let data: any;

      try {
        data =
          JSON.parse(
            responseText,
          );
      } catch {
        return res
          .status(502)
          .json({
            error:
              'Azure returned an invalid transcription response.',
          });
      }

      const combined =
        Array.isArray(
          data?.combinedPhrases,
        )
          ? data.combinedPhrases
              .map(
                (
                  item: any,
                ) =>
                  typeof item?.text ===
                  'string'
                    ? item.text
                    : '',
              )
              .filter(
                Boolean,
              )
              .join(' ')
          : '';

      const phrases =
        Array.isArray(
          data?.phrases,
        )
          ? data.phrases
              .map(
                (
                  item: any,
                ) =>
                  typeof item?.text ===
                  'string'
                    ? item.text
                    : '',
              )
              .filter(
                Boolean,
              )
              .join(' ')
          : '';

      const transcript =
        cleanText(
          combined ||
            phrases,
        );

      const finalTranscript =
        removeRepeatedText(
          transcript,
        );

      return res.json({
        success: true,

        transcript:
          finalTranscript,

        language:
          locale,

        locale,
      });
    } catch (error: any) {
      console.error(
        'Azure transcription error:',
        error?.message ||
          error,
      );

      return res
        .status(500)
        .json({
          error:
            error?.message ||
            'Azure Speech transcription failed.',
        });
    }
  },
);
// ============================================================
// AUDIO FILENAME
// ============================================================

function getAudioFilename(
  mimeType: string,
): string {
  const value =
    String(
      mimeType || '',
    ).toLowerCase();

  if (
    value.includes('webm')
  ) {
    return 'recording.webm';
  }

  if (
    value.includes('ogg')
  ) {
    return 'recording.ogg';
  }

  if (
    value.includes('mp4')
  ) {
    return 'recording.mp4';
  }

  if (
    value.includes('mpeg') ||
    value.includes('mp3')
  ) {
    return 'recording.mp3';
  }

  if (
    value.includes('wav')
  ) {
    return 'recording.wav';
  }

  return 'recording.webm';
}

// ============================================================
// REMOVE REPEATED TRANSCRIPT
// ============================================================

function removeRepeatedText(
  text: string,
): string {
  const clean =
    cleanText(text);

  if (!clean) {
    return '';
  }

  /*
   * Example:
   *
   * "Kan jy my hoor Kan jy my hoor"
   *
   * becomes:
   *
   * "Kan jy my hoor"
   */

  const words =
    clean.split(' ');

  if (
    words.length >= 4 &&
    words.length % 2 ===
      0
  ) {
    const half =
      words.length / 2;

    const first =
      words
        .slice(
          0,
          half,
        )
        .join(' ');

    const second =
      words
        .slice(
          half,
        )
        .join(' ');

    if (
      first.toLowerCase() ===
      second.toLowerCase()
    ) {
      return first;
    }
  }

  return clean;
}

// ============================================================
// HEALTH CHECK
// ============================================================

router.get(
  '/voice/health',
  (
    _req,
    res,
  ) => {
    res.json({
      service:
        'Azure Speech',

      configured:
        Boolean(
          AZURE_SPEECH_KEY &&
            AZURE_SPEECH_REGION,
        ),

      supportedLanguages: [
        'af-ZA',
        'en-US',
        'es-ES',
      ],

      afrikaansVoices: {
        male:
          AFRIKAANS_VOICES.male,

        female:
          AFRIKAANS_VOICES.female,
      },
    });
  },
);

// ============================================================
// EXPORT ROUTER
// ============================================================

export default router;
