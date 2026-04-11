import { describe, it, expect } from "vitest";
import { calcBalance } from "@/utils/calcBalance";
import type { Payment } from "@/lib/domain/models/payment";
import type { Settlement } from "@/lib/domain/models/settlement";
import type { User } from "@/lib/domain/models/user";

// テスト用のユーザー定義
const userA: User = { id: "userA", name: "Aさん" };
const userB: User = { id: "userB", name: "Bさん" };
const userC: User = { id: "userC", name: "Cさん" };
const users2 = [userA, userB];
const users3 = [userA, userB, userC];

// ヘルパー: 支払いオブジェクト作成
function makePayment(
  id: string,
  payerId: string,
  participants: { userId: string; shareAmount: number }[],
): Payment {
  return {
    id,
    group_id: "g1",
    payer_id: payerId,
    amount: participants.reduce((sum, p) => sum + p.shareAmount, 0),
    memo: undefined,
    created_at: "",
    participants: participants.map((p) => ({
      id: `p-${id}-${p.userId}`,
      payment_id: id,
      user_id: p.userId,
      share_amount: p.shareAmount,
    })),
    payer: undefined,
  };
}

// ヘルパー: 精算オブジェクト作成
function makeSettlement(
  id: string,
  fromUserId: string,
  toUserId: string,
  amount: number,
): Settlement {
  return {
    id,
    group_id: "g1",
    from_user_id: fromUserId,
    to_user_id: toUserId,
    amount,
    created_at: "",
    from_user: undefined,
    to_user: undefined,
  };
}

describe("calcBalance", () => {
  it("データが空の場合、空配列を返す", () => {
    const result = calcBalance([], [], users2);
    expect(result).toEqual([]);
  });

  it("2人: AがBの分を立て替えた場合、BがAに払うべき残高が出る", () => {
    // A が 1000円払い、B が 500円を負担
    const payments = [
      makePayment("pay1", "userA", [
        { userId: "userA", shareAmount: 500 },
        { userId: "userB", shareAmount: 500 },
      ]),
    ];
    const result = calcBalance(payments, [], users2);
    expect(result).toHaveLength(1);
    expect(result[0].fromUserId).toBe("userB");
    expect(result[0].toUserId).toBe("userA");
    expect(result[0].amount).toBe(500);
  });

  it("精算済みの場合、残高がゼロになり空配列を返す", () => {
    const payments = [
      makePayment("pay1", "userA", [
        { userId: "userA", shareAmount: 500 },
        { userId: "userB", shareAmount: 500 },
      ]),
    ];
    const settlements = [makeSettlement("s1", "userB", "userA", 500)];
    const result = calcBalance(payments, settlements, users2);
    expect(result).toEqual([]);
  });

  it("3人: 複数の支払いを最小化された送金経路にまとめる", () => {
    // A が 900円払い B・C が 300円ずつ負担
    const payments = [
      makePayment("pay1", "userA", [
        { userId: "userA", shareAmount: 300 },
        { userId: "userB", shareAmount: 300 },
        { userId: "userC", shareAmount: 300 },
      ]),
    ];
    const result = calcBalance(payments, [], users3);
    const total = result.reduce((sum, b) => sum + b.amount, 0);
    // BとCがAに合計600円送る
    expect(total).toBe(600);
    result.forEach((b) => {
      expect(b.toUserId).toBe("userA");
    });
  });

  it("3人: 一部精算後は残りの残高だけが表示される", () => {
    const payments = [
      makePayment("pay1", "userA", [
        { userId: "userA", shareAmount: 300 },
        { userId: "userB", shareAmount: 300 },
        { userId: "userC", shareAmount: 300 },
      ]),
    ];
    // BはAへ精算済み
    const settlements = [makeSettlement("s1", "userB", "userA", 300)];
    const result = calcBalance(payments, settlements, users3);
    // 残るのはCのAへの支払い300円のみ
    const total = result.reduce((sum, b) => sum + b.amount, 0);
    expect(total).toBe(300);
  });
});
