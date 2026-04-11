"use server";

import { createClient } from "@/utils/supabase/server";
import { ROUTES, MESSAGES } from "@/lib/constants";

import { createPublicAction } from "@/lib/actions/action-utils";
import { z } from "zod";

/** パスワードリセットメール送信アクション */
export const sendResetPasswordEmail = createPublicAction(
  z.object({
    email: z.string().email(MESSAGES.ERROR.EMAIL_INVALID),
  }),
  async ({ email }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${ROUTES.RESET_PASSWORD}`,
    });

    if (error) {
      console.error("Reset password error:", error);
      throw new Error(MESSAGES.ERROR.RESET_EMAIL_SEND_FAILED);
    }

    return { success: true };
  },
);
