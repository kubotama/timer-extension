import "@testing-library/jest-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import { StatusResponse, TIMER } from "./constants";
import { act } from "react";

// Mock the chrome API
const mockSendMessage = vi.fn();

// --- Mock Implementation ---
// We need a way to control the response based on the message type
const mockChrome = {
  runtime: {
    sendMessage: mockSendMessage,
    // Mock other chrome APIs if needed by other components or hooks
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    },
    // ... other runtime properties if needed
  },
  // Mock other top-level chrome APIs if needed
  tabs: {
    // Mock tab functions if needed
  },
  // ... other APIs
};

// Assign the mock to the global scope before tests run
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).chrome = mockChrome;

// --- Test Suite ---
describe("App Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSendMessage.mockClear();
    // Default mock implementation for initial status check (timer off)
    mockSendMessage.mockResolvedValue({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: false,
      timerSeconds: 10,
    } as StatusResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests timer status on mount", async () => {
    act(() => {
      render(<App />);
    });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledTimes(1);
      expect(mockSendMessage).toHaveBeenCalledWith({
        type: TIMER.MESSAGE_STATUS_REQUEST,
      });
    });
  });

  it("updates button text to '開始' when initial status is false", async () => {
    // Arrange: Mock response for initial status check
    mockSendMessage.mockResolvedValueOnce({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: false,
      timerSeconds: 30,
    } as StatusResponse);

    // Act
    render(<App />);

    // Assert: Wait for the button text to update after the promise resolves
    await waitFor(() => {
      const buttonElement = screen.getByRole("button", { name: "開始" });
      expect(buttonElement).toBeInTheDocument();
      const inputElement = screen.getByRole("textbox");
      expect(inputElement).toHaveValue("30");
    });
    // Verify the initial call was made
    expect(mockSendMessage).toHaveBeenCalledWith({
      type: TIMER.MESSAGE_STATUS_REQUEST,
    });
  });

  it("updates button text to '停止' when initial status is true", async () => {
    // Arrange: Mock response for initial status check
    mockSendMessage.mockResolvedValueOnce({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: true,
      timerSeconds: 10,
    } as StatusResponse);

    // Act
    render(<App />);

    // Assert: Wait for the button text to update
    await waitFor(() => {
      const buttonElement = screen.getByRole("button", { name: "停止" });
      expect(buttonElement).toBeInTheDocument();
    });
    // Verify the initial call was made
    expect(mockSendMessage).toHaveBeenCalledWith({
      type: TIMER.MESSAGE_STATUS_REQUEST,
    });
  });

  it("sends CLICKED message and updates button to '停止' when '開始' is clicked", async () => {
    // Arrange: Initial status is false
    mockSendMessage.mockResolvedValueOnce({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: false,
      timerSeconds: 10,
    } as StatusResponse);
    render(<App />);

    // Wait for initial state to settle ("開始" button)
    const startButton = await screen.findByRole("button", { name: "開始" });

    // Arrange: Mock response for the click action (timer will start)
    mockSendMessage.mockResolvedValueOnce({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: true,
      timerSeconds: 10,
    } as StatusResponse);

    // Act: Click the button
    fireEvent.click(startButton);

    // Assert: Check if the correct message was sent
    // The first call was for status, the second for the click
    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(2, {
      type: TIMER.MESSAGE_CLICKED,
      timerSeconds: 10,
    });

    // Assert: Wait for the button text to update to '停止'
    await waitFor(() => {
      const stopButton = screen.getByRole("button", { name: "停止" });
      expect(stopButton).toBeInTheDocument();
    });
  });

  it("sends CLICKED message and updates button to '開始' when '停止' is clicked", async () => {
    // Arrange: Initial status is true
    mockSendMessage.mockResolvedValueOnce({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: true,
      timerSeconds: 20,
    } as StatusResponse);
    render(<App />);

    // Wait for initial state to settle ("停止" button)
    const stopButton = await screen.findByRole("button", { name: "停止" });

    // Arrange: Mock response for the click action (timer will stop)
    mockSendMessage.mockResolvedValueOnce({
      type: TIMER.MESSAGE_STATUS_RESPONSE,
      status: false,
      timerSeconds: 20,
    } as StatusResponse);

    // Act: Click the button
    fireEvent.click(stopButton);

    // Assert: Check if the correct message was sent
    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(2, {
      type: TIMER.MESSAGE_CLICKED,
      timerSeconds: 20,
    });

    // Assert: Wait for the button text to update to '開始'
    await waitFor(() => {
      const startButton = screen.getByRole("button", { name: "開始" });
      expect(startButton).toBeInTheDocument();
    });
  });

  it("handles potential errors or unexpected responses gracefully (e.g., wrong type)", async () => {
    // Arrange: Mock an unexpected response for the initial status check
    mockSendMessage.mockResolvedValueOnce({ type: "UNEXPECTED_TYPE" }); // Not StatusResponse

    render(<App />);

    // Assert: Button should eventually show '開始' (initial state after loading)
    // because the state update condition `response.type === TIMER.MESSAGE_STATUS_RESPONSE` fails
    await waitFor(() => {
      // It might briefly show "読み込み中..." then default to "開始"
      const buttonElement = screen.getByRole("button", { name: "開始" });
      expect(buttonElement).toBeInTheDocument();
    });

    // Arrange: Mock an unexpected response for the click action
    const startButton = screen.getByRole("button", { name: "開始" });
    mockSendMessage.mockResolvedValueOnce({ type: "ANOTHER_UNEXPECTED_TYPE" });

    // Act: Click the button
    fireEvent.click(startButton);

    // Assert: Button text should remain '開始' because the state wasn't updated
    await waitFor(() => {
      const buttonElement = screen.getByRole("button", { name: "開始" });
      expect(buttonElement).toBeInTheDocument();
    });
    // Ensure the click message was still sent
    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenNthCalledWith(2, {
      type: TIMER.MESSAGE_CLICKED,
      timerSeconds: 0,
    });
  });
});
