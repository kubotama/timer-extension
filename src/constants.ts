export const TIMER = {
  NAME: "timer",
  START_BGCOLOR: "#4CAF50",
  STOP_BGCOLOR: "#902424",
  TEXT_COLOR: "#FFFFFF",
  MESSAGE_PLAY: "play",
  MESSAGE_CLICKED: "message-clicked",
  MESSAGE_STATUS_REQUEST: "message-status-request",
  MESSAGE_STATUS_RESPONSE: "message-status-response",
};

// types.ts
export type StatusRequest = {
  type: typeof TIMER.MESSAGE_STATUS_REQUEST;
};

export type StatusResponse = {
  type: typeof TIMER.MESSAGE_STATUS_RESPONSE;
  status: boolean;
};

export type MessageType = StatusRequest | StatusResponse;
