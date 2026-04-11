# 🗄️ DB設計

## 🧱 全体構成

```
users
groups
group_members
payments
payment_participants
settlements
```

---

# 👤 1. users（ユーザー）

```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  search_id text unique not null,
  created_at timestamp default now()
);
```

👉 補足

* SignUp時にauth.usersレコードと同時に作成される
* search_idで他のユーザーを検索・招待できる

---

# 👥 2. groups（グループ）

```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references users(id) on delete set null,
  created_at timestamp default now()
);
```

---

# 🔗 3. group_members（中間テーブル）

```sql
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamp default now(),
  unique(group_id, user_id)
);
```

👉 重要

* 1ユーザーは複数グループ参加可能

---

# 💰 4. payments（支払い）

```sql
create table payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  payer_id uuid references users(id),
  amount integer not null check (amount > 0),
  memo text,
  created_at timestamp default now()
);
```

👉 例
「Aが3000円払った」

---

# 👥 5. payment_participants（参加者）

```sql
create table payment_participants (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  share_amount integer not null check (share_amount >= 0),
  created_at timestamp default now(),
  unique(payment_id, user_id)
);
```

---

👉 超重要ポイント

### ❗ share_amount を持つ理由

* 均等割りだけでなく
* 不均等割りにも対応できる

---

### 例

3000円 / 3人

| user | share |
| ---- | ----- |
| A    | 1000  |
| B    | 1000  |
| C    | 1000  |

---

# 🔄 6. settlements（精算）

```sql
create table settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  from_user_id uuid references users(id),
  to_user_id uuid references users(id),
  amount integer not null check (amount > 0),
  created_at timestamp default now()
);
```

---

👉 役割

* 実際に「支払った」記録

---

# 🧠 残高計算ロジック（重要）

👉 DBには持たない

---

## 計算方法

### ① 支払いベース

* payerが立て替え

---

### ② participantsで分配

---

### ③ settlementsで減算

---

👉 最終的に

```
貸し借り = 支払い - 精算
```

---

# 📊 インデックス（重要）

```sql
create index idx_group_members_group_id on group_members(group_id);
create index idx_payments_group_id on payments(group_id);
create index idx_payment_participants_payment_id on payment_participants(payment_id);
create index idx_settlements_group_id on settlements(group_id);
```

---

# 🔐 将来対応

* notifications（通知機能）

---

# 🚀 ER図イメージ

```
users
  ↓
group_members → groups
  ↓
payments → payment_participants
  ↓
settlements
```

---

# 💡 この設計の強み

## ✅ 拡張性

* モバイル対応OK
* 認証追加OK

---

## ✅ 柔軟性

* 均等割り / 不均等割り対応

---

## ✅ シンプル

* 無駄なテーブルなし

---

# ⚠️ よくあるミス（回避済み）

❌ 残高テーブルを持つ
→ 不整合地獄

❌ payerとparticipantsを混ぜる
→ 計算崩壊
