// src/offscreen.ts
import { TIMER } from "./constants";

chrome.runtime.onMessage.addListener((msg: { type: string }) => {
  if (msg.type === TIMER.MESSAGE_PLAY) playAudio();
});

export function playAudio() {
  const AudioContext = self.AudioContext;
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
  oscillator.onended = () => {
    audioCtx.close();
  };
}
