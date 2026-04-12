"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES, MESSAGES } from "@/lib/constants";

/**
 * Google ログインを開始する
 */
export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();
  const origin =
    (await headers()).get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const callbackUrl = new URL("/auth/callback", origin);
  if (next) {
    callbackUrl.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    redirect(
      `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.LOGIN_FAILED)}`,
    );
  }

  if (data.url) {
    let redirectUrl = data.url;
    // Docker内から生成されたURL (host.docker.internal) をホストブラウザ用の localhost に置換
    if (redirectUrl.includes("host.docker.internal")) {
      redirectUrl = redirectUrl.replace("host.docker.internal", "localhost");
    }
    redirect(redirectUrl);
  }
}

/**
 * Apple ログインを開始する
 */
export async function signInWithApple(next?: string) {
  const supabase = await createClient();
  const origin =
    (await headers()).get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const callbackUrl = new URL("/auth/callback", origin);
  if (next) {
    callbackUrl.searchParams.set("next", next);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    redirect(
      `${ROUTES.LOGIN}?error=${encodeURIComponent(MESSAGES.ERROR.LOGIN_FAILED)}`,
    );
  }

  if (data.url) {
    let redirectUrl = data.url;
    // Docker内から生成されたURL (host.docker.internal) をホストブラウザ用の localhost に置換
    if (redirectUrl.includes("host.docker.internal")) {
      redirectUrl = redirectUrl.replace("host.docker.internal", "localhost");
    }
    redirect(redirectUrl);
  }
}
