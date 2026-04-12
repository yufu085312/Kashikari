"use server";

import { createPublicAction } from "@/lib/actions/action-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ROUTES, LIMITS, MESSAGES } from "@/lib/constants";
import { z } from "zod";

const setupProfileSchema = z.object({
  name: z
    .string()
    .min(1, MESSAGES.ERROR.NAME_REQUIRED)
    .max(LIMITS.MAX_NAME_LENGTH, MESSAGES.ERROR.NAME_TOO_LONG),
  search_id: z
    .string()
    .min(1, MESSAGES.ERROR.SEARCH_ID_REQUIRED)
    .max(LIMITS.MAX_SEARCH_ID_LENGTH, MESSAGES.ERROR.SEARCH_ID_TOO_LONG)
    .regex(LIMITS.SEARCH_ID_PATTERN, MESSAGES.ERROR.SEARCH_ID_INVALID),
  next: z.string().optional(),
});

export const setupProfile = createPublicAction(
  setupProfileSchema,
  async ({ name, search_id, next = ROUTES.HOME }) => {
    const supabase = await createClient();

    // ログイン中のユーザー情報を取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(ROUTES.LOGIN);
    }

    // 検索IDの重複チェック
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", search_id)
      .neq("id", user.id) // 自分自身は除外
      .single();

    if (existingUser) {
      const msg = encodeURIComponent(MESSAGES.ERROR.SEARCH_ID_DUPLICATE);
      redirect(`${ROUTES.SETUP_PROFILE}?error=${msg}`);
    }

    // ユーザー情報の更新
    const { error } = await supabase
      .from("users")
      .update({ name, search_id })
      .eq("id", user.id);

    if (error) {
      redirect(
        `${ROUTES.SETUP_PROFILE}?error=${encodeURIComponent(error.message)}`,
      );
    }

    revalidatePath(ROUTES.HOME, "layout");
    redirect(next);
  },
);
