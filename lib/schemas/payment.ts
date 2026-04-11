import { z } from "zod";
import { LIMITS, MESSAGES } from "@/lib/constants";

/** 支払い作成スキーマ */
export const createPaymentSchema = z.object({
  groupId: z.string().uuid(),
  payerId: z.string().uuid(),
  amount: z
    .number({ error: MESSAGES.ERROR.PAYMENT_AMOUNT_REQUIRED })
    .int(MESSAGES.ERROR.PAYMENT_AMOUNT_INVALID)
    .min(LIMITS.MIN_PAYMENT_AMOUNT, MESSAGES.ERROR.PAYMENT_AMOUNT_MIN)
    .max(LIMITS.MAX_PAYMENT_AMOUNT, MESSAGES.ERROR.PAYMENT_AMOUNT_MAX),
  participants: z
    .array(
      z.object({
        userId: z.string().uuid(),
        share: z.number().int().min(0),
      }),
    )
    .min(1, MESSAGES.ERROR.PAYMENT_PARTICIPANT_REQUIRED),
  memo: z.string().optional(),
});

/** 支払い作成入力型（スキーマから推論） */
export type CreatePaymentSchemaInput = z.infer<typeof createPaymentSchema>;
