import { z } from "zod";
import { UserDomainSchema } from "./user";

/**
 * 支払参加者のドメインスキーマ
 */
export const PaymentParticipantDomainSchema = z.object({
  id: z.string().uuid().optional(),
  payment_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  share_amount: z.number().int().min(0),
  user: UserDomainSchema.optional(),
});

/**
 * 支払いのドメインスキーマ
 */
export const PaymentDomainSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  payer_id: z.string().uuid().nullable(),
  amount: z.number().int().min(0),
  memo: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  payer: UserDomainSchema.optional(),
  participants: z.array(PaymentParticipantDomainSchema).optional(),
});

export type Payment = z.infer<typeof PaymentDomainSchema>;
export type PaymentParticipant = z.infer<typeof PaymentParticipantDomainSchema>;
