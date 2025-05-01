// import React, { useEffect } from "react";
import React from "react";

import { MessageType, StatusResponse, TIMER } from "./constants";

const App: React.FC = () => {
  const [isTimerStarted, setIsTimerStarted] = React.useState(false);
  const [buttenText, setButtenText] = React.useState("読み込み中...");

  React.useEffect(() => {
    chrome.runtime
      .sendMessage({ type: TIMER.MESSAGE_STATUS_REQUEST } as MessageType)
      .then((response: StatusResponse) => {
        if (response.type === TIMER.MESSAGE_STATUS_RESPONSE) {
          setIsTimerStarted(response.status);
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
    <>
      <button
        style={{ width: "5em" }}
        onClick={() => {
          chrome.runtime
            .sendMessage({ type: TIMER.MESSAGE_CLICKED } as MessageType)
            .then((response: StatusResponse) => {
              if (response.type === TIMER.MESSAGE_STATUS_RESPONSE) {
                setIsTimerStarted(response.status);
              }
            });
        }}
      >
        {buttenText}
      </button>
    </>
  );
};

export default App;
