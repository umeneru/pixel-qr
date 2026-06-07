# Pixel QR 技術設計書

## 1. 概要

Pixel QR は、URL とドット絵 PNG 画像を入力し、ドット絵を中央に埋め込んだ QR コード PNG を生成するブラウザ完結型 Web アプリである。

URL、アップロード画像、生成結果はアプリサーバーへ送信しない。QR 生成、画像リサイズ、中央合成、PNG 出力はすべてブラウザ内で実行する。

## 2. 技術スタック

- Next.js
- React
- TypeScript
- Tailwind CSS
- qrcode
- Canvas API

## 3. プロジェクト構成

```text
frontend/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    pixel-qr-form.tsx
    qr-preview.tsx
  lib/
    browser-qr.ts
    validation.ts
    download.ts
  public/
    fonts/
      BestTen-CRT.otf
  package.json
  tsconfig.json
docs/
```

## 4. 主な責務

- `components/pixel-qr-form.tsx`
  - URL 入力
  - PNG 画像アップロード
  - 一辺のピクセル数入力
  - 入力エラー表示
  - ブラウザ内 QR 生成の呼び出し
- `components/qr-preview.tsx`
  - 生成中表示
  - QR 画像プレビュー
  - PNG ダウンロードボタン
- `lib/browser-qr.ts`
  - `qrcode` による QR モジュール生成
  - Canvas による QR 描画
  - アップロード画像の最近傍リサイズ
  - 中央合成
  - Canvas から PNG Blob への変換
- `lib/validation.ts`
  - URL 必須、URL 形式チェック
  - PNG 必須、PNG MIME type チェック
  - ファイルサイズチェック
  - ピクセル数チェック
- `lib/download.ts`
  - Blob URL 生成
  - `pixel-qr.png` としてダウンロード

## 5. QR 生成仕様

- 入力 URL を QR コード内容にする
- 誤り訂正レベルは `H`
- QR 本体は黒、背景は白
- クワイエットゾーンは 4 モジュール
- 1 モジュールあたり 4px で Canvas に描画する
- 中央画像は QR モジュールの最大 40% を上限にする
- アップロード画像は指定された一辺のピクセル数へ最近傍で正方形リサイズする
- 透明部分は白背景に合成される

## 6. プライバシー

- 入力 URL はブラウザ内でのみ使用する
- アップロード画像はブラウザ内でのみ読み込む
- 生成結果は Blob URL としてブラウザ内で保持する
- アプリサーバーへの生成 API は持たない
- 生成履歴、画像、URL は保存しない

## 7. 開発環境

インストール:

```bash
task install
```

開発サーバー:

```bash
task dev
```

チェック:

```bash
task check
```
