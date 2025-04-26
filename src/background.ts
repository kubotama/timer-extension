import { TIMER } from "./constants";

// const TIMER_LABEL = "timer";
type TimerState = "isRunning" | "isPaused";
let isTimerStarted: TimerState = "isPaused";

// export const TIMER = {
//   LABEL: "timer",
//   START_BGCOLOR: "#4CAF50",
//   STOP_BGCOLOR: "#902424",
//   TEXT_COLOR: "#FFFFFF",
// };
// const TIMER_START_BGCOLOR = "#4CAF50";
// const TIMER_STOP_BGCOLOR = "#902424";
// const TIMER_TEXT_COLOR = "#FFFFFF";

const timerSeconds = 180; // タイマーの時間=3分
// const timerSeconds = 5; // テスト用
let endTimeMillisec = 0;

const updateBadge = (
  text: string,
  bg_color: string,
  text_color: string = TIMER.TEXT_COLOR
): void => {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeTextColor({ color: text_color });
  chrome.action.setBadgeBackgroundColor({ color: bg_color });
};

chrome.action.onClicked.addListener(() => {
  if (isTimerStarted === "isPaused") {
    chrome.alarms.create(TIMER.NAME, {
      periodInMinutes: 1 / 60, // 1秒ごとに更新
    });
    // isTimerStarted = TIMER.STATUS_STARTED;
    // endTimeMillisec = new Date().getTime() + timerDuration * 1000;
    // updateBadge(timerDuration.toString(), TIMER_START_BGCOLOR);
    isTimerStarted = handleStartTimer();
  } else {
    // isTimerStarted = TIMER.STATUS_STOPPED;
    // chrome.alarms.clear(TIMER_LABEL);
    // updateBadge(timerDuration.toString(), TIMER_STOP_BGCOLOR);
    // アラームをクリア
    isTimerStarted = handleStopTimer();
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Timer Extension started");

  // chrome.action.setBadgeText({ text: timerDuration.toString() });
  // chrome.action.setBadgeTextColor({ color: TIMER_TEXT_COLOR });
  // chrome.action.setBadgeBackgroundColor({ color: TIMER_STOP_COLOR });
  updateBadge(timerSeconds.toString(), TIMER.STOP_BGCOLOR);
});

// タイマー開始処理
const handleStartTimer = (): TimerState => {
  // アラームを設定
  // if (timerState !== "isRunning") {
  //   chrome.alarms.create(TIMER_LABEL, {
  //     periodInMinutes: 1 / 60, // 1秒ごとに更新
  //   });
  // }

  // 終了時刻を計算
  endTimeMillisec = new Date().getTime() + timerSeconds * 1000;
  // chrome.action.setBadgeText({ text: duration.toString() });
  // chrome.action.setBadgeTextColor({ color: TIMER_TEXT_COLOR });
  // chrome.action.setBadgeBackgroundColor({ color: TIMER_START_COLOR });
  updateBadge(timerSeconds.toString(), TIMER.START_BGCOLOR);
  // timerState = "isRunning";
  return "isRunning";
};

// タイマー停止処理
const handleStopTimer = (): TimerState => {
  // chrome.action.setBadgeText({ text: timerDuration.toString() });
  // chrome.action.setBadgeTextColor({ color: TIMER_TEXT_COLOR });
  // chrome.action.setBadgeBackgroundColor({ color: TIMER_STOP_COLOR });
  updateBadge(timerSeconds.toString(), TIMER.STOP_BGCOLOR);
  // アラームをクリア
  chrome.alarms.clear(TIMER.NAME);
  // timerState = "isPaused";
  return "isPaused";
};

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TIMER.NAME) {
    const nowMillisec = new Date().getTime();
    const difference = endTimeMillisec - nowMillisec;
    const remainingMillisec = Math.max(0, difference); // 残り時間（ミリ秒）
    if (isTimerStarted === "isRunning" && remainingMillisec > 0) {
      // chrome.action.setBadgeText({
      //   text: Math.round(remainingMillisec / 1000).toString(),
      // });
      updateBadge(
        Math.round(remainingMillisec / 1000).toString(),
        TIMER.START_BGCOLOR
      );
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
