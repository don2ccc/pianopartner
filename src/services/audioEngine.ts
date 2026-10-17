/**
 * High-fidelity Polyphonic Web Audio Piano Synthesizer and Metronome Engine
 */

interface ActiveVoice {
  oscillators: OscillatorNode[];
  gainNodes: GainNode[];
  filterNode: BiquadFilterNode;
  masterGain: GainNode;
  startTime: number;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGainNode: GainNode | null = null;
  private activeVoices: Map<number, ActiveVoice[]> = new Map();

  constructor() {
    // Lazy initialized on first user gesture
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Convert MIDI note number to frequency in Hertz
   */
  public midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Trigger physical harmonic piano note
   */
  public playNote(midi: number, velocity: number = 80): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const freq = this.midiToFrequency(midi);
      const now = ctx.currentTime;
      const normalizedVel = Math.max(0.1, Math.min(1.0, velocity / 127));

      // Voice container
      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(normalizedVel, now);
      voiceGain.connect(this.masterGainNode!);

      // Low-pass filter to simulate piano hammer hardness and dynamic resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      // Higher velocity gives brighter attack
      const filterCutoff = Math.min(16000, freq * (3 + normalizedVel * 4));
      filter.frequency.setValueAtTime(filterCutoff, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.5), now + 2.5);
      filter.connect(voiceGain);

      // Multi-harmonic partial synthesis
      // Harmonic 1 (Fundamental), Harmonic 2, Harmonic 3, Harmonic 4 with slight acoustic detuning
      const harmonics = [
        { mult: 1.0, detune: 0, amp: 1.0, decay: 3.5 },
        { mult: 2.0, detune: 2.1, amp: 0.55, decay: 2.2 },
        { mult: 3.0, detune: -1.8, amp: 0.28, decay: 1.5 },
        { mult: 4.0, detune: 3.4, amp: 0.12, decay: 0.9 },
      ];

      const oscList: OscillatorNode[] = [];
      const gainList: GainNode[] = [];

      harmonics.forEach(({ mult, detune, amp, decay }) => {
        const osc = ctx.createOscillator();
        const partGain = ctx.createGain();

        // Waveform: sine for warmer, rounded tone
        osc.type = mult === 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * mult, now);
        osc.detune.setValueAtTime(detune, now);

        // Acoustic envelope: immediate percussive attack (3ms), then exponential decay
        const peakAmp = amp * (0.8 + normalizedVel * 0.4);
        partGain.gain.setValueAtTime(0.0001, now);
        partGain.gain.exponentialRampToValueAtTime(peakAmp, now + 0.004);
        
        // Decay length scales with pitch: lower notes ring longer, higher notes decay faster
        const pitchDecayFactor = Math.max(0.3, 1.2 - (midi - 36) / 80);
        const actualDecay = Math.max(0.4, decay * pitchDecayFactor);

        partGain.gain.exponentialRampToValueAtTime(0.0001, now + actualDecay);

        osc.connect(partGain);
        partGain.connect(filter);

        osc.start(now);
        osc.stop(now + actualDecay + 0.1);

        oscList.push(osc);
        gainList.push(partGain);
      });

      // Hammer strike transient impulse (very subtle high click)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(freq * 8, now);
      clickGain.gain.setValueAtTime(0.12 * normalizedVel, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      clickOsc.connect(clickGain);
      clickGain.connect(filter);
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

      const voice: ActiveVoice = {
        oscillators: oscList,
        gainNodes: gainList,
        filterNode: filter,
        masterGain: voiceGain,
        startTime: now,
      };

      const existing = this.activeVoices.get(midi) || [];
      existing.push(voice);
      this.activeVoices.set(midi, existing);
    } catch {
      // AudioContext policy or inactive audio tab
    }
  }

  /**
   * Release damper (Note Off)
   */
  public stopNote(midi: number): void {
    const voices = this.activeVoices.get(midi);
    if (!voices || voices.length === 0 || !this.ctx) return;

    const now = this.ctx.currentTime;
    voices.forEach((voice) => {
      try {
        // Smooth quick release damping (0.12s)
        voice.masterGain.gain.cancelScheduledValues(now);
        voice.masterGain.gain.setValueAtTime(voice.masterGain.gain.value, now);
        voice.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        setTimeout(() => {
          voice.oscillators.forEach((osc) => {
            try {
              osc.stop();
            } catch {
              // already stopped
            }
          });
        }, 150);
      } catch {
        // Voice already dismantled
      }
    });

    this.activeVoices.delete(midi);
  }

  /**
   * Crisp acoustic metronome click
   * @param isDownbeat True on beat 1 of measure
   */
  public playMetronomeTick(isDownbeat: boolean): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Downbeat is crisper and higher (1600Hz vs 1000Hz)
      const freq = isDownbeat ? 1650 : 1100;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

      const amp = isDownbeat ? 0.65 : 0.4;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGainNode!);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext blocked
    }
  }

  /**
   * Short pleasant chime for correct drill / combo
   */
  public playSuccessTone(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGainNode!);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch {
      // Ignored
    }
  }
}

export const audioEngine = new AudioEngine();
