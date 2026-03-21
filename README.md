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

## 🧹 コードの品質管理 (Lint & Format)

開発中コードの品質を維持するため、Dockerコンテナ内で以下のコマンドを実行できます。

**リントチェック (ESLint)**:
```bash
docker compose exec app npm run lint
```
※ 静的解析を行い、エラーや警告を表示します。

**フォーマット実行 (Prettier)**:
```bash
docker compose exec app npx prettier --write "app/**/*.{ts,tsx}" "components/**/*.{ts,tsx}" "lib/**/*.{ts,tsx}" "utils/**/*.{ts,tsx}"
```
※ 対象ディレクトリの TypeScript / React ファイルを自動フォーマット（コード整形）します。
