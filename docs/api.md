# 🚀 API設計

## 🧱 基本方針

* RESTベース
* JSON通信
* `/api/v1/` プレフィックス
* 認証適用（Supabase Auth, withAuth等）

---

# 🌐 エンドポイント一覧

```id="sksx5h"
/api/v1/users
/api/v1/groups
/api/v1/payments
/api/v1/balances
/api/v1/settlements
```

---

# 👤 1. Users

## ■ ユーザー作成

```http
POST /api/v1/users
```

### request

```json
{
  "name": "太郎"
}
```

### response

```json
{
  "id": "uuid",
  "name": "太郎"
}
```

---

# 👥 2. Groups

## ■ グループ作成

```http
POST /api/v1/groups
```

```json
{
  "name": "沖縄旅行",
  "userIds": ["uuid1", "uuid2"]
}
```

---

## ■ グループ一覧

```http
GET /api/v1/groups?userId=xxx
```

---

## ■ グループ詳細

```http
GET /api/v1/groups/:groupId
```

---

## ■ メンバー追加

```http
POST /api/v1/groups/:groupId/members
```

```json
{
  "userId": "uuid"
}
```

---

# 💰 3. Payments（コア）

## ■ 支払い登録

```http
POST /api/v1/payments
```

### request

```json
{
  "groupId": "uuid",
  "payerId": "uuid",
  "amount": 3000,
  "participants": [
    { "userId": "uuid1", "share": 1000 },
    { "userId": "uuid2", "share": 1000 },
    { "userId": "uuid3", "share": 1000 }
  ],
  "memo": "飲み会"
}
```

---

## ■ 支払い一覧

```http
GET /api/v1/groups/:groupId/payments
```

---

## ■ 支払い削除

```http
DELETE /api/v1/payments/:paymentId
```

---

# 📊 4. Balances（最重要）

## ■ 残高取得

```http
GET /api/v1/groups/:groupId/balances
```

---

### response例

```json
[
  {
    "fromUserId": "A",
    "toUserId": "B",
    "amount": 1200
  },
  {
    "fromUserId": "C",
    "toUserId": "A",
    "amount": 800
  }
]
```

---

👉 ポイント

* 「誰→誰」を明確に返す
* UIでそのまま使える形式

---

# 🔄 5. Settlements（精算）

## ■ 精算登録

```http
POST /api/v1/settlements
```

```json
{
  "groupId": "uuid",
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "amount": 1200
}
```

---

## ■ 精算一覧

```http
GET /api/v1/groups/:groupId/settlements
```

---

# ⚠️ 6. バリデーション（重要）

## Payments

* amount > 0
* participants合計 = amount

---

## Settlements

* amount > 0
* from ≠ to

---

# 🧠 7. 残高ロジック（API側）

👉 `/balances`で計算する

---

## ロジック概要

```id="s1a7g2"
1. payments取得
2. participantごとに負債計算
3. payerに加算
4. settlementsで相殺
5. ネット計算
```

---

👉 最終的に
「最小送金回数」にするのが理想（後で実装）

---

# 🔐 8. 認証

* JWT（Supabase Auth）
* 共通ラッパー関数（`withAuth` 等）で保護され、不正アクセスを排除。

---

# 📦 9. レスポンス統一フォーマット

```json
{
  "data": {},
  "error": null
}
```

---

## エラー例

```json
{
  "data": null,
  "error": {
    "message": "Invalid request"
  }
}
```

---

# 🚀 10. Next.js構成（そのまま使える）

```id="1c07c1"
/app/api/v1/
  users/route.ts
  groups/route.ts
  groups/[id]/route.ts
  payments/route.ts
  balances/[groupId]/route.ts
  settlements/route.ts
```

---

# 💡 この設計の強み

## ✅ モバイル対応

* React Nativeからそのまま叩ける

---

## ✅ 拡張性

* 認証追加OK
* Goへの移行も容易

---

## ✅ シンプル

* MVPに最適
