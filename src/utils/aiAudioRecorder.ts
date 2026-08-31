/**
 * AI Audio Recorder
 *
 * Records microphone audio and sends it to:
 *
 * /api/transcribe-audio
 *
 * Afrikaans is explicitly normalized to:
 *
 * af-ZA
 *
 * The recorder also guarantees that the microphone,
 * MediaRecorder and AudioContext are released when
 * recording is stopped, cancelled or fails.
 */

export interface AudioRecorderOptions {
  language?: string;
  onVolumeChange?: (volume: number) => void;
  onRecordingStateChange?: (
    isRecording: boolean,
  ) => void;
}

type RecorderMimeType = string;

class AIAudioRecorderService {
  private mediaStream:
    MediaStream | null = null;

  private mediaRecorder:
    MediaRecorder | null = null;

  private audioChunks: Blob[] = [];

  private audioContext:
    AudioContext | null = null;

  private analyser:
    AnalyserNode | null = null;

  private sourceNode:
    MediaStreamAudioSourceNode | null = null;

  private animFrameId:
    number | null = null;

  private isRecording = false;

  private stopping = false;

  private currentLanguage =
    'af-ZA';

  private stateCallback:
    | ((isRecording: boolean) => void)
    | null = null;

  private volumeCallback:
    | ((volume: number) => void)
    | null = null;

  public get recordingActive(): boolean {
    return this.isRecording;
  }

  /**
   * Always use the correct language code.
   */
  private normalizeLanguage(
    language?: string,
  ): 'af-ZA' | 'en-US' | 'es-ES' {
    const value =
      String(language || '')
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

  /**
   * Find the best microphone audio format
   * supported by the current browser/device.
   */
  private getMimeType(): RecorderMimeType {
    if (
      typeof MediaRecorder ===
      'undefined'
    ) {
      return '';
    }

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
    ];

    for (const type of types) {
      try {
        if (
          MediaRecorder.isTypeSupported(
            type,
          )
        ) {
          return type;
        }
      } catch {
        // Continue to next format.
      }
    }

    return '';
  }

