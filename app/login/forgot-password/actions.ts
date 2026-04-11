"use server";

import { createClient } from "@/utils/supabase/server";
import { ROUTES, MESSAGES } from "@/lib/constants";

export async function sendResetPasswordEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: MESSAGES.ERROR.EMAIL_REQUIRED };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${ROUTES.RESET_PASSWORD}`,
  });

  if (error) {
    console.error("Reset password error:", error);
    return { error: MESSAGES.ERROR.RESET_EMAIL_SEND_FAILED };
  }

  return { success: true };
}
