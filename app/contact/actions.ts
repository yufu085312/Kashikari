"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitInquiry(formData: FormData) {
  const supabase = await createClient();

  const type = formData.get("type") as string;
  const content = formData.get("content") as string;

  // バリデーション
  if (!type || !content) {
    return { error: "必須項目が入力されていません。" };
  }

  if (content.length > 1000) {
    return { error: "お問い合わせ内容は1000文字以内で入力してください。" };
  }

  // 現在のログインユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "ログインが必要です。" };
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
      error:
        "お問い合わせの送信に失敗しました。時間をおいて再度お試しください。",
    };
  }

  return { success: true };
}
