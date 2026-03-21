export const runtime = "edge";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = searchParams.get("next") ?? "/";

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

  const supabase = await createClient();
  const { MESSAGES } = await import("@/lib/constants");

  // 失敗した場合はエラー画面（またはログイン画面）へ
  redirect(
    `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.AUTH_REDIRECT_ERROR)}`,
  );
}