  /**
   * Start microphone recording.
   */
  public async startRecording(
    options: AudioRecorderOptions = {},
  ): Promise<boolean> {
    /*
     * Never create a second microphone session.
     */
    if (this.isRecording) {
      return true;
    }

    /*
     * Remove anything left from a previous
     * recording session.
     */
    this.cleanup(false);

    this.currentLanguage =
      this.normalizeLanguage(
        options.language ||
          'af-ZA',
      );

    this.stateCallback =
      options.onRecordingStateChange ||
      null;

    this.volumeCallback =
      options.onVolumeChange ||
      null;

    this.audioChunks = [];

    this.stopping = false;

    if (
      typeof navigator ===
        'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      const error =
        new Error(
          'Microphone access is not supported on this device.',
        );

      options.onRecordingStateChange?.(
        false,
      );

      throw error;
    }

    if (
      typeof MediaRecorder ===
      'undefined'
    ) {
      const error =
        new Error(
          'Audio recording is not supported on this device.',
        );

      options.onRecordingStateChange?.(
        false,
      );

      throw error;
    }

    try {
      /*
       * Request microphone access.
       */
      this.mediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,
            },
          },
        );

      /*
       * Check that the session has not been
       * cancelled while permission was being
       * requested.
       */
      if (this.stopping) {
        this.cleanup(false);
        return false;
      }

      const mimeType =
        this.getMimeType();

      const recorderOptions:
        MediaRecorderOptions =
        mimeType
          ? {
              mimeType,
            }
          : {};

      this.mediaRecorder =
        new MediaRecorder(
          this.mediaStream,
          recorderOptions,
        );

      /*
       * Collect audio chunks.
       */
      this.mediaRecorder.ondataavailable =
        (event: BlobEvent) => {
          if (
            event.data &&
            event.data.size > 0 &&
            !this.stopping
          ) {
            this.audioChunks.push(
              event.data,
            );
          }
        };

      /*
       * Make sure the state is reset if
       * the recorder unexpectedly stops.
       */
      this.mediaRecorder.onerror =
        () => {
          this.stopping = true;

          this.isRecording =
            false;

          this.stateCallback?.(
            false,
          );

          this.cleanup(false);
        };

      /*
       * Live microphone volume meter.
       */
      this.setupVolumeMonitor();

      /*
       * Start recording.
       */
      this.mediaRecorder.start(200);

      this.isRecording = true;

      this.stateCallback?.(
        true,
      );

      return true;
    } catch (error) {
      console.error(
        'Error starting audio recording:',
        error,
      );

      this.cleanup(false);

      this.stateCallback?.(
        false,
      );

      throw error;
    }
  }

  /**
   * Create the microphone volume monitor.
   */
  private setupVolumeMonitor(): void {
    if (!this.mediaStream) {
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as any
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      this.audioContext =
        new AudioContextClass();

      this.sourceNode =
        this.audioContext.createMediaStreamSource(
          this.mediaStream,
        );

      this.analyser =
        this.audioContext.createAnalyser();

      this.analyser.fftSize =
        256;

      this.sourceNode.connect(
        this.analyser,
      );

      const dataArray =
        new Uint8Array(
          this.analyser.frequencyBinCount,
        );

      const updateVolume =
        () => {
          if (
            !this.isRecording ||
            !this.analyser ||
            this.stopping
          ) {
            return;
          }

          try {
            this.analyser.getByteFrequencyData(
              dataArray,
            );

            let sum = 0;

            for (
              let i = 0;
              i < dataArray.length;
              i += 1
            ) {
              sum += dataArray[i];
            }

            const average =
              dataArray.length > 0
                ? sum /
                  dataArray.length
                : 0;

            const normalized =
              Math.min(
                1,
                average / 128,
              );

            this.volumeCallback?.(
              normalized,
            );

            this.animFrameId =
              requestAnimationFrame(
                updateVolume,
              );
          } catch {
            return;
          }
        };

      this.animFrameId =
        requestAnimationFrame(
          updateVolume,
        );
    } catch (error) {
      console.warn(
        'Volume monitor unavailable:',
        error,
      );
    }
  }

  /**
   * Stop recording and transcribe.
   *
   * The microphone is stopped immediately.
   * Transcription happens only after the
   * MediaRecorder has finished producing its
   * final audio data.
   */
  public async stopAndTranscribe(
    language: string = 'af-ZA',
  ): Promise<string> {
    const recorder =
      this.mediaRecorder;

    if (
      !this.isRecording ||
      !recorder
    ) {
      return '';
    }

    const targetLanguage =
      this.normalizeLanguage(
        language ||
          this.currentLanguage,
      );

    this.currentLanguage =
      targetLanguage;

    this.stopping = true;

    /*
     * Tell the UI immediately that the
     * microphone is OFF.
     */
    this.isRecording = false;

    this.stateCallback?.(
      false,
    );

    return new Promise<string>(
      (resolve, reject) => {
        let settled = false;

        const finish = (
          value?: string,
          error?: unknown,
        ) => {
          if (settled) {
            return;
          }

          settled = true;

          this.cleanup(false);

          if (error) {
            reject(error);
          } else {
            resolve(
              value || '',
            );
          }
        };

        recorder.onstop =
          async () => {
            try {
              /*
               * Build the final audio blob
               * before cleanup clears the chunks.
               */
              const audioBlob =
                new Blob(
                  this.audioChunks,
                  {
                    type:
                      recorder.mimeType ||
                      'audio/webm',
                  },
                );

              /*
               * Release microphone immediately.
               */
              this.cleanup(
                false,
              );

              if (
                audioBlob.size <
                500
              ) {
                finish('');
                return;
              }

              const transcript =
                await this
                  .sendForTranscription(
                    audioBlob,
                    targetLanguage,
                  );

              finish(
                transcript,
              );
            } catch (error) {
              console.error(
                'Backend transcription failed:',
                error,
              );

              finish(
                '',
                error,
              );
            }
          };

        try {
          /*
           * Request the recorder to stop.
           */
          if (
            recorder.state !==
            'inactive'
          ) {
            recorder.stop();
          } else {
            /*
             * Some browsers can already be
             * inactive by the time stop is
             * called.
             */
            finish('');
          }
        } catch (error) {
          finish(
            '',
            error,
          );
        }
      },
    );
  }

  /**
   * Send recorded audio to the server.
   */
  private async sendForTranscription(
    audioBlob: Blob,
    language: string,
  ): Promise<string> {
    const reader =
      new FileReader();

    const base64DataUrl =
      await new Promise<string>(
        (resolve, reject) => {
          reader.onloadend = () => {
            if (
              typeof reader.result ===
              'string'
            ) {
              resolve(
                reader.result,
              );
            } else {
              reject(
                new Error(
                  'Unable to convert recorded audio.',
                ),
              );
            }
          };

          reader.onerror = () => {
            reject(
              new Error(
                'Failed to read recorded audio.',
              ),
            );
          };

          reader.readAsDataURL(
            audioBlob,
          );
        },
      );

    const response =
      await fetch(
        '/api/transcribe-audio',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            audioData:
              base64DataUrl,

            mimeType:
              audioBlob.type ||
              'audio/webm',

            /*
             * IMPORTANT:
             * Afrikaans is sent as af-ZA.
             */
            targetLanguage:
              this.normalizeLanguage(
                language,
              ),
          }),
        },
      );

    let data: any = {};

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          'Transcription request failed.',
      );
    }

    const transcript =
      typeof data?.transcript ===
      'string'
        ? data.transcript
        : '';

    return transcript
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Cancel microphone recording without
   * sending anything to the server.
   */
  public cancelRecording(): void {
    this.stopping = true;

    this.isRecording =
      false;

    this.stateCallback?.(
      false,
    );

    const recorder =
      this.mediaRecorder;

    /*
     * Detach callbacks before stopping.
     * This prevents a cancelled recording
     * from accidentally being submitted.
     */
    if (recorder) {
      recorder.ondataavailable =
        null;

      recorder.onstop = null;

      recorder.onerror = null;
    }

    try {
      if (
        recorder &&
        recorder.state !==
          'inactive'
      ) {
        recorder.stop();
      }
    } catch {
      // Ignore recorder stop errors.
    }

    this.cleanup(false);
  }

  /**
   * Complete reset.
   */
  public reset(): void {
    this.cancelRecording();

    this.audioChunks = [];

    this.currentLanguage =
      'af-ZA';

    this.stateCallback = null;

    this.volumeCallback = null;

    this.stopping = false;
  }

  /**
   * Release all microphone and audio
   * resources.
   */
  private cleanup(
    notify = true,
  ): void {
    this.isRecording =
      false;

    /*
     * Stop the animation frame first.
     */
    if (
      this.animFrameId !== null
    ) {
      try {
        cancelAnimationFrame(
          this.animFrameId,
        );
      } catch {
        // Ignore.
      }

      this.animFrameId = null;
    }

    /*
     * Stop every microphone track.
     *
     * This is the important part that makes
     * the Android microphone indicator turn
     * off after recording.
     */
    if (this.mediaStream) {
      try {
        this.mediaStream
          .getTracks()
          .forEach(
            (track) => {
              try {
                track.stop();
              } catch {
                // Ignore individual track errors.
              }
            },
          );
      } catch {
        // Ignore.
      }

      this.mediaStream = null;
    }

    /*
     * Disconnect the analyser.
     */
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Ignore.
      }

      this.sourceNode = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {
        // Ignore.
      }

      this.analyser = null;
    }

    /*
     * Close AudioContext.
     */
    if (
      this.audioContext &&
      this.audioContext.state !==
        'closed'
    ) {
      try {
        this.audioContext.close();
      } catch {
        // Ignore.
      }
    }

    this.audioContext =
      null;

    /*
     * Do not leave a stale MediaRecorder
     * attached.
     */
    this.mediaRecorder =
      null;

    /*
     * Clear audio data after the caller has
     * finished using it.
     */
    this.audioChunks = [];

    if (notify) {
      this.stateCallback?.(
        false,
      );
    }
  }
}

export const aiAudioRecorder =
  new AIAudioRecorderService();

export default aiAudioRecorder;
