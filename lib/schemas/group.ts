import { z } from "zod";
import { LIMITS, MESSAGES } from "@/lib/constants";

export const createGroupSchema = z.object({
  name: z
    .string({ error: MESSAGES.ERROR.GROUP_NAME_REQUIRED })
    .min(1, MESSAGES.ERROR.GROUP_NAME_REQUIRED)
    .max(LIMITS.MAX_GROUP_NAME_LENGTH, MESSAGES.ERROR.GROUP_NAME_TOO_LONG),
  memberSearchIds: z.array(z.string()),
});

/** グループ作成フォーム用スキーマ */
export const createGroupFormSchema = z.object({
  name: z
    .string({ error: MESSAGES.ERROR.GROUP_NAME_REQUIRED })
    .min(1, MESSAGES.ERROR.GROUP_NAME_REQUIRED)
    .max(LIMITS.MAX_GROUP_NAME_LENGTH, MESSAGES.ERROR.GROUP_NAME_TOO_LONG),
  memberSearchIds: z.array(z.object({ value: z.string() })),
});

/** グループ送信入力型（アクション用） */
export type CreateGroupSchemaInput = z.infer<typeof createGroupSchema>;

/** グループ作成フォーム入力型 */
export type CreateGroupFormInput = z.infer<typeof createGroupFormSchema>;

/** メンバー追加スキーマ */
export const addMemberSchema = z.object({
  searchId: z
    .string({ error: MESSAGES.ERROR.SEARCH_ID_REQUIRED })
    .min(1, MESSAGES.ERROR.SEARCH_ID_REQUIRED)
    .transform((v) => v.trim()),
});

/** メンバー追加入力型（スキーマから推論） */
export type AddMemberSchemaInput = z.infer<typeof addMemberSchema>;
