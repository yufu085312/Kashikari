export const runtime = "edge";

import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES, MESSAGES } from "@/lib/constants";

/**
 * リダイレクト先パスを安全に検証する。
 * 相対パス（"/"始まり）のみ許可し、外部URL・プロトコル相対URL("//evil.com")を排除する。
 */
function sanitizeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  return path;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeRedirectPath(searchParams.get("next"));

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // 登録完了画面へリダイレクト（nextを引き継ぐ）
      redirect(`/signup/complete?next=${encodeURIComponent(next)}`);
    }
  }

  // 失敗した場合はエラー画面（またはログイン画面）へ
  redirect(
    `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.AUTH_REDIRECT_ERROR)}`,
  );
}
