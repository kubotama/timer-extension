// src/App.test.tsx
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import App from "./App";

// Declare the global object for TypeScript
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace NodeJS {
  interface Global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chrome: any;
  }
}

declare const global: NodeJS.Global;
// Mock the chrome API
const mockSetIcon = jest.fn();
global.chrome = {
  action: {
    setIcon: mockSetIcon,
  },
  // Add other chrome APIs if needed by other components or future tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any; // Use 'as any' to simplify mocking complex chrome types

describe("App Component", () => {
  // Clear mock calls before each test
  beforeEach(() => {
    mockSetIcon.mockClear();
  });

  // test("renders the heading", () => {
  //   render(<App />);
  //   const headingElement = screen.getByRole("heading", {
  //     name: /Hello from Timer Chrome Extension!/i,
  //   });
  //   expect(headingElement).toBeInTheDocument();
  // });

  test("renders the initial 'Start Timer' button", () => {
    render(<App />);
    const buttonElement = screen.getByRole("button", { name: /タイマー開始/i }); // "Start Timer"
    expect(buttonElement).toBeInTheDocument();
  });

  test("clicking 'Start Timer' button changes text to 'Stop Timer' and calls setIcon with blue icon path", () => {
    render(<App />);
    const startButton = screen.getByRole("button", { name: /タイマー開始/i }); // "Start Timer"

    fireEvent.click(startButton);

    // Check button text changed
    const stopButton = screen.getByRole("button", { name: /タイマー停止/i }); // "Stop Timer"
    expect(stopButton).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /タイマー開始/i })
    ).not.toBeInTheDocument();

    // Check chrome.action.setIcon was called correctly
    // Note: The isActive state *before* the click was false.
    expect(mockSetIcon).toHaveBeenCalledTimes(1);
    expect(mockSetIcon).toHaveBeenCalledWith({
      path: {
        16: "blue-timer-icon-16.svg", // isActive was false, so use the 'else' path
        48: "blue-timer-icon-48.svg",
      },
    });
  });

  test("clicking 'Stop Timer' button changes text back to 'Start Timer' and calls setIcon with red icon path", () => {
    render(<App />);
    const startButton = screen.getByRole("button", { name: /タイマー開始/i }); // "Start Timer"

    // First click to activate
    fireEvent.click(startButton);
    mockSetIcon.mockClear(); // Clear mock calls after the first click

    const stopButton = screen.getByRole("button", { name: /タイマー停止/i }); // "Stop Timer"

    // Second click to deactivate
    fireEvent.click(stopButton);

    // Check button text changed back
    const startButtonAgain = screen.getByRole("button", {
      name: /タイマー開始/i,
    }); // "Start Timer"
    expect(startButtonAgain).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /タイマー停止/i })
    ).not.toBeInTheDocument();

    // Check chrome.action.setIcon was called correctly
    // Note: The isActive state *before* the second click was true.
    expect(mockSetIcon).toHaveBeenCalledTimes(1);
    expect(mockSetIcon).toHaveBeenCalledWith({
      path: {
        16: "red-timer-icon-16.svg", // isActive was true, so use the 'if' path
        48: "red-timer-icon-48.svg",
      },
    });
  });
});
