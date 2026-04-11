"use server";

import { createPublicAction } from "@/lib/actions/action-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ROUTES, MESSAGES } from "@/lib/constants";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(MESSAGES.ERROR.EMAIL_INVALID),
  password: z.string().min(1, MESSAGES.ERROR.PASSWORD_REQUIRED),
  next: z.string().optional(),
});

/** ログインアクション */
export const login = createPublicAction(
  loginSchema,
  async ({ email, password, next = ROUTES.HOME }) => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const errorMsg = encodeURIComponent(MESSAGES.ERROR.LOGIN_FAILED);
      const nextQuery =
        next !== ROUTES.HOME ? `&next=${encodeURIComponent(next)}` : "";
      redirect(`${ROUTES.LOGIN}?error=${errorMsg}${nextQuery}`);
    }

    revalidatePath(ROUTES.HOME, "layout");
    redirect(next);
  },
);

/** ログアウトアクション */
export const logout = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.LOGIN);
};
