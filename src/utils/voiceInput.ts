import { getSpeechLocale } from './language';

type SpeechSDKLike = any;

type ActiveSession = {
  id: number;
  recognizer: any;
  audioConfig: any;
  speechConfig: any;
  settled: boolean;
};

let activeSession: ActiveSession | null = null;
let sessionId = 0;

function getSpeechSDK(): SpeechSDKLike | null {
  return typeof window !== 'undefined'
    ? (window as any).SpeechSDK || null
    : null;
}

async function getAuthorization(): Promise<{ token: string; region: string }> {
  const response = await fetch('/api/speech-token', {
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Azure Speech authorization failed.';
    try {
      const data = await response.json();
      message = data?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export function isVoiceInputSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!getSpeechSDK() &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

/**
 * Completely terminate the current microphone session.
 *
 * IMPORTANT:
 * We close BOTH the recognizer AND AudioConfig.
 * Closing only the recognizer can leave the microphone active
 * on some Android/Chrome combinations.
 */
export function stopVoiceInput(): void {
  sessionId++;

  const old = activeSession;
  activeSession = null;

  if (!old) return;

  old.settled = true;

  try {
    old.recognizer.stopContinuousRecognitionAsync?.(
      () => {},
      () => {}
    );
  } catch {}

  try {
    old.recognizer.close();
  } catch {}

  try {
    old.audioConfig?.close?.();
  } catch {}

  try {
    old.speechConfig?.close?.();
  } catch {}
}

/**
 * Remove duplicated mobile speech-recognition artifacts.
 *
 * Example:
 * "kan kan jy kan jy my kan jy my"
 * becomes:
 * "kan jy my"
 */
function cleanDuplicateSpeech(text: string): string {
  let value = text
    .replace(/\s+/g, ' ')
    .trim();

  if (!value) return '';

  // Remove immediately repeated words:
  // "kan kan jy jy my" -> "kan jy my"
  value = value.replace(
    /\b(\S+)(?:\s+\1\b)+/gi,
    '$1'
  );

  // Remove repeated short phrases.
  // Example:
  // "kan jy my kan jy my" -> "kan jy my"
  const words = value.split(/\s+/);

  for (let size = Math.min(8, Math.floor(words.length / 2)); size >= 2; size--) {
    let changed = true;

    while (changed) {
      changed = false;

      for (let i = 0; i + size * 2 <= words.length; i++) {
        const first = words.slice(i, i + size).join(' ').toLowerCase();
        const second = words
          .slice(i + size, i + size * 2)
          .join(' ')
          .toLowerCase();

        if (first === second) {
          words.splice(i + size, size);
          changed = true;
          break;
        }
      }
    }
  }

  return words.join(' ').trim();
}
/**
 * Azure Speech single-shot recognition.
 *
 * One microphone press = one utterance.
 * No continuous recognition.
 * No interim results.
 * No result accumulation.
 */
export async function recognizeOneUtterance(
  language?: string
): Promise<string> {
  if (!isVoiceInputSupported()) {
    throw new Error('Azure Speech is not available in this browser.');
  }

  // Kill anything left over from a previous session.
  stopVoiceInput();

  const myId = ++sessionId;
  const sdk = getSpeechSDK();

  if (!sdk) {
    throw new Error('Speech SDK is not loaded.');
  }

  const { token, region } = await getAuthorization();

  // User may have pressed Submit/Stop while the token was loading.
  if (myId !== sessionId) return '';

  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
    token,
    region
  );

  speechConfig.speechRecognitionLanguage =
    language || getSpeechLocale();

  // Short silence ends the question.
  try {
    speechConfig.setProperty(
      sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs,
      '900'
    );
  } catch {}

  const audioConfig =
    sdk.AudioConfig.fromDefaultMicrophoneInput();

  const recognizer = new sdk.SpeechRecognizer(
    speechConfig,
    audioConfig
  );

  const session: ActiveSession = {
    id: myId,
    recognizer,
    audioConfig,
    speechConfig,
    settled: false,
  };

  activeSession = session;

  return new Promise((resolve, reject) => {
    const finish = (
      text = '',
      error?: Error
    ) => {
      if (session.settled) return;

      session.settled = true;

      if (activeSession === session) {
        activeSession = null;
      }

      // IMPORTANT:
      // Shut down the recognizer FIRST.
      try {
        recognizer.close();
      } catch {}

      // IMPORTANT:
      // Release the actual microphone/audio source.
      try {
        audioConfig?.close?.();
      } catch {}

      try {
        speechConfig?.close?.();
      } catch {}

      // Ignore callbacks from an old session.
      if (myId !== sessionId) {
        resolve('');
        return;
      }

      if (error) {
        reject(error);
        return;
      }

      resolve(cleanDuplicateSpeech(text));
    };

    try {
      recognizer.recognizeOnceAsync(
        (result: any) => {
          if (myId !== sessionId || session.settled) {
            return;
          }

          if (
            result?.reason ===
            sdk.ResultReason?.RecognizedSpeech
          ) {
            const text = result?.text || '';

            // STOP + DISPOSE happens BEFORE returning text.
            finish(text);
          } else if (
            result?.reason ===
            sdk.ResultReason?.NoMatch
          ) {
            finish('');
          } else {
            const details =
              sdk.CancellationDetails?.fromResult?.(result);

            finish(
              '',
              new Error(
                details?.errorDetails ||
                  'Speech was not recognized.'
              )
            );
          }
        },

        (error: any) => {
          finish(
            '',
            error instanceof Error
              ? error
              : new Error(
                  String(
                    error || 'Speech recognition failed.'
                  )
                )
          );
        }
      );
    } catch (error) {
      finish(
        '',
        error instanceof Error
          ? error
          : new Error('Could not start microphone.')
      );
    }
  });
            }
