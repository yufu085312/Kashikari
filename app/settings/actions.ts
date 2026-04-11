"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { ROUTES, LIMITS, MESSAGES } from "@/lib/constants";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: MESSAGES.ERROR.UNAUTHORIZED };
  }

  const name = formData.get("name") as string;
  const search_id = formData.get("search_id") as string;

  // バリデーション
  if (!name) return { error: MESSAGES.ERROR.NAME_REQUIRED };
  if (name.length > LIMITS.MAX_NAME_LENGTH)
    return { error: MESSAGES.ERROR.NAME_TOO_LONG };

  if (!search_id) return { error: MESSAGES.ERROR.SEARCH_ID_REQUIRED };
  if (search_id.length > LIMITS.MAX_SEARCH_ID_LENGTH)
    return { error: MESSAGES.ERROR.SEARCH_ID_TOO_LONG };
  if (!LIMITS.SEARCH_ID_PATTERN.test(search_id))
    return { error: MESSAGES.ERROR.SEARCH_ID_INVALID };

  // 現在のデータを取得して比較
  const { data: currentUser } = await supabase
    .from("users")
    .select("search_id")
    .eq("id", user.id)
    .single();

  // 検索IDが変更される場合のみ重複チェック
  if (currentUser && currentUser.search_id !== search_id) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", search_id)
      .maybeSingle();

    if (existingUser) {
      return { error: MESSAGES.ERROR.SEARCH_ID_DUPLICATE };
    }
  }

  // public.users の更新
  const { error: dbError } = await supabase
    .from("users")
    .update({ name, search_id })
    .eq("id", user.id);

  if (dbError) {
    return { error: MESSAGES.ERROR.PROFILE_UPDATE_FAILED };
  }

  // auth.users メタデータの更新
  await supabase.auth.updateUser({
    data: { name, search_id },
  });

  revalidatePath(ROUTES.HOME, "layout");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: MESSAGES.ERROR.UNAUTHORIZED };
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  // バリデーション
  if (!password) return { error: MESSAGES.ERROR.PASSWORD_REQUIRED };
  if (password.length < LIMITS.MIN_PASSWORD_LENGTH)
    return { error: MESSAGES.ERROR.PASSWORD_TOO_SHORT };

  if (password !== confirmPassword) {
    return { error: MESSAGES.ERROR.PASSWORD_MISMATCH };
  }

  // パスワードの更新
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: MESSAGES.ERROR.PASSWORD_UPDATE_FAILED };
  }

  return { success: true };
}
