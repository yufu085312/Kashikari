"use server";

import { createClient } from "@/utils/supabase/server";
import { MESSAGES } from "@/lib/constants";

export async function submitInquiry(formData: FormData) {
  const supabase = await createClient();

  const type = formData.get("type") as string;
  const content = formData.get("content") as string;

  // バリデーション
  if (!type || !content) {
    return { error: MESSAGES.ERROR.INQUIRY_TYPE_REQUIRED };
  }

  if (content.length > 1000) {
    return { error: MESSAGES.ERROR.INQUIRY_CONTENT_TOO_LONG };
  }

  // 現在のログインユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: MESSAGES.ERROR.UNAUTHORIZED };
  }

  const email = user.email;
  const name = user.user_metadata?.name || null;

  // データベースへの保存
  const { error } = await supabase.from("inquiries").insert({
    user_id: user.id,
    name,
    email,
    type,
    content,
    status: "new",
  });

  if (error) {
    console.error("Inquiry submission error:", error);
    return {
      error: MESSAGES.ERROR.INQUIRY_SUBMIT_FAILED,
    };
  }

  return { success: true };
}
