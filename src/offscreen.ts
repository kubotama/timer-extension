// src/offscreen.ts

chrome.runtime.onMessage.addListener((msg: { play: string }) => {
  if ("play" in msg) playAudio();
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
