import { z } from "zod";

/**
 * ユーザー情報のドメインモデル
 * 永続化層のスキーマに依存しない、純粋なビジネスエンティティ
 */
export interface UserEntity {
  id: string;
  name: string;
  searchId: string;
  email: string;
}

/**
 * ユーザー情報のドメインスキーマ
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  searchId: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  created_at: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * ユーザー更新・作成時のバリデーション（ドメインルール）
 */
export const UserDomainSchema = z.object({
  name: z.string().min(1).max(50),
  searchId: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
});
