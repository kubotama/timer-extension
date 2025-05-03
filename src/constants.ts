export const TIMER = {
  NAME: "timer",
  START_BGCOLOR: "#4CAF50",
  STOP_BGCOLOR: "#902424",
  TEXT_COLOR: "#FFFFFF",
  MESSAGE_PLAY: "play",
  MESSAGE_CLICKED: "message-clicked",
  MESSAGE_STATUS_REQUEST: "message-status-request",
  MESSAGE_STATUS_RESPONSE: "message-status-response",
  STORAGE_NAME: "timerSeconds",
} as const;

// export const DEFAULT_TIMER_SECOND: number 180;
export const DEFAULT_TIMER_SECOND: number = 5;

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
