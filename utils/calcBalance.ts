import { Payment } from "@/lib/domain/models/payment";
import { Settlement } from "@/lib/domain/models/settlement";
import { Balance } from "@/lib/domain/models/balance";
import { User } from "@/lib/domain/models/user";

/**
 * 残高計算ロジック（コア）
 *
 * 手順:
 * 1. 各支払いから payment_participants の share_amount ぶんだけ、
 *    参加者 → 支払者 への「借り」を計算
 * 2. settlements で精算済み分を差し引き
 * 3. 最終的な net balance を「誰→誰：いくら」の配列で返す
 */
export function calcBalance(
  payments: Payment[],
  settlements: Settlement[],
  users: User[],
): Balance[] {
  // userId → net amount（正 = 受け取り権, 負 = 支払い義務）
  const netMap: Record<string, number> = {};

  users.forEach((u) => {
    netMap[u.id] = 0;
  });

  // 支払いから計算
  for (const payment of payments) {
    const { payer_id, participants } = payment;
    if (!participants) continue;

    for (const p of participants) {
      if (p.user_id === payer_id) continue; // 支払者自身はスキップ
      netMap[payer_id] = (netMap[payer_id] || 0) + p.share_amount;
      netMap[p.user_id] = (netMap[p.user_id] || 0) - p.share_amount;
    }
  }

  // 精算で相殺
  for (const s of settlements) {
    netMap[s.from_user_id] = (netMap[s.from_user_id] || 0) + s.amount;
    netMap[s.to_user_id] = (netMap[s.to_user_id] || 0) - s.amount;
  }

  // ユーザー名マップ
  const nameMap: Record<string, string> = {};
  users.forEach((u) => {
    nameMap[u.id] = u.name;
  });

  // 最小送金で「誰→誰：いくら」を生成
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [userId, amount] of Object.entries(netMap)) {
    if (amount > 0) creditors.push({ id: userId, amount });
    if (amount < 0) debtors.push({ id: userId, amount: -amount });
  }

  const balances: Balance[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const transfer = Math.min(creditor.amount, debtor.amount);

    if (transfer > 0) {
      balances.push({
        fromUserId: debtor.id,
        toUserId: creditor.id,
        amount: transfer,
        fromUserName: nameMap[debtor.id],
        toUserName: nameMap[creditor.id],
      });
    }

    creditor.amount -= transfer;
    debtor.amount -= transfer;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return balances.filter((b) => b.amount > 0);
}
