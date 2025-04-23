const TIMER_LABEL = "timer";
type TimerState = "isRunning" | "isPaused";
let timerState: TimerState = "isPaused";
const timerDuration = 180; // 3分
let endTimeMillisec = 0;

chrome.action.onClicked.addListener(() => {
  if (timerState === "isPaused") {
    handleStartTimer(timerDuration);
  } else {
    handleStopTimer();
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Timer Extension started");

  chrome.action.setBadgeText({ text: timerDuration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
});

// タイマー開始処理
const handleStartTimer = (duration: number): void => {
  // アラームを設定
  if (timerState !== "isRunning") {
    chrome.alarms.create(TIMER_LABEL, {
      periodInMinutes: 1 / 60, // 1秒ごとに更新
    });
  }
  endTimeMillisec = new Date().getTime() + duration * 1000;
  chrome.action.setBadgeText({ text: duration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  timerState = "isRunning";
};

// タイマー停止処理
const handleStopTimer = (): void => {
  chrome.action.setBadgeText({ text: timerDuration.toString() });
  chrome.action.setBadgeBackgroundColor({ color: "#F44336" });
  chrome.alarms.clear(TIMER_LABEL);
  timerState = "isPaused";
};

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TIMER_LABEL) {
    const nowMillisec = new Date().getTime();
    const difference = endTimeMillisec - nowMillisec;
    const remainingMillisec = Math.max(0, difference); // 残り時間（ミリ秒）
    if (timerState === "isRunning" && remainingMillisec > 0) {
      chrome.action.setBadgeText({
        text: Math.round(remainingMillisec / 1000).toString(),
      });
    } else if (remainingMillisec <= 0) {
      handleStartTimer(timerDuration); // タイマーを再スタート
      await createOffscreen();
      chrome.runtime.sendMessage({
        play: "",
      });
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
