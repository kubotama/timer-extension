const App: React.FC = () => {
  const timerSecond = 180;

  return (
    <div>
      <button style={{ width: "200px" }}> 開始</button>
      <span aria-label="time-text">
        {timerSecond.toString().padStart(3, "0")}
      </span>
    </div>
  );
};

export default App;
