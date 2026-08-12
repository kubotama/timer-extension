import { TIMER, TimerClicked, MessageType } from "./constants"

const updateBadge = (
  seconds: number,
  bg_color: string,
  text_color: string = TIMER.TEXT_COLOR,
): void => {
  chrome.action.setBadgeText({ text: seconds.toString() })
  chrome.action.setBadgeTextColor({ color: text_color })
  chrome.action.setBadgeBackgroundColor({ color: bg_color })
}

chrome.runtime.onMessage.addListener(
  (message: MessageType, __sender, sendResponse) => {
    if (message.type === TIMER.MESSAGE_CLICKED) {
      const clickedMessage = message as TimerClicked
      const timerSeconds = clickedMessage.timerSeconds

      chrome.storage.local.get([TIMER.IS_TIMER_STARTED], (result) => {
        const isTimerStarted = !!result[TIMER.IS_TIMER_STARTED]
        if (clickedMessage.timerSeconds > 0) {
          chrome.storage.local.set({ [TIMER.TIMER_SECONDS]: timerSeconds })
        }

        if (!isTimerStarted) {
          chrome.alarms.create(TIMER.NAME, { periodInMinutes: 1 / 60 })
          handleStartTimer(timerSeconds)
        } else {
          handleStopTimer()
        }

        sendResponse({
          type: TIMER.MESSAGE_STATUS_RESPONSE,
          status: !isTimerStarted,
          timerSeconds: timerSeconds,
        })
      })
      return true // 非同期レスポンス
    }

    if (message.type === TIMER.MESSAGE_STATUS_REQUEST) {
      chrome.storage.local.get(
        [TIMER.IS_TIMER_STARTED, TIMER.TIMER_SECONDS],
        (result) => {
          sendResponse({
            type: TIMER.MESSAGE_STATUS_RESPONSE,
            status: !!result[TIMER.IS_TIMER_STARTED],
            timerSeconds:
              result[TIMER.TIMER_SECONDS] || TIMER.DEFAULT_TIMER_SECOND,
          })
        },
      )
      return true
    }

    if (message.type === TIMER.MESSAGE_TEST) {
      playSoundViaOffscreen()
      return true
    }
  },
)

// タイマー開始処理
const handleStartTimer = (timerSeconds: number): void => {
  chrome.storage.local.set({
    [TIMER.IS_TIMER_STARTED]: true,
    [TIMER.END_TIME_MILLISECONDS]: new Date().getTime() + timerSeconds * 1000,
  })
  updateBadge(timerSeconds, TIMER.START_BGCOLOR)
}

// タイマー停止処理
const handleStopTimer = (): void => {
  chrome.alarms.clear(TIMER.NAME)
  chrome.storage.local.set({ [TIMER.IS_TIMER_STARTED]: false })
  chrome.storage.local.remove([TIMER.END_TIME_MILLISECONDS])

  chrome.storage.local.get([TIMER.TIMER_SECONDS], (result) => {
    const timerSeconds =
      result[TIMER.TIMER_SECONDS] || TIMER.DEFAULT_TIMER_SECOND
    updateBadge(timerSeconds, TIMER.STOP_BGCOLOR)
  })
}

// アラームリスナー
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TIMER.NAME) {
    const result = await chrome.storage.local.get([
      TIMER.END_TIME_MILLISECONDS,
      TIMER.IS_TIMER_STARTED,
      TIMER.TIMER_SECONDS,
    ])
    if (!result[TIMER.IS_TIMER_STARTED]) return

    const nowMillisec = new Date().getTime()
    const endTimeMillisec = result[TIMER.END_TIME_MILLISECONDS]
    const difference = endTimeMillisec - nowMillisec
    const remainingMillisec = Math.max(0, difference)
    const timerSeconds = result[TIMER.TIMER_SECONDS]

    if (remainingMillisec > 0) {
      updateBadge(Math.round(remainingMillisec / 1000), TIMER.START_BGCOLOR)
    } else {
      handleStartTimer(timerSeconds)
      await playSoundViaOffscreen()
    }
  }
})

async function playSoundViaOffscreen(): Promise<void> {
  const has = await chrome.offscreen.hasDocument()
  if (has) {
    await chrome.offscreen.closeDocument()
  }
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL("offscreen.html"),
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play sound",
  })
}
