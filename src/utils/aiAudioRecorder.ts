/**
 * AI Audio Recorder & Real-Time Multimodal Microphone Transcriber
 * Provides direct MediaRecorder audio recording with live microphone level feedback
 * and seamless fallback to /api/transcribe-audio (Gemini Multimodal Voice Engine).
 */

export interface AudioRecorderOptions {
  language?: string;
  onVolumeChange?: (volume: number) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

class AIAudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isRecording = false;

  public get recordingActive(): boolean {
    return this.isRecording;
  }

  /**
   * Start recording from the microphone with live volume level monitoring
   */
  public async startRecording(options?: AudioRecorderOptions): Promise<boolean> {
    if (this.isRecording) {
      return true;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported on this browser/device.');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioChunks = [];

      // Determine best audio mimeType supported by browser
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        } else {
          mimeType = ''; // Let browser pick default
        }
      }

      const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};
      this.mediaRecorder = new MediaRecorder(this.mediaStream, recorderOptions);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Set up Web Audio Analyser for volume level / VU meter
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!this.isRecording || !this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(1.0, average / 128);
            options?.onVolumeChange?.(normalized);
            this.animFrameId = requestAnimationFrame(updateVolume);
          };
          this.animFrameId = requestAnimationFrame(updateVolume);
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext volume meter initialization skipped:', audioCtxErr);
      }

      this.mediaRecorder.start(200); // 200ms slice chunks
      this.isRecording = true;
      options?.onRecordingStateChange?.(true);
      return true;
    } catch (error: any) {
      console.error('Error starting audio recording:', error);
      this.cleanup();
      options?.onRecordingStateChange?.(false);
      throw error;
    }
  }

  /**
   * Stop recording and send audio to backend for precision AI transcription
   */
  public async stopAndTranscribe(language: string = 'af-ZA'): Promise<string> {
    if (!this.isRecording || !this.mediaRecorder) {
      return '';
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        this.cleanup();
        resolve('');
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, {
            type: this.mediaRecorder?.mimeType || 'audio/webm',
          });

          this.cleanup();

          if (audioBlob.size < 500) {
            // Audio too short / empty
            resolve('');
            return;
          }

          // Convert Blob to Base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64DataUrl = reader.result as string;
              
              // Send to backend Gemini multimodal transcription endpoint
              const response = await fetch('/api/transcribe-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioData: base64DataUrl,
                  mimeType: audioBlob.type || 'audio/webm',
                  targetLanguage: language || 'af-ZA',
                }),
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.error || 'Transcription request failed');
              }

              const data = await response.json();
              resolve(data.transcript?.trim() || '');
            } catch (postErr) {
              console.error('Backend transcription failed:', postErr);
              reject(postErr);
            }
          };
          reader.onerror = (e) => {
            reject(new Error('Failed to read audio blob'));
          };
        } catch (e) {
          reject(e);
        }
      };

      try {
        this.mediaRecorder.stop();
        this.isRecording = false;
      } catch (err) {
        this.cleanup();
        reject(err);
      }
    });
  }

  /**
   * Cancel recording without transcribing
   */
  public cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isRecording = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.audioChunks = [];
  }
}

export const aiAudioRecorder = new AIAudioRecorderService();
