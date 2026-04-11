"use server";

import { createSafeAction } from "@/lib/actions/action-utils";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { ROUTES, MESSAGES } from "@/lib/constants";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/schemas/user";

/** プロフィール更新アクション */
export const updateProfile = createSafeAction(
  updateProfileSchema,
  async (input, userId) => {
    const supabase = await createClient();

    // 検索IDが変更される場合のみ重複チェック
    const { data: currentUser } = await supabase
      .from("users")
      .select("search_id")
      .eq("id", userId)
      .single();

    if (currentUser && currentUser.search_id !== input.search_id) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("search_id", input.search_id)
        .maybeSingle();

      if (existingUser) {
        throw new Error(MESSAGES.ERROR.SEARCH_ID_DUPLICATE);
      }
    }

    // public.users の更新
    const { error: dbError } = await supabase
      .from("users")
      .update({ name: input.name, search_id: input.search_id })
      .eq("id", userId);

    if (dbError) throw new Error(MESSAGES.ERROR.PROFILE_UPDATE_FAILED);

    // auth.users メタデータの更新
    await supabase.auth.updateUser({
      data: { name: input.name, search_id: input.search_id },
    });

    revalidatePath(ROUTES.HOME, "layout");
    return { success: true };
  },
);

/** パスワード更新アクション */
export const updatePassword = createSafeAction(
  updatePasswordSchema,
  async ({ password }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) throw new Error(MESSAGES.ERROR.PASSWORD_UPDATE_FAILED);

    return { success: true };
  },
);
