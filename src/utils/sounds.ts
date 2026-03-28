// Web Audio API — no external files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.28) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, c.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

export function playCorrect() {
  // Happy ascending arpeggio
  tone(523.25, 0,    0.14); // C5
  tone(659.25, 0.1,  0.14); // E5
  tone(783.99, 0.2,  0.22); // G5
  tone(1046.5, 0.3,  0.3);  // C6
}

export function playWrong() {
  // Low buzz descending
  tone(300, 0,    0.18, 'sawtooth', 0.18);
  tone(220, 0.16, 0.22, 'sawtooth', 0.14);
}
