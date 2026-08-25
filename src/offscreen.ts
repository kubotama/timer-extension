export function playAudio() {
  const AudioContext = self.AudioContext
  const audioCtx = new AudioContext()
  const oscillator = audioCtx.createOscillator()
  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)

  const gainNode = audioCtx.createGain()
  // 音量を設定 (0.0 ～ 1.0)
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)

  // 3. 接続: オシレーター -> GainNode -> 出力先（スピーカー）
  gainNode.connect(audioCtx.destination)
  oscillator.connect(gainNode)

  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.5)
  oscillator.onended = () => {
    audioCtx.close()
  }
}

playAudio()
