import React, { useState } from "react";

const App: React.FC = () => {
  const timerSecond = 180;
  const [buttonLabel, setButtonLabel] = useState("開始");

  const handleStartClick = () => {
    setButtonLabel("停止");
  };

  return (
    <div>
      <button style={{ width: "200px" }} onClick={handleStartClick}>
        {buttonLabel}
      </button>
      <span aria-label="time-text">
        {timerSecond.toString().padStart(3, "0")}
      </span>
    </div>
  );
};

export default App;
