type TimerMessage = {
  type: "START_TIMER" | "STOP_TIMER";
  duration?: number;
};

// 拡張機能がインストールされたときの処理
chrome.runtime.onInstalled.addListener(() => {
  console.log("Timer Extension installed");
  // 初期設定を保存
  chrome.storage.local.set({
    isRunning: false,
    timeLeft: 180, // デフォルトの時間（秒）
  });
});

// メッセージリスナー
chrome.runtime.onMessage.addListener(
  //   (message: TimerMessage, sender, sendResponse) => {
  (message: TimerMessage) => {
    switch (message.type) {
      case "START_TIMER":
        handleStartTimer(message.duration || 180);
        break;
      case "STOP_TIMER":
        handleStopTimer();
        break;
    }
  }
);

// タイマー開始処理
const handleStartTimer = (duration: number): void => {
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
  chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
  chrome.alarms.clear("timer");
};

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "timer") {
    const data = await chrome.storage.local.get(["timeLeft", "isRunning"]);
    if (data.isRunning && data.timeLeft > 0) {
      const newTime = data.timeLeft - 1;
      // await chrome.storage.local.set({ timeLeft: newTime });
      chrome.action.setBadgeText({ text: newTime.toString() });

      if (newTime <= 0) {
        handleStopTimer();
        // // 通知を送信
        // chrome.notifications.create({
        //   type: "basic",
        //   iconUrl: "icon-48.png",
        //   title: "タイマー終了",
        //   message: "設定された時間が経過しました",
        // });
      }
    }
  }
});
