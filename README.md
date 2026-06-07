# Pixel QR

Pixel QR は、ドット絵 PNG を中央に埋め込んだ QR コードを作成できる Web アプリです。

## 特徴

- URL から QR コードを生成
- PNG のドット絵画像を中央に合成
- 画像を指定ピクセル数へ最近傍でリサイズ
- 生成結果を PNG としてダウンロード
- スマホブラウザでも使いやすいコンパクトな UI

## プライバシー

このアプリは完全にブラウザ内で動作します。

入力した URL やアップロードした画像は、アプリサーバーへ送信されません。QR コード生成、画像合成、PNG 出力はすべてブラウザ上で完結します。

## 開発

依存関係をインストールします。

```bash
task install
```

開発サーバーを起動します。

```bash
task dev
```

起動後、ブラウザで以下を開きます。

```text
http://localhost:4000
```

## チェック

lint、型チェック、ビルドをまとめて実行します。

```bash
task check
```

個別に実行する場合は、`frontend` ディレクトリで以下を実行します。

```bash
npm run lint
npm run typecheck
npm run build
```

## 構成

```text
frontend/  Next.js アプリ
docs/      要件定義・技術設計
```
