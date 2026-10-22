/**
 * Web Audio API synthesizer for kids learning feedback
 * Generates celebratory chimes, correct answers, pops, and gentle error alerts.
 */

class SoundController {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playPop() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {
      // Audio not permitted yet
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.07);
        osc.stop(this.audioCtx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {
      // Audio context catch
    }
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const notes = [311.13, 277.18]; // D#4 -> C#4 gentle "uh-oh"
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.12 + 0.2);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.12);
        osc.stop(this.audioCtx.currentTime + idx * 0.12 + 0.2);
      });
    } catch {
      // Audio context catch
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.1);
        osc.stop(this.audioCtx.currentTime + idx * 0.1 + 0.4);
      });
    } catch {
      // Audio context catch
    }
  }
}

export const sounds = new SoundController();
