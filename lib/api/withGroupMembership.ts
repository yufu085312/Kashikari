/**
 * グループメンバーシップ検証ヘルパー
 *
 * APIルートで groupId を使う場合に、リクエストユーザーが
 * そのグループのメンバーであることを保証する。
 */
import { createClient } from "@/utils/supabase/server";
import { ForbiddenError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

/**
 * userId が groupId のメンバーかどうかを検証する。
 * メンバーでない場合は ForbiddenError を投げる。
 */
export async function verifyGroupMembership(
  groupId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ForbiddenError(MESSAGES.ERROR.NOT_GROUP_MEMBER);
  }
}
