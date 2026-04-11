export const runtime = "edge";

import { createClient } from "@/utils/supabase/server";
import { deleteSettlement } from "@/lib/repositories/settlementRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";
import { NotFoundError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export const DELETE = withAuthParams<{ settlementId: string }>(
  async (_req, user, { settlementId }) => {
    const supabase = await createClient();

    // 精算が属するグループを取得
    const { data: settlement, error: fetchError } = await supabase
      .from("settlements")
      .select("group_id")
      .eq("id", settlementId)
      .single();

    if (fetchError || !settlement) {
      throw new NotFoundError(MESSAGES.ERROR.SETTLEMENT_NOT_FOUND);
    }

    // メンバーシップ検証
    await verifyGroupMembership(settlement.group_id, user.id);

    // 削除実行
    await deleteSettlement(settlementId);

    return ok({ success: true });
  },
);
