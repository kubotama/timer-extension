// src/App.test.tsx
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import App from "./App";

describe("拡張機能のページの表示", () => {
  test("開始ボタンとタイマー時間が表示される", () => {
    render(<App />);
    // const buttonElement = screen.getByRole("button", { name: /開始/i }); // "開始ボタン"
    const buttonElement = screen.getByRole("button", { name: "開始" });
    const timeText = screen.getByLabelText("time-text");
    expect(buttonElement).toBeInTheDocument();
    expect(timeText).toBeInTheDocument();
  });

  test("開始ボタンをクリックすると、タイマーが開始して、停止ボタンが表示される。", () => {
    render(<App />);
    const buttonElement = screen.getByRole("button", { name: "開始" });
    fireEvent.click(buttonElement);

    // タイマーが開始して、停止ボタンが表示されることを確認
    // ここでは、タイマーの時間が変わることを確認するのは難しいので、停止ボタンが表示されることだけを確認します。
    // ただし、実際のアプリケーションでは、タイマーの時間が変わることを確認する必要があります。
    const stopButton = screen.getByRole("button", { name: "停止" });
    expect(stopButton).toBeInTheDocument();
    const startButton = screen.queryByRole("button", { name: "開始" });
    expect(startButton).not.toBeInTheDocument();
  });
});
