import { z } from "zod";

/**
 * 貸し借りバランスのドメインスキーマ
 */
export const BalanceDomainSchema = z.object({
  fromUserId: z.string().uuid().nullable(),
  toUserId: z.string().uuid().nullable(),
  amount: z.number().int(),
  fromUserName: z.string().optional(),
  toUserName: z.string().optional(),
});

export type Balance = z.infer<typeof BalanceDomainSchema>;
