import React, { useState } from "react";

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    // 拡張機能のアイコンを変更
    chrome.action.setIcon({
      path: {
        16: isActive ? "red-timer-icon-16.svg" : "blue-timer-icon-16.svg",
        48: isActive ? "red-timer-icon-48.svg" : "blue-timer-icon-48.svg",
      },
    });
  };

  return (
    <div>
      <button onClick={handleClick}>
        {isActive ? "タイマー停止" : "タイマー開始"}
      </button>
    </div>
  );
};

export default App;
