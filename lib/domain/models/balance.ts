import { z } from "zod";

/**
 * 貸し借りバランスのドメインスキーマ
 */
export const BalanceDomainSchema = z.object({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().int(),
  fromUserName: z.string().optional(),
  toUserName: z.string().optional(),
});

export type Balance = z.infer<typeof BalanceDomainSchema>;
