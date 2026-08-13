// Web Audio API Synthesizer for Focus Ambient Audio

let audioCtx: AudioContext | null = null;
let activeNoiseNode: AudioNode | null = null;
let activeGainNode: GainNode | null = null;
let activeOscillators: OscillatorNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  if (activeGainNode) {
    try {
      activeGainNode.gain.linearRampToValueAtTime(0.001, getAudioContext().currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  }
  setTimeout(() => {
    if (activeNoiseNode) {
      try {
        (activeNoiseNode as any).stop?.();
        activeNoiseNode.disconnect();
      } catch (e) {}
      activeNoiseNode = null;
    }
    activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    activeOscillators = [];
  }, 350);
}

export function playAmbientSound(type: 'rain' | 'lofi' | 'library' | 'whiteNoise' | 'binaural', volume = 0.5) {
  stopAmbientSound();
  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  masterGain.connect(ctx.destination);
  activeGainNode = masterGain;

  if (type === 'whiteNoise' || type === 'rain') {
    // Generate pink/brown noise for rain/white noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // brown/pink rain noise scale
        b6 = white * 0.115926;
      } else {
        // pure soft white noise
        output[i] = white * 0.15;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    activeNoiseNode = whiteNoise;
  } else if (type === 'binaural') {
    // Deep 40Hz Alpha / Gamma Focus Binaural Beats (100Hz left, 114Hz right)
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();

    oscLeft.type = 'sine';
    oscRight.type = 'sine';

    oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
    oscRight.frequency.setValueAtTime(214, ctx.currentTime); // 14Hz Alpha brainwave difference

    const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (pannerLeft && pannerRight) {
      pannerLeft.pan.setValueAtTime(-0.8, ctx.currentTime);
      pannerRight.pan.setValueAtTime(0.8, ctx.currentTime);
      oscLeft.connect(pannerLeft);
      oscRight.connect(pannerRight);
      pannerLeft.connect(masterGain);
      pannerRight.connect(masterGain);
    } else {
      oscLeft.connect(masterGain);
      oscRight.connect(masterGain);
    }

    oscLeft.start();
    oscRight.start();
    activeOscillators = [oscLeft, oscRight];
  } else if (type === 'lofi') {
    // Soft ambient warm synth chord (Maj7 / Min7 ambient pad)
    const chordFreqs = [261.63, 329.63, 392.0, 493.88]; // Cmaj7
    const oscs: OscillatorNode[] = [];

    chordFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      oscs.push(osc);
    });

    activeOscillators = oscs;
  } else if (type === 'library') {
    // Warm low hum with subtle filtered noise
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start();
    activeOscillators = [osc];
  }
}

export function setVolume(volume: number) {
  if (activeGainNode && audioCtx) {
    activeGainNode.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
  }
}
