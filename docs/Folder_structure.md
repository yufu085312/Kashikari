# 📁 フォルダ構成

```bash
kashikari/
├── app/                      # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── groups/              # グループ関連UI
│   │   ├── page.tsx
│   │   └── [groupId]/
│   │       └── page.tsx
│   │
│   ├── payments/
│   │   └── new/
│   │       └── page.tsx
│   │
│   └── api/                 # API（Route Handlers）
│       └── v1/
│           ├── users/
│           │   └── route.ts
│           │
│           ├── groups/
│           │   ├── route.ts
│           │   └── [groupId]/
│           │       ├── route.ts
│           │       └── members/
│           │           └── route.ts
│           │
│           ├── payments/
│           │   └── route.ts
│           │
│           ├── balances/
│           │   └── [groupId]/
│           │       └── route.ts
│           │
│           └── settlements/
│               └── route.ts
│
├── components/              # UIコンポーネント
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   │
│   ├── groups/
│   │   ├── group-card.tsx
│   │   └── group-form.tsx
│   │
│   ├── payments/
│   │   ├── payment-form.tsx
│   │   └── payment-list.tsx
│   │
│   └── balances/
│       └── balance-list.tsx
│
├── hooks/                   # カスタムHooks
│   ├── useGroups.ts
│   ├── usePayments.ts
│   └── useBalances.ts
│
├── lib/                     # ビジネスロジック層（重要）
│   ├── api/                 # APIクライアント
│   │   └── client.ts
│   │
│   ├── usecases/            # ビジネスロジック
│   │   ├── createGroup.ts
│   │   ├── createPayment.ts
│   │   ├── getBalances.ts
│   │   └── settleDebt.ts
│   │
│   ├── repositories/        # DBアクセス
│   │   ├── groupRepository.ts
│   │   ├── paymentRepository.ts
│   │   └── settlementRepository.ts
│   │
│   └── db/                  # DB接続
│       └── supabase.ts
│
├── types/                   # 型定義
│   ├── user.ts
│   ├── group.ts
│   ├── payment.ts
│   └── balance.ts
│
├── utils/                   # ユーティリティ
│   ├── calcBalance.ts       # 残高計算ロジック
│   └── format.ts
│
├── styles/
│   └── globals.css
│
├── public/
│   └── icons/
│
├── .env.local
├── next.config.js
├── package.json
└── README.md
```

---

# 🔥 この構成のポイント（超重要）

---

## ✅ ① APIを“薄く”する

```ts
// app/api/v1/payments/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  return await createPayment(body)
}
```

👉 ロジックは全部 `lib/usecases` に逃がす

---

## ✅ ② ビジネスロジック分離

```ts
// lib/usecases/createPayment.ts
export async function createPayment(input) {
  // バリデーション
  // 計算
  // repository呼び出し
}
```

👉 将来Goに移植できる

---

## ✅ ③ DBアクセスを統一

```ts
// lib/repositories/paymentRepository.ts
export async function insertPayment(data) {
  // Supabase or SQL
}
```

👉 DB変更に強い

---

## ✅ ④ フロントとAPIの分離（論理）

* 同じプロジェクトでも責務分離
* モバイルからも使える

---

# 🚀 将来拡張も考慮済み

---

## 📱 モバイル追加時

```bash
/mobile/
  └── (React Native)
```

👉 APIそのまま使える

---

## ⚡ Go移行時

```bash
/backend-go/
```

👉 usecasesを移植するだけ

---

# 💡 命名ルール

---

## ファイル

* camelCase（関数）
* kebab-case（コンポーネント）

---

## API

* RESTful
* 複数形
