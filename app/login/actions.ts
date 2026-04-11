"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ROUTES, MESSAGES } from "@/lib/constants";

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

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.LOGIN);
}
