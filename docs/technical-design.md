# Pixel QR 技術設計書

## 1. 概要

Pixel QR は、URL とドット絵 PNG 画像を入力し、ドット絵を中央に埋め込んだ QR コード PNG を生成する Web サービスである。

MVP では、フロントエンドが入力 UI とプレビュー、ダウンロード操作を担当し、バックエンド API が URL・画像のバリデーション、QR コード生成、ドット絵合成、PNG レスポンス返却を担当する。

## 2. ベース設計

本設計書は `docs/base-technical-design.md` を前提とし、Pixel QR 固有の API、バリデーション、画像生成仕様を定義する。

共通の技術スタック、標準ディレクトリ構成、開発ポート、REST API 方針、エラーレスポンス方針、テスト方針はベース設計に従う。

## 3. 技術スタック

### 3.1 フロントエンド

採用:

- Next.js
- React
- TypeScript
- Tailwind CSS
- npm

ディレクトリ:

```text
frontend/
```

主な責務:

- URL 入力
- PNG 画像アップロード
- 入力値の軽い事前バリデーション
- バックエンド API 呼び出し
- 生成中、エラー、プレビュー状態の表示
- 生成された PNG のダウンロード

### 3.2 バックエンド API

採用:

- Python
- FastAPI
- uv
- qrcode[pil]
- Pillow
- Pydantic

ディレクトリ:

```text
backend/
```

主な責務:

- URL バリデーション
- 画像形式バリデーション
- 画像サイズバリデーション
- QR コード生成
- ドット絵画像の合成
- PNG バイト列生成
- PNG レスポンス返却

### 3.3 デプロイ

デプロイ先は MVP 時点では未定とする。

ローカル開発時の構成:

```text
frontend: http://localhost:4000
backend:  http://localhost:9000
```

## 4. プロジェクト構成

### 4.1 全体構成

```text
frontend/
backend/
docs/
```

### 4.2 フロントエンド構成

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
    api.ts
    validation.ts
    download.ts
  package.json
  tsconfig.json
```

責務:

- `app/page.tsx`
  - 1 画面ツールのページ入口
- `components/pixel-qr-form.tsx`
  - URL 入力
  - 画像アップロード
  - 生成ボタン
  - 入力エラー表示
- `components/qr-preview.tsx`
  - 生成中表示
  - QR 画像プレビュー
  - ダウンロードボタン
  - API エラー表示
- `lib/api.ts`
  - `POST /qr-codes` 呼び出し
  - PNG Blob 受け取り
  - API エラー JSON の処理
- `lib/validation.ts`
  - フロントエンド側の軽い入力チェック
  - URL 必須、URL 形式チェック
  - ファイル必須、PNG チェック
- `lib/download.ts`
  - Blob URL 生成
  - `pixel-qr.png` としてダウンロード

### 4.3 バックエンド構成

```text
backend/
  src/
    main.py
    api/
      qr_codes.py
    schemas/
      errors.py
    services/
      image_validator.py
      qr_generator.py
  tests/
  pyproject.toml
  uv.lock
```

責務:

- `src/main.py`
  - FastAPI アプリ作成
  - ルーター登録
  - CORS 設定
- `src/api/qr_codes.py`
  - `POST /qr-codes` の定義
  - `multipart/form-data` の受け取り
  - サービス呼び出し
  - PNG レスポンス返却
  - 例外を API エラー形式へ変換
- `src/schemas/errors.py`
  - エラーレスポンス形式
  - エラーコード定義
- `src/services/image_validator.py`
  - PNG 形式チェック
  - 画像読み込み
  - サイズチェック
  - 透明部分の白背景合成
- `src/services/qr_generator.py`
  - QR コード生成
  - ドット絵拡大
  - 中央合成
  - PNG バイト列生成

## 5. 開発環境

### 5.1 フロントエンド

開発サーバー:

```bash
npm run dev -- -p 4000
```

API 接続先は環境変数で管理する。

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:9000
```

### 5.2 バックエンド

開発サーバー:

```bash
uv run uvicorn src.main:app --reload --port 9000
```

CORS 設定:

```text
allow_origins:
- http://localhost:4000
```

