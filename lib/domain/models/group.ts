import { z } from "zod";
import { UserSchema } from "./user";

/**
 * グループ情報のドメインスキーマ
 */
export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  members: z.array(UserSchema).default([]),
});

export type Group = z.infer<typeof GroupSchema>;

/**
 * グループメンバーのドメインスキーマ
 */
export const GroupMemberDomainSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().optional(),
  user: UserSchema.optional(),
});

export type GroupMember = z.infer<typeof GroupMemberDomainSchema>;
