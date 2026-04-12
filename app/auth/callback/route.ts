export const runtime = "edge";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { MESSAGES, ROUTES } from "@/lib/constants";

/**
 * リダイレクト先パスを安全に検証する。
 * 相対パス（"/"始まり）のみ許可し、外部URL・プロトコル相対URL("//evil.com")を排除する。
 */
function sanitizeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return ROUTES.HOME;
  }
  return path;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const {
      data: { session },
      error: exchangeError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && session) {
      const user = session.user;
      let targetNext = next;

      // プロフィール確認
      const { data: profile } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      // プロフィール確認: 未作成(null)または名前が「未設定」の場合はプロフィール設定画面へ
      if (!profile || profile?.name === MESSAGES.UI.NOT_SET) {
        targetNext = `${ROUTES.SETUP_PROFILE}?next=${encodeURIComponent(next)}`;
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      let finalRedirectUrl: string;
      if (isLocalEnv) {
        finalRedirectUrl = `${origin}${targetNext}`;
      } else if (forwardedHost) {
        finalRedirectUrl = `https://${forwardedHost}${targetNext}`;
      } else {
        finalRedirectUrl = `${origin}${targetNext}`;
      }

      return NextResponse.redirect(finalRedirectUrl);
    }
  }

  return NextResponse.redirect(
    `${origin}${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.AUTH_FAILED)}`,
  );
}
