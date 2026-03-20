# 📄 技術構成仕様（Kashikari）

---

# 🧱 1. 全体アーキテクチャ

## ■ 構成概要

```
[ Client ]
  ├ Web（Next.js）
  └ Mobile（将来：React Native）

        ↓

[ API Layer ]
  └ Next.js Route Handlers

        ↓

[ Database ]
  └ PostgreSQL（Supabase）

        ↓

[ Auth（将来）]
  └ Supabase Auth
```

---

## ■ 設計思想（重要）

* API中心設計（Webとモバイル共通）
* フロントとバックエンド分離（論理的に）
* MVPはシンプル最優先

---

# 🌐 2. フロントエンド

## ■ 技術

* フレームワーク：Next.js（App Router）
* 言語：TypeScript
* UI：Tailwind CSS
* 状態管理：React Hooks（最初はシンプル）

---

## ■ 役割

* UI表示
* API通信
* 軽い状態管理

---

## ■ 構成

```
/app
  /groups
  /payments
  /layout.tsx
/components
/lib/api
/hooks
```

---

## ■ API通信

* fetchベース
* 共通クライアント作成

---

# 🔌 3. API（バックエンド）

## ■ 技術

* Next.js Route Handlers

---

## ■ エンドポイント

```
/api/v1/groups
/api/v1/payments
/api/v1/balances
/api/v1/settlements
```

---

## ■ レイヤー構成（重要）

```
/app/api → ルーティング
/lib/usecases → ビジネスロジック
/lib/repositories → DBアクセス
```

---

## ■ 方針

* Controllerは薄く
* ロジックはusecaseへ

---

# 🗄️ 4. データベース

## ■ 技術

* PostgreSQL
* Supabase

---

## ■ 主テーブル

* users
* groups
* group_members
* payments
* payment_participants
* settlements

---

## ■ 特徴

* 残高は保持しない（計算）
* 正規化重視

---

# 🔐 5. 認証（将来）

## ■ 技術

* Supabase Auth

---

## ■ フロー

* JWTベース認証
* APIで検証

---

## ■ MVP時

* userIdを直接使用

---

# 📱 6. モバイル（将来）

## ■ 技術

* React Native（Expo）

---

## ■ API

* Webと完全共通

---

## ■ 方針

* UIのみ別実装
* ロジックはAPI依存

---

# ☁️ 7. インフラ

## ■ Web / API

* Cloudflare Pages

---

## ■ DB

* Supabase

---

## ■ 将来

* CDN最適化
* キャッシュ導入

---

# 🚀 8. デプロイ構成

## ■ フロー

1. Git push
2. 自動ビルド
3. デプロイ

---

## ■ 環境

* dev（ローカル）
* prod（本番）

---

## ■ 環境変数

* DATABASE_URL
* SUPABASE_URL
* SUPABASE_KEY

---

# ⚡ 9. パフォーマンス設計

## ■ 基本

* SSR / SSG活用
* APIは軽量

---

## ■ DB

* index設計済み
* N+1回避

---

# 📦 10. 状態管理

## ■ MVP

* useState / useEffect

---

## ■ 将来

* Zustand or React Query

---

# 🔄 11. データフロー

```
UI操作
 ↓
API呼び出し
 ↓
DB操作
 ↓
レスポンス
 ↓
UI更新
```

---

# 🔍 12. SEO設計（重要）

## ■ 対策

* SSGページ
* メタタグ最適化
* 構造化データ

---

## ■ キーワード

* 割り勘 アプリ
* 貸し借り 管理

---

# 📱 13. PWA対応

## ■ 内容

* ホーム画面追加
* オフライン対応（将来）

---

# ⚠️ 14. セキュリティ

## ■ MVP

* 入力バリデーション
* SQLインジェクション対策

---

## ■ 将来

* 認証
* RLS（Supabase）

---

# 💡 15. スケーラビリティ

## ■ 現状

* Next.js APIで十分

---

## ■ 将来

* Go APIへ分離可能

---
