"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { ROUTES, LIMITS, MESSAGES } from "@/lib/constants";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || ROUTES.HOME;

  if (!email && !password) {
    redirect(
      `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.EMAIL_PASSWORD_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!email) {
    redirect(
      `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.EMAIL_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!password) {
    redirect(
      `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.PASSWORD_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  // パスワード認証
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // セキュリティのため、メッセージを統一します
    redirect(
      `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.LOGIN_FAILED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  revalidatePath(ROUTES.HOME, "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const search_id = formData.get("search_id") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || ROUTES.HOME;

  if (!name && !search_id && !email && !password) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.ALL_FIELDS_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!name) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.NAME_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!search_id) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.SEARCH_ID_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!email) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.EMAIL_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (!password) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.PASSWORD_REQUIRED)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  // 文字数制限
  if (name.length > LIMITS.MAX_NAME_LENGTH) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.NAME_TOO_LONG)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }
  if (search_id.length > LIMITS.MAX_SEARCH_ID_LENGTH) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.SEARCH_ID_TOO_LONG)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  // search_id は英数字とアンダースコアのみ許容
  if (!LIMITS.SEARCH_ID_PATTERN.test(search_id)) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.SEARCH_ID_INVALID)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  // ① 検索IDの重複チェック
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("search_id", search_id)
    .single();

  if (existingUser) {
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(MESSAGES.ERROR.SEARCH_ID_DUPLICATE)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  // ② ユーザー登録処理
  const origin =
    (await headers()).get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        search_id,
      },
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  // ③ エラーハンドリング（メールアドレス重複など）
  if (error) {
    let errorMessage = error.message;
    if (errorMessage.includes("already registered")) {
      errorMessage = MESSAGES.ERROR.EMAIL_ALREADY_REGISTERED;
    } else if (errorMessage.includes("Weak password")) {
      errorMessage = MESSAGES.ERROR.PASSWORD_TOO_SHORT;
    } else if (errorMessage.includes("Database error saving new user")) {
      errorMessage = MESSAGES.ERROR.USER_CREATE_FAILED;
    } else {
      errorMessage = MESSAGES.ERROR.GENERAL_ERROR_PREFIX + errorMessage;
    }
    redirect(
      `${ROUTES.SIGNUP}?error=${encodeURIComponent(errorMessage)}${next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : ""}`,
    );
  }

  // ④ メール確認が必要な場合（セッションがない場合）の処理
  if (!data.session) {
    // 6桁のコード入力画面へ遷移
    redirect(
      `${ROUTES.VERIFY}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`,
    );
  }

  // ⑤ 開発環境などでメール確認が不要な場合、自動でログイン状態を維持
  revalidatePath(ROUTES.HOME, "layout");
  redirect(next);
}

export async function verifySignupOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const next = (formData.get("next") as string) || ROUTES.HOME;

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    redirect(
      `${ROUTES.VERIFY}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent(MESSAGES.ERROR.OTP_EXPIRED_OR_INVALID)}`,
    );
  }

  revalidatePath(ROUTES.HOME, "layout");
  redirect(`${ROUTES.COMPLETE}?next=${encodeURIComponent(next)}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.LOGIN);
}

export async function resendSignupOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const next = (formData.get("next") as string) || ROUTES.HOME;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    // Supabase のクールダウンエラーをわかりやすく変換
    const msg = error.message.includes("after")
      ? MESSAGES.ERROR.RESEND_COOLDOWN
      : `${MESSAGES.ERROR.RESEND_ERROR_PREFIX}${error.message}`;
    redirect(
      `${ROUTES.VERIFY}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${encodeURIComponent(msg)}`,
    );
  }

  redirect(
    `${ROUTES.VERIFY}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&message=${encodeURIComponent(MESSAGES.UI.OTP_RESENT_MSG)}`,
  );
}

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
