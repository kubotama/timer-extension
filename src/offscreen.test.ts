// import { vi, it, expect, beforeEach, afterEach, describe } from "vitest"; // describe を追加
import { vi, it, expect, describe } from "vitest"; // describe を追加

// // --- chrome API のモック ---
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      // 他に runtime で使うメソッドがあればここに追加
    },
    // 他に chrome で使う API (storage, action など) があればここに追加
  },
};

// グローバルオブジェクトに `chrome` をスタブ（差し替え）する
vi.stubGlobal("chrome", mockChrome);
// --- モックここまで ---

// 既存の playAudio 関数のテスト (vi.mock の影響を受けるため修正)
describe("playAudio Function (Actual Implementation)", () => {
  // vi.mock により playAudio がモック化されているため、
  // 元の関数をテストするには vi.importActual を使用します。
  it("設定した時間が経過するとアラーム音が鳴ること", async () => {
    //   // 元の playAudio 関数を動的にインポート
    //   const { playAudio: actualPlayAudio } = await vi.importActual<
    //     typeof import("./offscreen")
    //   >("./offscreen");

    const offscreenModule = await import("./offscreen");
    const actualPlayAudio = offscreenModule.playAudio;

    // Web Audio APIのモック
    const mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
      },
      type: "sine",
      onended: null as (() => void) | null, // onended を null で初期化し、型を明確に
    };

    const mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      currentTime: 0,
      destination: {},
      close: vi.fn(),
    };

    // self.AudioContext をモック
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    self.AudioContext = vi.fn(() => mockAudioContext);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.AudioContext = self.AudioContext; // 念のため

    // モックされていない実際の playAudio 関数を呼び出す
    actualPlayAudio();

    // アサーション
    expect(self.AudioContext).toHaveBeenCalled(); // または window.AudioContext
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.connect).toHaveBeenCalledWith(
      mockAudioContext.destination
    );
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalledWith(0.5); // currentTime(0) + 0.5
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
      880,
      0
    ); // currentTime(0)

    // onended と close の呼び出しもテストする
    expect(mockOscillator.onended).toBeDefined(); // onended が設定されたか
    // onended コールバックを手動で実行して close が呼ばれるか確認
    if (mockOscillator.onended) {
      mockOscillator.onended(); // onended コールバックを実行
    }
    expect(mockAudioContext.close).toHaveBeenCalled(); // close が呼ばれたか
  });
});
// });
