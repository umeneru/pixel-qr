# Web アプリ共通技術設計書

## 1. 概要

本ドキュメントは、Next.js フロントエンドと FastAPI バックエンドで Web アプリを構築するための共通技術設計である。

アプリ固有のドメインロジック、データモデル、API エンドポイント、外部サービス連携は、各プロジェクトの技術設計書で別途定義する。本設計では、複数の Web アプリで共通利用する技術スタック、ディレクトリ構成、開発環境、API 方針、テスト方針を定める。

各プロジェクトでは、本ドキュメントをベース設計として参照し、個別の `technical-design.md` にアプリ固有の仕様を記載する。

## 2. 技術スタック

### 2.1 フロントエンド

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

- 画面表示
- 入力フォーム
- クライアント側の軽い事前バリデーション
- バックエンド API 呼び出し
- ローディング、エラー、成功状態の表示
- ユーザー操作に応じた UI 状態管理

### 2.2 バックエンド API

採用:

- Python
- FastAPI
- uv
- Pydantic

ディレクトリ:

```text
backend/
```

主な責務:

- REST API 提供
- リクエストバリデーション
- ドメインロジック実行
- 外部サービスや永続化層との接続
- レスポンス生成
- エラー形式の統一

### 2.3 デプロイ

デプロイ先はプロジェクトごとに決定する。

ローカル開発時の標準構成:

```text
frontend: http://localhost:4000
backend:  http://localhost:9000
```

## 3. プロジェクト構成

### 3.1 全体構成

```text
frontend/
backend/
docs/
```

### 3.2 フロントエンド構成

```text
frontend/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
  lib/
    api.ts
    validation.ts
  package.json
  tsconfig.json
```

責務:

- `app/layout.tsx`
  - アプリ全体のレイアウト
  - メタデータ定義
- `app/page.tsx`
  - 初期ページまたは主要画面の入口
- `components/`
  - 画面で利用する React コンポーネント
  - フォーム、プレビュー、一覧、詳細、操作ボタンなどを配置する
- `lib/api.ts`
  - バックエンド API 呼び出し
  - レスポンス処理
  - API エラー JSON の処理
- `lib/validation.ts`
  - フロントエンド側の軽い入力チェック
  - 必須チェック、形式チェックなど

必要に応じて追加するディレクトリ:

```text
frontend/
  hooks/
  types/
  constants/
  utils/
```

### 3.3 バックエンド構成

```text
backend/
  src/
    main.py
    api/
    schemas/
      errors.py
    services/
  tests/
  pyproject.toml
  uv.lock
```

責務:

- `src/main.py`
  - FastAPI アプリ作成
  - ルーター登録
  - CORS 設定
  - 共通例外ハンドラー登録
- `src/api/`
  - REST API エンドポイント定義
  - リクエスト受け取り
  - サービス呼び出し
  - レスポンス返却
- `src/schemas/`
  - Pydantic モデル
  - リクエストスキーマ
  - レスポンススキーマ
  - エラーレスポンススキーマ
- `src/services/`
  - アプリ固有のドメインロジック
  - 外部 API や永続化層を使う処理
- `tests/`
  - 単体テスト
  - API テスト

必要に応じて追加するディレクトリ:

```text
backend/
  src/
    core/
    repositories/
    models/
    clients/
    utils/
```

## 4. 開発環境

### 4.1 フロントエンド

開発サーバー:

```bash
npm run dev -- -p 4000
```

