import { insertSettlement } from "@/lib/repositories/settlementRepository";
import { CreateSettlementInput, Settlement } from "@/types/balance";
import { ValidationError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export async function settleDebt(
  input: CreateSettlementInput,
): Promise<Settlement> {
  const { fromUserId, toUserId, amount } = input;

  if (amount <= 0)
    throw new ValidationError(MESSAGES.ERROR.SETTLEMENT_AMOUNT_POSITIVE);
  if (fromUserId === toUserId)
    throw new ValidationError(MESSAGES.ERROR.SETTLEMENT_SELF_FORBIDDEN);

  return await insertSettlement(input);
}
