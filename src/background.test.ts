import { describe, beforeEach, it, expect, vi } from "vitest";

// Chrome APIのモック
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
      callListeners: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
      callListeners: vi.fn(),
    },
  },
  storage: {
    local: {
      set: vi.fn(),
      get: vi.fn(),
      clear: vi.fn(),
    },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
      callListeners: vi.fn(),
    },
  },
};

// グローバルなchromeオブジェクトをモックに置き換え
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.chrome = mockChrome as any;

describe("Timer Extension Background", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // これを追加
  });

  describe("インストール時の初期設定", () => {
    it("正しい初期値が設定されること", async () => {
      // background.tsをインポート（モックの設定後に）
      await import("./background");

      // onInstalledのリスナーを実行
      const installedCallback =
        mockChrome.runtime.onInstalled.addListener.mock.calls[0][0];
      installedCallback();

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        isRunning: false,
        timeLeft: 180,
      });
    });
  });

  describe("タイマー制御", () => {
    it("START_TIMERメッセージで正しくタイマーが開始されること", async () => {
      await import("./background");
      const messageCallback =
        mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

      messageCallback({ type: "START_TIMER", duration: 300 });

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        isRunning: true,
        timeLeft: 300,
      });
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        text: "300",
      });
      expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: "#4CAF50",
      });
      expect(mockChrome.alarms.create).toHaveBeenCalledWith("timer", {
        periodInMinutes: 1 / 60,
      });
    });

    it("STOP_TIMERメッセージで正しくタイマーが停止されること", async () => {
      await import("./background");
      const messageCallback =
        mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

      messageCallback({ type: "STOP_TIMER" });

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        isRunning: false,
      });
      expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: "#F44336",
      });
      expect(mockChrome.alarms.clear).toHaveBeenCalledWith("timer");
    });
  });

  describe("アラーム処理", () => {
    it("タイマーが正しくカウントダウンされること", async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        isRunning: true,
        timeLeft: 10,
      });

      await import("./background");
      const alarmCallback =
        mockChrome.alarms.onAlarm.addListener.mock.calls[0][0];

      await alarmCallback({ name: "timer" });

      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        text: "9",
      });
    });

    it("タイマーが0になったら停止すること", async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        isRunning: true,
        timeLeft: 1,
      });

      await import("./background");
      const alarmCallback =
        mockChrome.alarms.onAlarm.addListener.mock.calls[0][0];

      await alarmCallback({ name: "timer" });

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        isRunning: false,
      });
      expect(mockChrome.alarms.clear).toHaveBeenCalledWith("timer");
    });
  });
});
