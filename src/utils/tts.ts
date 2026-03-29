/** Web Speech API wrapper for Hebrew read-aloud */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'he-IL';
  utt.rate = 0.88;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

export const ttsSupported = (): boolean => 'speechSynthesis' in window;
