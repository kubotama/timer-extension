// type TimerMessage = {
//   type: "START_TIMER" | "STOP_TIMER";
//   duration?: number;
// };

type TimerState = "isRunning" | "isPaused";
let timerState: TimerState = "isPaused";
const timerDuration = 180; // 3分

chrome.action.onClicked.addListener(() => {
  if (timerState === "isPaused") {
    timerState = "isRunning";
    handleStartTimer(timerDuration); // 3分
  } else {
    timerState = "isPaused";
    handleStopTimer();
  }
});

// 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(() => {
  console.log("Timer Extension installed");
  // chrome.action.setBadgeText({ text: "■" });
  chrome.action.setBadgeText({ text: timerDuration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#F44336" });

  // 初期設定を保存
  chrome.storage.local.set({
    isRunning: false,
    timeLeft: timerDuration, // デフォルトの時間（秒）
  });
});

// // メッセージリスナー
// chrome.runtime.onMessage.addListener(
//   //   (message: TimerMessage, sender, sendResponse) => {
//   (message: TimerMessage) => {
//     switch (message.type) {
//       case "START_TIMER":
//         handleStartTimer(message.duration || 180);
//         break;
//       case "STOP_TIMER":
//         handleStopTimer();
//         break;
//     }
//   }
// );

// タイマー開始処理
const handleStartTimer = (duration: number): void => {
  console.log("Timer started for", duration, "seconds");
  chrome.storage.local.set({ isRunning: true, timeLeft: duration });
  // chrome.action.setBadgeText({ text: "▶" });
  chrome.action.setBadgeText({ text: duration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });

  // アラームを設定
  chrome.alarms.create("timer", {
    periodInMinutes: 1 / 60, // 1秒ごとに更新
  });
};

// タイマー停止処理
const handleStopTimer = (): void => {
  chrome.storage.local.set({ isRunning: false });
  // chrome.action.setBadgeText({ text: "■" });
  chrome.action.setBadgeText({ text: timerDuration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
  chrome.alarms.clear("timer");
};

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "timer") {
    const data = await chrome.storage.local.get(["timeLeft", "isRunning"]);
    if (data.isRunning && data.timeLeft > 0) {
      const newTime = data.timeLeft - 1;
      console.log("Time left:", newTime);
      await chrome.storage.local.set({ timeLeft: newTime });
      chrome.action.setBadgeText({ text: newTime.toString() });

      if (newTime == 0) {
        console.log("Timer finished");
        // playBuzzer(440, 1000); // ブザーを鳴らす
        handleStartTimer(timerDuration); // タイマーをリセット
        await createOffscreen();
        chrome.runtime.sendMessage({
          play: "",
        });
        // handleStopTimer();
        // // 通知を送信
        // chrome.notifications.create({
        //   type: "basic",
        //   iconUrl: "icon-48.png",
        //   title: "タイマー終了",
        //   message: "設定された時間が経過しました",
        // });
      } else {
        console.log("Timer is running");
      }
    }
  }
});

async function createOffscreen(): Promise<void> {
  const has = await chrome.offscreen.hasDocument();
  if (has) return;
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL("offscreen.html"),
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play sound",
  });
}
// function playBeep(frequency: number = 440, duration: number = 1000): void {
//   const audioCtx: AudioContext = new (window.AudioContext ||
//     window.AudioContext)();
//   console.log("AudioContext", audioCtx);
//   const oscillator: OscillatorNode = audioCtx.createOscillator();
//   const gainNode: GainNode = audioCtx.createGain();

//   oscillator.type = "sine"; // サイン波を使用
//   oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
//   gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
//   gainNode.gain.setValueAtTime(0, audioCtx.currentTime + duration / 1000);

//   oscillator.connect(gainNode);
//   gainNode.connect(audioCtx.destination);
//   oscillator.start();
//   oscillator.stop(audioCtx.currentTime + duration / 1000);
// }

// const playBeep = () => {
//   try {
//     const AudioContext = self.AudioContext;
//     const audioCtx = new AudioContext();
//     const oscillator = audioCtx.createOscillator();
//     oscillator.type = "sine";
//     oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
//     oscillator.connect(audioCtx.destination);
//     oscillator.start();
//     oscillator.stop(audioCtx.currentTime + 0.5);
//   } catch (error) {
//     console.error("AudioContext not supported", error);
//   }
// };

// function playBeep(frequency: number = 440, duration: number = 1000): void {
//   try {
//     if (typeof self.AudioContext !== "undefined") {
//       const AudioContext = self.AudioContext;
//       const audioCtx: AudioContext = new AudioContext();
//       const oscillator: OscillatorNode = audioCtx.createOscillator();
//       const gainNode: GainNode = audioCtx.createGain();

//       oscillator.type = "sine"; // サイン波を使用
//       oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
//       gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
//       gainNode.gain.setValueAtTime(0, audioCtx.currentTime + duration / 1000);

//       oscillator.connect(gainNode);
//       gainNode.connect(audioCtx.destination);
//       oscillator.start();
//       oscillator.stop(audioCtx.currentTime + duration / 1000);
//     } else {
//       console.log("AudioContext is not available in this environment.");
//     }
//   } catch (error) {
//     console.log("AudioContext not supported", error);
//   }
// }

// function playBeep(): void {
//   try {
//     const audio = new Audio(
//       "data:audio/wav;base64,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"
//     );
//     audio.play();
//   } catch (error) {
//     console.log("AudioContext not supported", error);
//   }
// }

// function playBeep(): void {
//   try {
//     const audio = new self.Audio(
//       "data:audio/wav;base64,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"
//     );
//     audio.play();
//   } catch (error) {
//     console.log("AudioContext not supported", error);
//   }
// }

// function notifyTimerEnd(): void {
//   chrome.notifications.create({
//     type: "basic",
//     iconUrl: "timer.png",
//     title: "タイマー終了",
//     message: "設定された時間が経過しました",
//   });
// }
