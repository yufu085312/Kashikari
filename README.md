# Kashikari

スマートな割り勘、カンタンな貸し借り管理。  
「誰がいくら払ったか」「誰がいくら借りているか」をシンプルに管理できるウェブアプリケーションです。

## 🚀 主な機能

- **グループ管理**: 飲み会、旅行、シェアハウスなど、シーンに合わせたグループを作成。
- **簡単招待**: 検索IDや専用の招待リンクを使って、友だちを簡単にグループに招待。
- **支払い記録**: 「誰が」「いくら」支払ったかを即座に記録。
- **自動残高計算**: 複雑な貸し借りの状態を自動で集計し、常に最新の残高を表示。
- **スムーズな精算**: 最適な支払い経路を計算し、誰から誰へ送金すればよいかを提示。
- **PWA対応**: ホーム画面に追加することで、ネイティブアプリのように快適に利用可能。
- **レスポンシブデザイン**: スマートフォン、タブレット、PCのすべてのデバイスに最適化。

## 🛠 技術スタック

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend / DB**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime)
- **Deployment**: [Cloudflare](https://cloudflare.com/)
- **Analytics / SEO**: Google Analytics (GA4), Google Search Console

## 🏗 アーキテクチャ

本プロジェクトは、保守性と拡張性を意識したシンプルな構造を採用しています。

- `app/`: Next.js App Router によるルーティングとサーバー・クライアント・コンポーネント。
- `components/`: UIコンポーネント。`ui/` (汎用), `groups/`, `payments/`, `balances/` などの機能別に分類。
- `lib/`: ビジネスロジック。
  - `repositories/`: データアクセス層 (Supabase とのやり取り)。
  - `usecases/`: 計算ロジックなどのビジネスユースケース。
- `utils/`: ユーティリティ関数や共有の設定。
- `types/`: TypeScript の型定義。

## ⚙️ セットアップ

1. リポジトリをクローン:
   ```bash
   git clone https://github.com/yufu085312/Kashikari.git
   ```
2. 依存関係のインストール:
   ```bash
   npm install
   ```
3. 環境変数の設定:
   `.env.local` ファイルを作成し、必要な環境変数を設定してください。
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://kashikari.yu-fu.site
   ```
4. 開発環境の起動:
   ```bash
   npm run up
   ```
   ※ このコマンドは `npx supabase start`（DB/Auth等の起動）と `docker compose up -d`（アプリ本体の起動）を連続して実行するショートカットです。

5. 開発環境の停止:
   ```bash
   npm run down
   ```
   ※ `docker compose down` と `npx supabase stop` を実行します。

## 💾 データベース・マイグレーション

Supabase のデータベーススキーマ変更（マイグレーション）を適用・管理する方法です。

### ローカル環境への適用

差分となる新しいマイグレーションのみをローカルDBに適用する場合（推奨）:
```bash
npx supabase migration up
```

ローカルDBを完全に初期化し、全マイグレーションを再適用する場合（※テストデータ等は消去されます）:
```bash
npx supabase db reset
```

### 本番環境への適用

本番環境（リモートの Supabase プロジェクト）へマイグレーションを反映させます。事前に `supabase link` で本番プロジェクトと紐付いている必要があります。
```bash
npx supabase db push
```

## 🧹 コードの品質管理 (Lint / Format / Test)

開発中コードの品質を維持するため、Dockerコンテナ内で以下のコマンドを実行できます。

### 一括チェック（推奨）
Lint・フォーマット確認・テストをまとめて実行します:
```bash
docker compose exec app npm run check:all
```

### 個別コマンド

| コマンド | 内容 |
|---|---|
| `npm run lint` | ESLint による静的解析（エラー報告のみ） |
| `npm run format:check` | Prettier によるフォーマット確認（ファイル変更なし） |
| `npm run format:write` | Prettier によるフォーマット自動修正 |
| `npm test` | Vitest によるユニット・統合テスト実行 |
| `npm run test:e2e` | Playwright による E2E テスト実行 |

```bash
# リントチェック
docker compose exec app npm run lint

# フォーマット確認（差分があればエラー終了）
docker compose exec app npm run format:check

# フォーマット自動修正
docker compose exec app npm run format:write

# ユニット・統合テスト実行
docker compose exec app npm test

# E2E テスト実行
docker compose exec app npm run test:e2e
```
