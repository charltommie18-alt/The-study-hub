import { Capacitor } from '@capacitor/core';

export type RecognitionLanguage =
  | 'en-US'
  | 'af-ZA'
  | 'es-ES';

export interface VoiceRecognitionResult {
  text: string;
  final: boolean;
  confidence?: number;
}

export interface VoiceRecognitionOptions {
  language?: RecognitionLanguage;
  onResult?: (
    result: VoiceRecognitionResult,
  ) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart:
    | (() => void)
    | null;

  onresult:
    | ((event: any) => void)
    | null;

  onerror:
    | ((event: any) => void)
    | null;

  onend:
    | (() => void)
    | null;
}

class VoiceInputController {
  private recognition:
    | SpeechRecognitionInstance
    | null = null;

  private listening = false;

  private stopping = false;

  private options:
    VoiceRecognitionOptions = {};

  private finalText = '';

  /*
   * Prevent the same browser recognition result
   * from being delivered more than once.
   */
  private lastDeliveredText = '';

  /*
   * Prevent repeated final transcripts from being
   * appended to the conversation.
   */
  private lastFinalText = '';

  /*
   * Used to ignore late events from an old
   * recognition session after stop/abort.
   */
  private sessionId = 0;

  get isListening(): boolean {
    return this.listening;
  }

  private getSpeechRecognitionConstructor(): any {
    if (typeof window === 'undefined') {
      return null;
    }

    const win = window as any;

    return (
      win.SpeechRecognition ||
      win.webkitSpeechRecognition ||
      null
    );
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    /*
     * Capacitor Android/iOS WebViews can expose
     * browser SpeechRecognition differently.
     *
     * Do not claim support merely because the app
     * is native. We need the actual constructor.
     */
    return Boolean(
      this.getSpeechRecognitionConstructor(),
    );
  }

