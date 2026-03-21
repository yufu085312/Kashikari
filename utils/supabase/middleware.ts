import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ユーザーのセッションを更新
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ログイン・新規登録ページ（ログイン済みユーザーはトップへ戻す対象）
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // 誰でも（または認証直後でも）アクセス可能なページ
  const isPublicRoute =
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/signup/complete" ||
    pathname === "/signup/verify" ||
    pathname.startsWith("/auth/confirm");

  // APIへのリクエストはミドルウェアではなく、各Route Handlerでセッションを検証するためスキップ
  const isApiRoute = pathname.startsWith("/api");

  // 未ログインユーザーの保護パスへのアクセスを /login にリダイレクト
  if (!user && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname); // 元のパスを保持
    return NextResponse.redirect(url);
  }

  // ログイン済みユーザーが /login, /signup にアクセスした場合はトップへリダイレクト
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
