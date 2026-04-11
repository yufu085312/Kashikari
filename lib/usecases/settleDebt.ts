import { insertSettlement } from "@/lib/repositories/settlementRepository";
import { CreateSettlementInput, Settlement } from "@/types/balance";
import { ValidationError } from "@/lib/errors";

export async function settleDebt(
  input: CreateSettlementInput,
): Promise<Settlement> {
  const { fromUserId, toUserId, amount } = input;

  if (amount <= 0)
    throw new ValidationError("精算金額は0より大きい値を入力してください");
  if (fromUserId === toUserId)
    throw new ValidationError("自分自身への精算はできません");

  return await insertSettlement(input);
}
