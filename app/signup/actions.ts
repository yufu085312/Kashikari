"use server";

import { createPublicAction } from "@/lib/actions/action-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { ROUTES, LIMITS, MESSAGES } from "@/lib/constants";
import { z } from "zod";

const signupSchema = z.object({
  name: z
    .string()
    .min(1, MESSAGES.ERROR.NAME_REQUIRED)
    .max(LIMITS.MAX_NAME_LENGTH, MESSAGES.ERROR.NAME_TOO_LONG),
  search_id: z
    .string()
    .min(1, MESSAGES.ERROR.SEARCH_ID_REQUIRED)
    .max(LIMITS.MAX_SEARCH_ID_LENGTH, MESSAGES.ERROR.SEARCH_ID_TOO_LONG)
    .regex(LIMITS.SEARCH_ID_PATTERN, MESSAGES.ERROR.SEARCH_ID_INVALID),
  email: z.string().email(MESSAGES.ERROR.EMAIL_INVALID),
  password: z.string().min(6, MESSAGES.ERROR.PASSWORD_TOO_SHORT),
  next: z.string().optional(),
});

/** ユーザー登録アクション */
export const signup = createPublicAction(
  signupSchema,
  async ({ name, search_id, email, password, next = ROUTES.HOME }) => {
    const supabase = await createClient();

    // 1. 検索IDの重複チェック
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", search_id)
      .single();

    if (existingUser) {
      const msg = encodeURIComponent(MESSAGES.ERROR.SEARCH_ID_DUPLICATE);
      const nextQuery =
        next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : "";
      redirect(`${ROUTES.SIGNUP}?error=${msg}${nextQuery}`);
    }

    // 2. ユーザー登録処理
    const origin =
      (await headers()).get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, search_id },
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (errorMessage.includes("already registered")) {
        errorMessage = MESSAGES.ERROR.EMAIL_ALREADY_REGISTERED;
      } else if (errorMessage.includes("Weak password")) {
        errorMessage = MESSAGES.ERROR.PASSWORD_TOO_SHORT;
      }
      const nextQuery =
        next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : "";
      redirect(
        `${ROUTES.SIGNUP}?error=${encodeURIComponent(errorMessage)}${nextQuery}`,
      );
    }

    if (!data.session) {
      redirect(
        `${ROUTES.VERIFY}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`,
      );
    }

    revalidatePath(ROUTES.HOME, "layout");
    redirect(next);
  },
);

/** OTP検証アクション */
export const verifySignupOtp = createPublicAction(
  z.object({
    email: z.string().email(),
    token: z.string().min(1),
    next: z.string().optional(),
  }),
  async ({ email, token, next = ROUTES.HOME }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      const msg = encodeURIComponent(MESSAGES.ERROR.OTP_EXPIRED_OR_INVALID);
      redirect(
        `${ROUTES.VERIFY}?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}&error=${msg}`,
      );
    }

    revalidatePath(ROUTES.HOME, "layout");
    redirect(`${ROUTES.COMPLETE}?next=${encodeURIComponent(next)}`);
  },
);

/** OTP再送アクション */
export const resendSignupOtp = createPublicAction(
  z.object({
    email: z.string().email(),
    next: z.string().optional(),
  }),
  async ({ email, next = ROUTES.HOME }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
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
  },
);
