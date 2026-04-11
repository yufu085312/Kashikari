import { z } from "zod";
import { UserDomainSchema } from "./user";

/**
 * 精算データのドメインスキーマ
 */
export const SettlementDomainSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  from_user_id: z.string().uuid(),
  to_user_id: z.string().uuid(),
  amount: z.number().int().min(0),
  created_at: z.string(),
  from_user: UserDomainSchema.optional(),
  to_user: UserDomainSchema.optional(),
});

export type Settlement = z.infer<typeof SettlementDomainSchema>;
export type SettlementWithUsers = z.infer<typeof SettlementDomainSchema>;
