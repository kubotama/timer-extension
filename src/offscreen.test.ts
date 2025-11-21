// import { vi, it, expect, beforeEach, afterEach, describe } from "vitest"; // describe を追加
import { vi, it, expect, describe, Mock } from "vitest"; // describe を追加

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

    // モック用のインターフェースを定義
    interface MockOscillatorNode {
      connect: ReturnType<typeof vi.fn>;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>;
      };
      type: OscillatorType;
      onended: (() => void) | null;
    }

    interface MockAudioContext {
      createOscillator: Mock<() => MockOscillatorNode>;
      currentTime: number;
      destination: AudioDestinationNode;
      close: Mock<() => void>;
      currentOscillator?: MockOscillatorNode; // 内部で使うプロパティ
    }

    // self.AudioContext をモック
    const MockAudioContextConstructor = vi.fn(function (
      this: MockAudioContext
    ) {
      // this は新しく作成される AudioContext のインスタンス
      this.createOscillator = vi.fn(() => {
        // OscillatorNode のモック
        const mockOscillator: MockOscillatorNode = {
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: {
            setValueAtTime: vi.fn(),
          },
          type: "sine",
          onended: null,
        };
        // インスタンスが保持する oscillator を更新
        this.currentOscillator = mockOscillator;
        return mockOscillator;
      });
      this.currentTime = 0;
      this.destination = {} as AudioDestinationNode;
      this.close = vi.fn();
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    self.AudioContext = MockAudioContextConstructor;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.AudioContext = MockAudioContextConstructor; // 念のため

    // モックされていない実際の playAudio 関数を呼び出す
    actualPlayAudio();

    // アサーション
    expect(MockAudioContextConstructor).toHaveBeenCalled(); // AudioContext のコンストラクタが呼び出されたことを検証

    // インスタンスを取得
    const audioCtxInstance = MockAudioContextConstructor.mock.instances[0];
    expect(audioCtxInstance.createOscillator).toHaveBeenCalled();

    const oscillatorInstance = audioCtxInstance.currentOscillator;
    // null/undefinedチェックを追加して、non-null assertion (!) を避ける
    if (!oscillatorInstance) {
      // currentOscillatorが設定されていない場合はテストを失敗させる
      throw new Error("oscillatorInstance should be defined");
    }

    expect(oscillatorInstance.connect).toHaveBeenCalledWith(
      audioCtxInstance.destination
    );
    expect(oscillatorInstance.start).toHaveBeenCalled();
    expect(oscillatorInstance.stop).toHaveBeenCalledWith(0.5); // currentTime(0) + 0.5
    expect(oscillatorInstance.frequency.setValueAtTime).toHaveBeenCalledWith(
      880,
      0
    ); // currentTime(0)

    // onended と close の呼び出しもテストする
    expect(oscillatorInstance.onended).toBeDefined(); // onended が設定されたか

    // onended コールバックを手動で実行して close が呼ばれるか確認
    if (oscillatorInstance.onended) {
      oscillatorInstance.onended(); // onended コールバックを実行
    }
    expect(audioCtxInstance.close).toHaveBeenCalled(); // close が呼ばれたか
  });
});
// });
