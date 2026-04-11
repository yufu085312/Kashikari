import { z } from "zod";
import { LIMITS, MESSAGES } from "@/lib/constants";

/** プロフィール更新スキーマ */
export const updateProfileSchema = z.object({
  name: z
    .string({ error: MESSAGES.ERROR.NAME_REQUIRED })
    .min(1, MESSAGES.ERROR.NAME_REQUIRED)
    .max(LIMITS.MAX_NAME_LENGTH, MESSAGES.ERROR.NAME_TOO_LONG),
  search_id: z
    .string({ error: MESSAGES.ERROR.SEARCH_ID_REQUIRED })
    .min(1, MESSAGES.ERROR.SEARCH_ID_REQUIRED)
    .max(LIMITS.MAX_SEARCH_ID_LENGTH, MESSAGES.ERROR.SEARCH_ID_TOO_LONG)
    .regex(LIMITS.SEARCH_ID_PATTERN, MESSAGES.ERROR.SEARCH_ID_INVALID),
});

/** プロフィール更新入力型（スキーマから推論） */
export type UpdateProfileSchemaInput = z.infer<typeof updateProfileSchema>;
