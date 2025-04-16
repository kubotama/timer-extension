import React, { useState } from "react";

const App: React.FC = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleStartClick = () => {
    setIsTimerRunning(true);
  };

  const handleStopClick = () => {
    setIsTimerRunning(false);
  };

  return (
    <div>
      {isTimerRunning === false && (
        <>
          <button style={{ width: "200px" }} onClick={handleStartClick}>
            開始
          </button>
        </>
      )}
      {isTimerRunning === true && (
        <>
          <button style={{ width: "200px" }} onClick={handleStopClick}>
            停止
          </button>
        </>
      )}
    </div>
  );
};

export default App;
