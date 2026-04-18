"use server";

import { createSafeAction } from "@/lib/actions/action-utils";
import { fetchUnsettledBalances } from "@/lib/usecases/getUnsettledBalances";
import { createAdminClient } from "@/utils/supabase/admin";
import { MESSAGES } from "@/lib/constants";
import { z } from "zod";
import { redirect } from "next/navigation";

/**
 * アカウント削除アクション
 */
export const deleteAccountAction = createSafeAction(
  z.object({}),
  async (_, userId) => {
    // 1. 未精算の貸し借りがないかチェック
    const unsettledBalances = await fetchUnsettledBalances(userId);

    // 自分の関与する貸し借りが一つでもあれば削除不可
    if (unsettledBalances.length > 0) {
      throw new Error(MESSAGES.ERROR.MEMBER_LEAVE_SETTLEMENT_PENDING);
    }

    // 2. Authサイドからユーザーを削除
    // ※ public.users や関連テーブルは DB側の ON DELETE CASCADE / SET NULL により処理される
    const adminClient = createAdminClient();
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Failed to delete user account:", deleteError);
      throw new Error(MESSAGES.ERROR.ACCOUNT_DELETE_FAILED);
    }

    // 3. ログアウト処理を行いトップへ
    redirect("/");
  },
);
