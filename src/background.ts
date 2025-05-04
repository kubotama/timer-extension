import { TIMER, TimerClicked, MessageType } from "./constants";

let isTimerStarted: boolean = false;

const updateBadge = (
  seconds: number,
  bg_color: string,
  text_color: string = TIMER.TEXT_COLOR
): void => {
  chrome.action.setBadgeText({ text: seconds.toString() });
  chrome.action.setBadgeTextColor({ color: text_color });
  chrome.action.setBadgeBackgroundColor({ color: bg_color });
};

chrome.runtime.onMessage.addListener(
  (message: MessageType, __sender, sendResponse) => {
    if (message.type === TIMER.MESSAGE_CLICKED) {
      const clickedMessage = message as TimerClicked;
      const timerSeconds = clickedMessage.timerSeconds;
      if (clickedMessage.timerSeconds > 0) {
        chrome.storage.local.set({ [TIMER.TIMER_SECONDS]: timerSeconds });
      }
      if (isTimerStarted === false) {
        chrome.alarms.create(TIMER.NAME, {
          periodInMinutes: 1 / 60, // 1秒ごとに更新
        });
        // タイマーを開始
        isTimerStarted = handleStartTimer();
      } else {
        // タイマーを停止
        isTimerStarted = handleStopTimer();
      }
    }
    chrome.storage.local.get([TIMER.TIMER_SECONDS], (result) => {
      const timerSeconds =
        result[TIMER.TIMER_SECONDS] || TIMER.DEFAULT_TIMER_SECOND;
      sendResponse({
        type: TIMER.MESSAGE_STATUS_RESPONSE,
        status: isTimerStarted,
        timerSeconds: timerSeconds,
      });
    });

    return true;
  }
);

chrome.runtime.onStartup.addListener(() => {
  console.log("Timer Extension started");
  handleStopTimer();
});

// タイマー開始処理
const handleStartTimer = (): boolean => {
  // 終了時刻を計算
  chrome.storage.local.get([TIMER.TIMER_SECONDS], (result) => {
    const timerSeconds =
      result[TIMER.TIMER_SECONDS] || TIMER.DEFAULT_TIMER_SECOND;

    chrome.storage.local.set({
      [TIMER.END_TIME_MILLISECONDS]: new Date().getTime() + timerSeconds * 1000,
    });
    updateBadge(timerSeconds, TIMER.START_BGCOLOR);
  });
  return true;
};

// タイマー停止処理
const handleStopTimer = (): boolean => {
  chrome.storage.local.get([TIMER.TIMER_SECONDS], (result) => {
    const timerSeconds =
      result[TIMER.TIMER_SECONDS] || TIMER.DEFAULT_TIMER_SECOND;
    updateBadge(timerSeconds, TIMER.STOP_BGCOLOR);
  });
  // アラームをクリア
  chrome.alarms.clear(TIMER.NAME);
  chrome.storage.local.remove([TIMER.END_TIME_MILLISECONDS]);
  return false;
};

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TIMER.NAME) {
    const nowMillisec = new Date().getTime();
    const result = await chrome.storage.local.get([
      TIMER.END_TIME_MILLISECONDS,
    ]);
    const endTimeMillisec = result[TIMER.END_TIME_MILLISECONDS];
    const difference = endTimeMillisec - nowMillisec;
    const remainingMillisec = Math.max(0, difference); // 残り時間（ミリ秒）
    if (isTimerStarted && remainingMillisec > 0) {
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
