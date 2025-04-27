import { TIMER } from "./constants";

type TimerState = "isRunning" | "isPaused";
export let isTimerStarted: TimerState = "isPaused";

const timerSeconds = 180; // タイマーの時間=3分
// const timerSeconds = 5; // テスト用
let endTimeMillisec = 0;

const updateBadge = (
  seconds: number,
  bg_color: string,
  text_color: string = TIMER.TEXT_COLOR
): void => {
  chrome.action.setBadgeText({ text: seconds.toString().padStart(3, "0") });
  chrome.action.setBadgeTextColor({ color: text_color });
  chrome.action.setBadgeBackgroundColor({ color: bg_color });
};

chrome.runtime.onMessage.addListener((msg: { type: string }) => {
  if (msg.type === TIMER.MESSAGE_CLICKED) {
    if (isTimerStarted === "isPaused") {
      chrome.alarms.create(TIMER.NAME, {
        periodInMinutes: 1 / 60, // 1秒ごとに更新
      });
      isTimerStarted = handleStartTimer();
    } else {
      // アラームをクリア
      isTimerStarted = handleStopTimer();
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Timer Extension started");

  updateBadge(timerSeconds, TIMER.STOP_BGCOLOR);
});

// タイマー開始処理
const handleStartTimer = (): TimerState => {
  // 終了時刻を計算
  endTimeMillisec = new Date().getTime() + timerSeconds * 1000;
  updateBadge(timerSeconds, TIMER.START_BGCOLOR);
  return "isRunning";
};

// タイマー停止処理
const handleStopTimer = (): TimerState => {
  updateBadge(timerSeconds, TIMER.STOP_BGCOLOR);
  // アラームをクリア
  chrome.alarms.clear(TIMER.NAME);
  return "isPaused";
};

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TIMER.NAME) {
    const nowMillisec = new Date().getTime();
    const difference = endTimeMillisec - nowMillisec;
    const remainingMillisec = Math.max(0, difference); // 残り時間（ミリ秒）
    if (isTimerStarted === "isRunning" && remainingMillisec > 0) {
      updateBadge(Math.round(remainingMillisec / 1000), TIMER.START_BGCOLOR);
    } else if (remainingMillisec <= 0) {
      handleStartTimer(); // タイマーを再スタート
      await createOffscreen();
      chrome.runtime.sendMessage({
        type: TIMER.MESSAGE_PLAY,
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
