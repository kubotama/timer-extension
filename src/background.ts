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
  chrome.action.setBadgeText({ text: timerDuration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#F44336" });

  // 初期設定を保存
  chrome.storage.local.set({
    isRunning: false,
    timeLeft: timerDuration, // デフォルトの時間（秒）
  });
});

// タイマー開始処理
const handleStartTimer = (duration: number): void => {
  chrome.storage.local.set({ isRunning: true, timeLeft: duration });
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
      await chrome.storage.local.set({ timeLeft: newTime });
      chrome.action.setBadgeText({ text: newTime.toString() });

      if (newTime <= 0) {
        handleStartTimer(timerDuration); // タイマーをリセット
        await createOffscreen();
        chrome.runtime.sendMessage({
          play: "",
        });
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
