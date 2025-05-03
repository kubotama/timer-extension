// import React, { useEffect } from "react";
import React from "react";

import { MessageType, StatusResponse, TIMER } from "./constants";

const App: React.FC = () => {
  const [isTimerStarted, setIsTimerStarted] = React.useState(false);
  const [buttenText, setButtenText] = React.useState("読み込み中...");
  const [timerSecondText, setTimerSecondText] = React.useState("");

  React.useEffect(() => {
    chrome.runtime
      .sendMessage({ type: TIMER.MESSAGE_STATUS_REQUEST } as MessageType)
      .then((response: StatusResponse) => {
        if (response.type === TIMER.MESSAGE_STATUS_RESPONSE) {
          setIsTimerStarted(response.status);
          setTimerSecondText(response.timerSeconds.toString());
        }
      });
  }, []);

  React.useEffect(() => {
    if (isTimerStarted === true) {
      setButtenText("停止");
    } else {
      setButtenText("開始");
    }
  }, [isTimerStarted]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <input
        type="text"
        size={1}
        style={{ fontSize: "1.5em", padding: "0.5em" }}
        value={timerSecondText}
        onChange={(e) => setTimerSecondText(e.target.value)}
      />
      <button
        style={{ width: "4em", marginLeft: "1em", fontSize: "1.5em" }}
        onClick={() => {
          chrome.runtime
            .sendMessage({
              type: TIMER.MESSAGE_CLICKED,
              timerSeconds: Number(timerSecondText),
            } as MessageType)
            .then((response: StatusResponse) => {
              if (response.type === TIMER.MESSAGE_STATUS_RESPONSE) {
                setIsTimerStarted(response.status);
                setTimerSecondText(response.timerSeconds.toString());
              }
            });
        }}
      >
        {buttenText}
      </button>
    </div>
  );
};

export default App;
