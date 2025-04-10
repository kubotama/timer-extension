// src/App.test.tsx
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import App from "./App";

describe("拡張機能のページの表示", () => {
  test("開始ボタンとタイマー時間が表示される", () => {
    render(<App />);
    const buttonElement = screen.getByRole("button", { name: /開始/i }); // "開始ボタン"
    const timeText = screen.getByLabelText("time-text");
    expect(buttonElement).toBeInTheDocument();
    expect(timeText).toBeInTheDocument();
  });
});
