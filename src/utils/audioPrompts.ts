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

function speakFallback(text: string): void {
  if (!('speechSynthesis' in window)) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'he-IL';
  utt.rate = 0.88;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

export function stopPromptAudio(): void {
  if (_current) {
    _current.pause();
    _current.currentTime = 0;
    _current = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