## 6. REST API 設計

### 6.1 QR コード作成

```text
POST /qr-codes
```

QR コード画像を作成し、生成した PNG をレスポンスボディで直接返す。

サーバーは生成画像を永続保存しないため、`Location` ヘッダーで参照可能な永続リソースは返さない。

### 6.2 リクエスト

```text
Content-Type: multipart/form-data
```

フィールド:

```text
url: string
image: file
```

### 6.3 成功レスポンス

```text
201 Created
Content-Type: image/png
```

レスポンスボディには生成された PNG バイト列を返す。

### 6.4 エラーレスポンス

形式:

```json
{
  "code": "invalid_image_size",
  "message": "画像サイズは 16x16, 32x32, 64x64 のみ対応しています"
}
```

エラーコード:

```text
missing_url
missing_image
invalid_url
invalid_image_type
invalid_image_size
image_decode_failed
qr_generation_failed
```

HTTP ステータス:

```text
400 Bad Request
- missing_url
- missing_image
- invalid_url
- invalid_image_type
- invalid_image_size
- image_decode_failed

500 Internal Server Error
- qr_generation_failed
```

## 7. QR 画像生成仕様

生成仕様:

```text
output_size: 1024x1024
error_correction: H
input_image_size: 16x16, 32x32, 64x64
embedded_image_max_ratio: 20%
transparent_pixels: 白背景として扱う
```

詳細:

- 生成する QR コード PNG は `1024x1024px` 固定とする
- QR コードの誤り訂正レベルは `H` 固定とする
- アップロード画像は PNG の `16x16`, `32x32`, `64x64` のみ受け付ける
- ドット絵は QR コード中央に配置する
- ドット絵の表示サイズは QR 全体の最大 `20%` とする
- ドット絵の拡大には nearest neighbor を使い、ピクセル感を保つ
- 透明 PNG の透明部分は白背景として合成する
- 生成画像は PNG としてレスポンスする

## 8. バリデーション

### 8.1 URL

バックエンドで必ず検証する。

- 必須
- URL 形式
- `http://` または `https://` のスキーム

フロントエンドでも、ユーザー体験向上のため軽い事前チェックを行う。

### 8.2 画像

バックエンドで必ず検証する。

- 必須
- 最大ファイルサイズ `1MB`
- Content-Type は `image/png` のみ
- Pillow で正常に読み込めること
- 画像サイズは `16x16`, `32x32`, `64x64` のみ

フロントエンドでも、ファイル必須と PNG 形式の軽い事前チェックを行う。

## 9. セキュリティ・プライバシー

- URL と画像は永続保存しない
- URL と画像は生成処理中のみメモリ上で扱う
- ログに URL、画像内容、生成画像を出力しない
- アップロード画像の最大ファイルサイズは `1MB` とする
- 対応 Content-Type は `image/png` のみにする
- CORS は許可 origin を明示する

## 10. テスト方針

### 10.1 バックエンド

pytest を利用する。

対象:

- URL バリデーションの単体テスト
- 画像形式バリデーションの単体テスト
- 画像サイズバリデーションの単体テスト
- QR 生成サービスの単体テスト
- `POST /qr-codes` の API テスト

### 10.2 フロントエンド

MVP では最小限とする。

対象:

- TypeScript チェック
- lint
- build
- API 呼び出し処理の単体テストは必要に応じて追加

### 10.3 E2E

Playwright による E2E テストは MVP では後回しとする。

## 11. MVP で対象外とする技術要素

- 生成履歴保存
- ユーザー認証
- データベース
- オブジェクトストレージ
- API キー認証
- SVG 出力
- 読み取り検証
- 読み取り不可時の自動補正
- ドット絵エディタ
- AI による画像生成

## 12. 将来拡張

将来的に検討する機能:

- ブラウザまたはバックエンドでの QR 読み取り検証
- 読み取り不可時の自動補正
- SVG ダウンロード
- 背景色、QR 色の変更
- ドット絵の表示サイズ調整
- 複数テンプレート
- SNS 用プリセット
- 印刷向け高解像度出力
- ドット絵エディタ
- AI によるドット絵生成
