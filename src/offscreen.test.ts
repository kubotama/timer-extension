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

// // --- playAudio 関数のモック化 ---
// // vi.mock は import 文の直後、コードの実行前に置くのが一般的です
// const mockPlayAudio = vi.fn();
// vi.mock("./offscreen", async (importOriginal) => {
//   // 元のモジュールをインポートし、playAudio のみモックに差し替えます
//   const originalModule = await importOriginal<typeof import("./offscreen")>();
//   return {
//     ...originalModule, // 元のモジュールの他のエクスポートはそのまま
//     playAudio: mockPlayAudio, // playAudio をモック関数で上書き
//   };
// });
// // --- モックここまで ---

// // モックを設定した後に offscreen モジュールをインポートします
// // これにより、offscreen.ts 内のトップレベルコード (addListener の登録) が実行されます
// // await import("./offscreen");

// console.log(
//   "Listener mock calls:",
//   mockChrome.runtime.onMessage.addListener.mock.calls.length
// );

// // 各テストの前にモックの状態をリセット
// beforeEach(async () => {
//   vi.resetAllMocks(); // すべてのモックをリセット
//   vi.clearAllMocks(); // すべてのモックをクリア

//   vi.stubGlobal("chrome", mockChrome);
//   await import("./offscreen");

//   // 必要に応じて特定のモックをリセット (addListener は毎回クリアした方が安全)
//   // mockChrome.runtime.onMessage.addListener.mockClear();
//   mockPlayAudio.mockClear(); // playAudio モックもクリア
// });

// afterEach(() => {
//   vi.unstubAllGlobals(); // グローバルスタブを解除
// });

// describe("Offscreen Script Logic", () => {
//   describe("chrome.runtime.onMessage Listener", () => {
//     it("メッセージに 'play' プロパティが含まれている場合、playAudio を呼び出すこと", () => {
//       // 1. addListener がモジュールインポート時に1回呼び出されていることを確認
//       expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);

//       // 2. addListener に渡されたコールバック関数（リスナー）を取得
//       const listenerCallback =
//         mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

//       // 3. 'play' プロパティを持つメッセージオブジェクトを作成
//       const messageWithPlay = { play: "start" }; // 値は何でも良い

//       // 4. リスナーコールバックをテストメッセージで実行
//       listenerCallback(messageWithPlay);

//       // 5. mockPlayAudio が1回呼び出されたことを確認
//       expect(mockPlayAudio).toHaveBeenCalledTimes(1);
//     });

//     // it("メッセージに 'play' プロパティが含まれていない場合、playAudio を呼び出さないこと", () => {
//     //   // 1. addListener が呼び出されていることを確認
//     //   expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);

//     //   // 2. リスナーコールバックを取得
//     //   const listenerCallback =
//     //     mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

//     //   // 3. 'play' プロパティを持たないメッセージオブジェクトを作成
//     //   const messageWithoutPlay = { action: "stop" };

//     //   // 4. リスナーコールバックを実行
//     //   listenerCallback(messageWithoutPlay);

//     //   // 5. mockPlayAudio が呼び出されていないことを確認
//     //   expect(mockPlayAudio).not.toHaveBeenCalled();
//     // });

//     // it("空のメッセージオブジェクトの場合、playAudio を呼び出さないこと", () => {
//     //   // 1. addListener が呼び出されていることを確認
//     //   expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);

//     //   // 2. リスナーコールバックを取得
//     //   const listenerCallback =
//     //     mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

//     //   // 3. 空のメッセージオブジェクトを作成
//     //   const emptyMessage = {};

//     //   // 4. リスナーコールバックを実行
//     //   listenerCallback(emptyMessage);

//     //   // 5. mockPlayAudio が呼び出されていないことを確認
//     //   expect(mockPlayAudio).not.toHaveBeenCalled();
//     // });

//     // it("メッセージが null や undefined の場合 (通常は発生しないが念のため)、playAudio を呼び出さないこと", () => {
//     //   // 1. addListener が呼び出されていることを確認
//     //   expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);

//     //   // 2. リスナーコールバックを取得
//     //   const listenerCallback =
//     //     mockChrome.runtime.onMessage.addListener.mock.calls[0][0];

//     //   // 3. null や undefined でリスナーコールバックを実行
//     //   listenerCallback(null);
//     //   listenerCallback(undefined);

//     //   // 5. mockPlayAudio が呼び出されていないことを確認
//     //   expect(mockPlayAudio).not.toHaveBeenCalled();
//     // });
//   });

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
      440,
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