  async start(
    options: VoiceRecognitionOptions = {},
  ): Promise<boolean> {
    /*
     * Never start a second microphone session.
     */
    if (this.listening) {
      return true;
    }

    /*
     * Clean up any old recognition object before
     * starting a new session.
     */
    this.cleanupRecognition();

    this.options = {
      ...options,
      language:
        options.language || 'en-US',
    };

    this.finalText = '';

    this.lastDeliveredText = '';

    this.lastFinalText = '';

    this.stopping = false;

    /*
     * Every start gets a new session ID.
     */
    this.sessionId += 1;

    const currentSession =
      this.sessionId;

    const Recognition =
      this.getSpeechRecognitionConstructor();

    if (!Recognition) {
      const error = new Error(
        'Speech recognition is not available on this device.',
      );

      this.options.onError?.(error);

      return false;
    }

    try {
      const recognition =
        new Recognition();

      this.recognition =
        recognition;

      /*
       * One user request = one recognition session.
       *
       * This is deliberately NOT continuous.
       */
      recognition.continuous = false;

      /*
       * Interim results allow the UI to show
       * what the user is currently saying.
       */
      recognition.interimResults = true;

      /*
       * Explicitly force the selected language.
       *
       * Afrikaans MUST be:
       * af-ZA
       */
      recognition.lang =
        this.options.language ||
        'en-US';

      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (
          currentSession !==
          this.sessionId
        ) {
          return;
        }

        this.listening = true;

        this.stopping = false;

        this.options.onStart?.();
      };

      recognition.onresult = (
        event: any,
      ) => {
        if (
          currentSession !==
          this.sessionId
        ) {
          return;
        }

        if (this.stopping) {
          return;
        }

        let interimText = '';

        let newFinalText = '';

        const resultIndex =
          typeof event?.resultIndex ===
          'number'
            ? event.resultIndex
            : 0;

        const results =
          event?.results;

        if (!results) {
          return;
        }

        for (
          let i = resultIndex;
          i < results.length;
          i += 1
        ) {
          const result =
            results[i];

          const transcript =
            result?.[0]?.transcript
              ?.trim() || '';

          if (!transcript) {
            continue;
          }

          if (result.isFinal) {
            newFinalText +=
              `${transcript} `;
          } else {
            interimText +=
              `${transcript} `;
          }
        }

        newFinalText =
          this.normalizeText(
            newFinalText,
          );

        interimText =
          this.normalizeText(
            interimText,
          );

        /*
         * Do not append the exact same final
         * transcript twice.
         */
        if (
          newFinalText &&
          newFinalText !==
            this.lastFinalText
        ) {
          this.finalText =
            this.combineWithoutDuplicate(
              this.finalText,
              newFinalText,
            );

          this.lastFinalText =
            newFinalText;
        }

        const combined =
          this.normalizeText(
            [
              this.finalText,
              interimText,
            ]
              .filter(Boolean)
              .join(' '),
          );

        if (!combined) {
          return;
        }

        /*
         * Do not send identical text to the
         * application twice.
         */
        if (
          combined ===
          this.lastDeliveredText
        ) {
          return;
        }

        this.lastDeliveredText =
          combined;

        const confidence =
          this.getConfidence(
            event,
          );

        this.options.onResult?.({
          text: combined,
          final:
            Boolean(newFinalText),
          confidence,
        });

        /*
         * Once a final result is received, stop
         * the microphone immediately.
         *
         * This prevents the microphone from
         * staying active and hearing the user's
         * next words as part of the same command.
         */
        if (newFinalText) {
          this.stop();
        }
      };

      recognition.onerror = (
        event: any,
      ) => {
        if (
          currentSession !==
          this.sessionId
        ) {
          return;
        }

        const errorCode =
          event?.error ||
          'unknown';

        /*
         * These are normal when the user
         * intentionally stops or when the
         * browser ends a one-shot session.
         */
        if (
          errorCode === 'aborted' ||
          errorCode === 'no-speech' ||
          errorCode === 'audio-capture' ||
          this.stopping
        ) {
          return;
        }

        const error =
          new Error(
            `Speech recognition error: ${errorCode}`,
          );

        this.options.onError?.(
          error,
        );
      };

      recognition.onend = () => {
        if (
          currentSession !==
          this.sessionId
        ) {
          return;
        }

        this.listening = false;

        this.stopping = false;

        /*
         * Detach the old recognition object
         * immediately so it cannot receive more
         * events.
         */
        if (
          this.recognition ===
          recognition
        ) {
          this.recognition = null;
        }

        this.options.onEnd?.();
      };

      recognition.start();

      return true;
    } catch (error) {
      if (
        currentSession ===
        this.sessionId
      ) {
        this.listening = false;

        this.stopping = false;

        this.recognition = null;
      }

      const normalized =
        error instanceof Error
          ? error
          : new Error(
              'Unable to start speech recognition.',
            );

      this.options.onError?.(
        normalized,
      );

      return false;
    }
  }

  stop(): void {
    const recognition =
      this.recognition;

    /*
     * Mark stopping BEFORE calling stop().
     * This prevents late events from being
     * treated as new user speech.
     */
    this.stopping = true;

    this.listening = false;

    if (!recognition) {
      this.options.onEnd?.();

      return;
    }

    /*
     * Detach the active reference immediately.
     */
    this.recognition = null;

    try {
      recognition.stop();
    } catch {
      try {
        recognition.abort();
      } catch {
        // Ignore browser cleanup errors.
      }
    }
  }

  abort(): void {
    this.stopping = true;

    this.listening = false;

    /*
     * Invalidate all callbacks belonging to
     * the previous recognition session.
     */
    this.sessionId += 1;

    const recognition =
      this.recognition;

    this.recognition = null;

    if (recognition) {
      try {
        recognition.abort();
      } catch {
        // Ignore browser cleanup errors.
      }
    }

    /*
     * Clear handlers so an old recognition
     * instance cannot call the application.
     */
    if (recognition) {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    }

    this.stopping = false;

    this.options.onEnd?.();
  }

  reset(): void {
    this.abort();

    this.finalText = '';

    this.lastDeliveredText = '';

    this.lastFinalText = '';

    this.options = {};
  }

  private cleanupRecognition(): void {
    const recognition =
      this.recognition;

    this.recognition = null;

    if (!recognition) {
      return;
    }

    try {
      recognition.abort();
    } catch {
      // Ignore cleanup errors.
    }

    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
  }

  private normalizeText(
    text: string,
  ): string {
    return text
      .replace(/\s+/g, ' ')
      .trim();
  }

  private combineWithoutDuplicate(
    existing: string,
    incoming: string,
  ): string {
    const current =
      this.normalizeText(
        existing,
      );

    const next =
      this.normalizeText(
        incoming,
      );

    if (!current) {
      return next;
    }

    if (!next) {
      return current;
    }

    /*
     * Exact duplicate.
     */
    if (current === next) {
      return current;
    }

    /*
     * Browser sometimes sends:
     *
     * "Hallo"
     *
     * followed by:
     *
     * "Hallo wêreld"
     *
     * Do not produce:
     *
     * "Hallo Hallo wêreld"
     */
    if (
      next.startsWith(
        `${current} `,
      )
    ) {
      return next;
    }

    /*
     * Or the reverse:
     *
     * existing = "Hallo wêreld"
     * incoming = "Hallo"
     */
    if (
      current.startsWith(
        `${next} `,
      )
    ) {
      return current;
    }

    return this.normalizeText(
      `${current} ${next}`,
    );
  }

  private getConfidence(
    event: any,
  ): number | undefined {
    try {
      const index =
        typeof event?.resultIndex ===
        'number'
          ? event.resultIndex
          : 0;

      const confidence =
        event?.results?.[index]?.[0]
          ?.confidence;

      return typeof confidence ===
        'number'
        ? confidence
        : undefined;
    } catch {
      return undefined;
    }
  }
}

export const voiceInput =
  new VoiceInputController();

export function getRecognitionLanguage(
  language: string,
): RecognitionLanguage {
  const value =
    String(language || '')
      .toLowerCase()
      .trim();

  /*
   * Afrikaans is explicitly South African.
   */
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

export default voiceInput;
