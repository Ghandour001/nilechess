// A zero-dependency, zero-asset Web Audio API synthesizer for chess sounds

class ChessAudioSynth {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Only initialize on user interaction to respect browser autoplay policies.
  }

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  private isSoundEnabled() {
    if (!this.enabled) return false;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nilechess-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.soundEnabled === false) return false;
        }
      } catch (e) {}
    }
    return true;
  }

  private playWoodTap(frequency: number = 150, noiseDecay: number = 0.05, oscDecay: number = 0.1) {
    if (!this.isSoundEnabled()) return;
    this.initCtx();
    const ctx = this.ctx;
    if (!ctx) return;

    const t = ctx.currentTime;
    
    // Noise burst
    const bufferSize = ctx.sampleRate * noiseDecay; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseEnv = ctx.createGain();
    noiseEnv.gain.setValueAtTime(1, t);
    noiseEnv.gain.exponentialRampToValueAtTime(0.01, t + noiseDecay);
    
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseEnv);
    noiseEnv.connect(ctx.destination);
    noiseSrc.start(t);

    // Sine thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + oscDecay);
    
    const oscEnv = ctx.createGain();
    oscEnv.gain.setValueAtTime(0.8, t);
    oscEnv.gain.exponentialRampToValueAtTime(0.01, t + oscDecay);
    
    osc.connect(oscEnv);
    oscEnv.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + oscDecay);
  }

  private playChime(freqs: number[], duration: number = 0.5) {
    if (!this.isSoundEnabled()) return;
    this.initCtx();
    const ctx = this.ctx;
    if (!ctx) return;

    const t = ctx.currentTime;
    
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t + i * 0.1);
      env.gain.linearRampToValueAtTime(0.3, t + i * 0.1 + 0.05);
      env.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + duration);
      
      osc.connect(env);
      env.connect(ctx.destination);
      
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + duration);
    });
  }

  public move() {
    this.playWoodTap(200, 0.04, 0.08);
  }

  public capture() {
    this.playWoodTap(400, 0.08, 0.15); // Sharper
  }

  public check() {
    // Sharp ting
    if (!this.isSoundEnabled()) return;
    this.initCtx();
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 600;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(env);
    env.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  public gameStart() {
    this.playChime([440, 554, 659], 0.8); // A major chord arpeggio
  }

  public gameEnd() {
    this.playChime([659, 554, 440], 1.0); // Descending
  }

  public warning() {
    this.playChime([880], 0.2); // short high beep
  }
}

export const chessAudio = new ChessAudioSynth();
