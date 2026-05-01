/**
 * SoundManager — Lightweight audio feedback for poker table interactions.
 *
 * Uses the Web Audio API to synthesize chip/card sounds procedurally.
 * No external audio files required. Sounds are subtle and casino-appropriate.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/** Master volume (0-1). Kept low for subtlety. */
const MASTER_VOLUME = 0.12;

// ─── CHIP CLICK ──────────────────────────────────────────────────────
// Short, bright percussive click — like ceramic chips stacking.
export function playChipSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Noise burst for the "click" transient
    const bufferSize = ctx.sampleRate * 0.04;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // Bandpass to give it that ceramic chip character
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 4000 + Math.random() * 1500;
    bp.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(MASTER_VOLUME * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.06);
  } catch (e) {
    // Silently fail — audio is non-essential
  }
}

// ─── CARD SLIDE ──────────────────────────────────────────────────────
// Soft whoosh — like a card being slid across felt.
export function playCardSlideSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Shaped noise that ramps down with a slight swell at the start
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.4 * (1 - t);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Low-pass to soften it
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2200;
    lp.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(MASTER_VOLUME * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    source.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.15);
  } catch (e) {
    // Silently fail
  }
}

// ─── CARD FLIP SNAP ──────────────────────────────────────────────────
// Quick snap — like a card being turned face-up on the table.
export function playCardFlipSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Two quick transient pops
    for (let j = 0; j < 2; j++) {
      const offset = j * 0.03;
      const bufferSize = ctx.sampleRate * 0.025;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 6) * (j === 0 ? 1 : 0.6);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(MASTER_VOLUME * 0.7, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.035);

      source.connect(hp);
      hp.connect(gain);
      gain.connect(ctx.destination);
      source.start(now + offset);
      source.stop(now + offset + 0.035);
    }
  } catch (e) {
    // Silently fail
  }
}

// ─── FOLD SOUND ──────────────────────────────────────────────────────
// Soft thud — cards tossed into the muck.
export function playFoldSound() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(MASTER_VOLUME * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    // Silently fail
  }
}
