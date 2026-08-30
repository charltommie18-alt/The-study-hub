import { Capacitor } from '@capacitor/core';

export type RecognitionLanguage = 'en-US' | 'af-ZA' | 'es-ES';

export interface VoiceRecognitionResult {
  text: string;
  final: boolean;
  confidence?: number;
}

export interface VoiceRecognitionOptions {
  language?: RecognitionLanguage;
  onResult?: (result: VoiceRecognitionResult) => void;
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
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

class VoiceInputController {
  private recognition: SpeechRecognitionInstance | null = null;
  private listening = false;
  private stopping = false;
  private options: VoiceRecognitionOptions = {};
  private finalText = '';

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

    if (Capacitor.isNativePlatform()) {
      return true;
    }

    return Boolean(this.getSpeechRecognitionConstructor());
  }

  async start(
    options: VoiceRecognitionOptions = {},
  ): Promise<boolean> {
    if (this.listening) {
      return true;
    }

    this.options = options;
    this.finalText = '';
    this.stopping = false;

    const Recognition = this.getSpeechRecognitionConstructor();

    if (!Recognition) {
      const error = new Error(
        'Speech recognition is not available on this device.',
      );

      this.options.onError?.(error);
      return false;
    }

    try {
      this.recognition = new Recognition();

      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = options.language || 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.listening = true;
        this.stopping = false;
        this.options.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (
          let i = event.resultIndex || 0;
          i < event.results.length;
          i += 1
        ) {
          const result = event.results[i];
          const transcript =
            result?.[0]?.transcript?.trim() || '';

          if (!transcript) continue;

          if (result.isFinal) {
            final += `${transcript} `;
          } else {
            interim += `${transcript} `;
          }
        }

        if (final) {
          this.finalText = `${this.finalText} ${final}`
            .replace(/\s+/g, ' ')
            .trim();
        }

        const combined = `${this.finalText} ${interim}`
          .replace(/\s+/g, ' ')
          .trim();

        if (combined) {
          this.options.onResult?.({
            text: combined,
            final: Boolean(final),
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        const errorCode = event?.error || 'unknown';

        if (
          errorCode === 'aborted' ||
          errorCode === 'no-speech' ||
          this.stopping
        ) {
          return;
        }

        const error = new Error(
          `Speech recognition error: ${errorCode}`,
        );

        this.options.onError?.(error);
      };

      this.recognition.onend = () => {
        this.listening = false;
        this.stopping = false;

        this.options.onEnd?.();

        this.recognition = null;
      };

      this.recognition.start();

      return true;
    } catch (error) {
      this.listening = false;
      this.stopping = false;
      this.recognition = null;

      const normalized =
        error instanceof Error
          ? error
          : new Error('Unable to start speech recognition.');

      this.options.onError?.(normalized);

      return false;
    }
  }

  stop(): void {
    if (!this.recognition) {
      this.listening = false;
      return;
    }

    this.stopping = true;

    try {
      this.recognition.stop();
    } catch {
      try {
        this.recognition.abort();
      } catch {
        // Ignore cleanup errors.
      }
    }
  }

  abort(): void {
    this.stopping = true;

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore cleanup errors.
      }
    }

    this.listening = false;
    this.recognition = null;
  }

  reset(): void {
    this.abort();
    this.finalText = '';
    this.options = {};
  }
}

export const voiceInput = new VoiceInputController();

export function getRecognitionLanguage(
  language: string,
): RecognitionLanguage {
  const value = language.toLowerCase();

  if (value === 'af' || value.startsWith('af-')) {
    return 'af-ZA';
  }

  if (value === 'es' || value.startsWith('es-')) {
    return 'es-ES';
  }

  return 'en-US';
}

export default voiceInput;
