import { z } from "zod";
import { MESSAGES } from "@/lib/constants";

/** 精算作成スキーマ */
export const createSettlementSchema = z.object({
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z
    .number({ error: MESSAGES.ERROR.SETTLEMENT_AMOUNT_REQUIRED })
    .int(MESSAGES.ERROR.SETTLEMENT_AMOUNT_INVALID)
    .positive(MESSAGES.ERROR.SETTLEMENT_AMOUNT_POSITIVE),
});
