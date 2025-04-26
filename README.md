# タイマーの Chrome の拡張機能

## 概要

タイマー機能の拡張機能です。設定された時間が経過すると、アラーム音がなります。停止するまでは、自動的に繰り返します。時間の設定は、いまのところはソースコードに直接記入します。今後、設定する機能を追加する予定です。

## インストール方法

### リポジトリのクローン

```bash
git clone https://github.com/kubotama/timer-extension
```

### プロジェクトディレクトリに移動

```bash
cd timer-extension
```

### 依存パッケージのインストール

```bash
npm install
```

### テストプログラムの実行

```bash
npm run test
```

## 使用方法

### ビルド

```bash
npm run build
```

### 拡張機能の読み込み

1. 拡張機能の管理画面を開く。
2. デベロッパーモードを有効にする。
3. 「パッケージ化されていない拡張機能を読み込む」ボタンをクリックする。
4. ビルド結果のディレクトリ(dist)を指定して、拡張機能を読み込む。

## 技術スタック

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [vite](https://ja.vite.dev/)
- [vitest](https://vitest.dev/)
