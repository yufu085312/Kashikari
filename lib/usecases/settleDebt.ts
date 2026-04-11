import { insertSettlement } from "@/lib/repositories/settlementRepository";
import { CreateSettlementSchemaInput } from "@/lib/schemas/settlement";
import { Settlement } from "@/lib/domain/models/settlement";
import { ValidationError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export async function settleDebt(
  input: CreateSettlementSchemaInput,
): Promise<Settlement> {
  const { fromUserId, toUserId, amount } = input;

  if (amount <= 0)
    throw new ValidationError(MESSAGES.ERROR.SETTLEMENT_AMOUNT_POSITIVE);
  if (fromUserId === toUserId)
    throw new ValidationError(MESSAGES.ERROR.SETTLEMENT_SELF_FORBIDDEN);

  return await insertSettlement(input);
}
