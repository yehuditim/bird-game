/**
 * Audio prompts: WAV files take priority; TTS is the fallback.
 * Add more entries to AUDIO_PROMPT_MAP as WAV files become available.
 */
export const AUDIO_PROMPT_MAP: Record<string, string> = {
  'מה זאת הציפור בתמונה?': '/audio/mah-zot-hatzipor.wav',
};

let _current: HTMLAudioElement | null = null;

export function playPromptAudio(text: string): void {
  // Stop any currently playing audio or TTS
  if (_current) {
    _current.pause();
    _current.currentTime = 0;
    _current = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const src = AUDIO_PROMPT_MAP[text];
  if (src) {
    const audio = new Audio(src);
    _current = audio;
    audio.play().catch(() => {
      _current = null;
      speakFallback(text);
    });
  } else {
    speakFallback(text);
  }
}

// Cache the best Hebrew voice once found
let _hebrewVoice: SpeechSynthesisVoice | null | undefined = undefined;

function getHebrewVoice(): SpeechSynthesisVoice | null {
  if (_hebrewVoice !== undefined) return _hebrewVoice;
  const voices = window.speechSynthesis.getVoices();
  // Prefer native he-IL, fall back to any Hebrew variant
  _hebrewVoice =
    voices.find(v => v.lang === 'he-IL' && v.localService) ??
    voices.find(v => v.lang === 'he-IL') ??
    voices.find(v => v.lang.startsWith('he') || v.lang.startsWith('iw')) ??
    null;
  return _hebrewVoice;
}

function speakFallback(text: string): void {
  if (!('speechSynthesis' in window)) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'he-IL';
  utt.rate = 0.82;   // slightly slower → clearer pronunciation
  utt.pitch = 1.0;
  const voice = getHebrewVoice();
  if (voice) utt.voice = voice;
  window.speechSynthesis.speak(utt);
}

// Re-cache voices when they become available (async on some browsers)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _hebrewVoice = undefined; // force re-detection
  });
}

export function stopPromptAudio(): void {
  if (_current) {
    _current.pause();
    _current.currentTime = 0;
    _current = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
