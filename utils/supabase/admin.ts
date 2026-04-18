import { createClient } from "@supabase/supabase-js";

/**
 * 管理者権限（Service Role）を持つ Supabase クライアントを作成します。
 * ユーザーの削除（auth.admin.deleteUser）など、制限された操作に使用します。
 * ※クライアントサイドでは絶対に使用しないでください。
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase Admin environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
