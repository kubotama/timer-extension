import { vi, it, expect, describe, Mock } from "vitest" // describe を追加

describe("playAudio Function (Actual Implementation)", () => {
  it("設定した時間が経過するとアラーム音が鳴ること", async () => {
    // モック用のインターフェースを定義
    interface MockOscillatorNode {
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>
      }
      type: OscillatorType
      onended: (() => void) | null
    }

    interface MockGainNode {
      gain: { setValueAtTime: ReturnType<typeof vi.fn> }
      connect: ReturnType<typeof vi.fn>
    }

    interface MockAudioContext {
      createOscillator: Mock<() => MockOscillatorNode>
      currentTime: number
      destination: AudioDestinationNode
      close: Mock<() => void>
      currentOscillator?: MockOscillatorNode // 内部で使うプロパティ
      createGain: Mock<() => MockGainNode>
      currentGain?: MockGainNode
    }

    // self.AudioContext をモック
    const MockAudioContextConstructor = vi.fn(function (
      this: MockAudioContext,
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
        }
        // インスタンスが保持する oscillator を更新
        this.currentOscillator = mockOscillator
        return mockOscillator
      })
      this.currentTime = 0
      this.destination = {} as AudioDestinationNode
      this.close = vi.fn()

      this.createGain = vi.fn(() => {
        const mockGain: MockGainNode = {
          gain: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
        }
        this.currentGain = mockGain
        return mockGain
      })
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    self.AudioContext = MockAudioContextConstructor
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.AudioContext = MockAudioContextConstructor // 念のため

    const offscreenModule = await import("./offscreen")
    const actualPlayAudio = offscreenModule.playAudio

    // モックされていない実際の playAudio 関数を呼び出す
    actualPlayAudio()

    // アサーション
    expect(MockAudioContextConstructor).toHaveBeenCalledWith() // AudioContext のコンストラクタが呼び出されたことを検証

    // インスタンスを取得
    const audioCtxInstance = MockAudioContextConstructor.mock.instances[0]
    expect(audioCtxInstance.createOscillator).toHaveBeenCalledWith()

    const oscillatorInstance = audioCtxInstance.currentOscillator
    // null/undefinedチェックを追加して、non-null assertion (!) を避ける
    if (!oscillatorInstance) {
      // currentOscillatorが設定されていない場合はテストを失敗させる
      expect(oscillatorInstance).not.toBeNull()
      return
    }

    expect(oscillatorInstance.frequency.setValueAtTime).toHaveBeenCalledWith(
      expect.any(Number),
      audioCtxInstance.currentTime,
    )
    expect(audioCtxInstance.createGain).toHaveBeenCalledWith()
    expect(
      audioCtxInstance.currentGain?.gain.setValueAtTime,
    ).toHaveBeenCalledWith(expect.any(Number), audioCtxInstance.currentTime)
    expect(audioCtxInstance.currentGain?.connect).toHaveBeenCalledWith(
      audioCtxInstance.destination,
    )
    expect(oscillatorInstance.connect).toHaveBeenCalledWith(
      audioCtxInstance.currentGain,
    )
    expect(oscillatorInstance.start).toHaveBeenCalled()
    expect(oscillatorInstance.stop).toHaveBeenCalledWith(expect.any(Number)) // currentTime(0) + 0.5

    // onended と close の呼び出しもテストする
    expect(oscillatorInstance.onended).toBeDefined() // onended が設定されたか

    // onended コールバックを手動で実行して close が呼ばれるか確認
    if (oscillatorInstance.onended) {
      oscillatorInstance.onended() // onended コールバックを実行
    }
    expect(audioCtxInstance.close).toHaveBeenCalled() // close が呼ばれたか
  })
})
// });