API 接続先は環境変数で管理する。

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:9000
```

### 4.2 バックエンド

開発サーバー:

```bash
uv run uvicorn src.main:app --reload --port 9000
```

CORS 設定:

```text
allow_origins:
- http://localhost:4000
```

## 5. REST API 方針

### 5.1 基本方針

- REST API として設計する
- リソース指向の URL を利用する
- JSON リクエスト、JSON レスポンスを基本とする
- ファイルアップロードが必要な場合は `multipart/form-data` を利用する
- 認証、永続化、外部連携はプロジェクトごとに設計する

### 5.2 URL 設計

例:

```text
GET    /resources
POST   /resources
GET    /resources/{resource_id}
PATCH  /resources/{resource_id}
DELETE /resources/{resource_id}
```

単発の処理を行う場合も、可能な限りリソースとして表現する。

### 5.3 成功レスポンス

JSON レスポンス例:

```json
{
  "id": "resource-id",
  "name": "example"
}
```

HTTP ステータスの例:

```text
200 OK
201 Created
204 No Content
```

ファイルや画像を返す API では、適切な `Content-Type` を設定してバイト列を直接返す。

## 6. エラーレスポンス方針

エラーレスポンスはプロジェクト内で統一する。

形式:

```json
{
  "code": "invalid_request",
  "message": "リクエスト内容が不正です"
}
```

代表的な HTTP ステータス:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

方針:

- フロントエンドで分岐しやすい `code` を返す
- ユーザーに表示しやすい `message` を返す
- ログには調査に必要な情報を残す
- 機密情報、個人情報、アップロード内容そのものはログに出力しない

## 7. バリデーション方針

### 7.1 フロントエンド

ユーザー体験向上のため、軽い事前チェックを行う。

- 必須チェック
- 形式チェック
- ファイル形式チェック
- 明らかな入力ミスの表示

ただし、フロントエンドのチェックは信頼せず、バックエンドで必ず再検証する。

### 7.2 バックエンド

バックエンドを正とする。

- Pydantic によるリクエスト検証
- 必須チェック
- 型チェック
- 形式チェック
- サイズ制限
- 許可された Content-Type の確認
- アプリ固有の業務ルール検証

## 8. セキュリティ・プライバシー

基本方針:

- 不要なデータを保存しない
- 入力値をバックエンドで必ず検証する
- CORS は許可 origin を明示する
- 機密情報、個人情報、アップロード内容そのものをログに出力しない
- API キーやシークレットは環境変数で管理する
- クライアントへ公開する環境変数は `NEXT_PUBLIC_` が付くものだけに限定する

ファイルアップロードを扱う場合:

- 最大ファイルサイズを制限する
- 許可 Content-Type を明示する
- ファイル内容をライブラリ側でも検証する
- 必要がない限り永続保存しない

## 9. テスト方針

### 9.1 バックエンド

pytest を利用する。

対象:

- バリデーションの単体テスト
- サービス層の単体テスト
- API エンドポイントのテスト
- エラーケースのテスト

### 9.2 フロントエンド

MVP では最小限とする。

対象:

- TypeScript チェック
- lint
- build
- API 呼び出し処理の単体テストは必要に応じて追加

### 9.3 E2E

Playwright による E2E テストは、MVP では原則後回しとする。

ユーザー操作の複雑さ、決済、認証、重要な業務フローがある場合は、プロジェクトごとに導入を検討する。

## 10. MVP で後回しにしやすい技術要素

プロジェクト要件上必須でない限り、MVP では以下を後回しにする。

- ユーザー認証
- データベース
- オブジェクトストレージ
- API キー認証
- 管理画面
- E2E テスト
- 複雑な権限管理
- 外部決済
- 非同期ジョブ基盤
- キュー
- キャッシュ基盤

## 11. プロジェクト固有設計で決めること

各アプリの技術設計書では、以下を個別に定義する。

- アプリ概要
- 対象ユーザー
- 主要ユースケース
- ドメインモデル
- API エンドポイント
- 入力・出力仕様
- バリデーションルール
- 永続化の有無
- 外部サービス連携
- 認証・認可の有無
- デプロイ先
- 運用・監視方針

## 12. 個別設計書の推奨構成

各プロジェクトの `technical-design.md` は、以下の構成を基本とする。

新規プロジェクトでは、`docs/technical-design-template.md` をコピーして個別設計書を作成する。

```text
1. 概要
2. ベース設計
3. アプリ固有の技術スタック
4. プロジェクト構成
5. API 設計
6. ドメインロジック設計
7. バリデーション
8. セキュリティ・プライバシー
9. テスト方針
10. MVP 対象外
11. 将来拡張
```

アプリ固有の事情がない項目は、本ドキュメントを参照するだけでよい。
