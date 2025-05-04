export const TIMER = {
  NAME: "timer",
  START_BGCOLOR: "#4CAF50",
  STOP_BGCOLOR: "#902424",
  TEXT_COLOR: "#FFFFFF",
  MESSAGE_PLAY: "play",
  MESSAGE_CLICKED: "message-clicked",
  MESSAGE_STATUS_REQUEST: "message-status-request",
  MESSAGE_STATUS_RESPONSE: "message-status-response",
  TIMER_SECONDS: "timer-seconds",
  END_TIME_MILLISECONDS: "end-time-milli-seconds",
  DEFAULT_TIMER_SECOND: 180 as number,
} as const;

// types.ts
export type StatusRequest = {
  type: typeof TIMER.MESSAGE_STATUS_REQUEST;
};

export type StatusResponse = {
  type: typeof TIMER.MESSAGE_STATUS_RESPONSE;
  status: boolean;
  timerSeconds: number;
};

export type TimerClicked = {
  type: typeof TIMER.MESSAGE_CLICKED;
  timerSeconds: number;
};

export type MessageType = StatusRequest | StatusResponse | TimerClicked;
