import { insertSettlement } from "@/lib/repositories/settlementRepository";
import { CreateSettlementInput, Settlement } from "@/types/balance";

export async function settleDebt(
  input: CreateSettlementInput,
): Promise<Settlement> {
  const { fromUserId, toUserId, amount } = input;

  if (amount <= 0) throw new Error("精算金額は0より大きい値を入力してください");
  if (fromUserId === toUserId) throw new Error("自分自身への精算はできません");

  return await insertSettlement(input);
}
