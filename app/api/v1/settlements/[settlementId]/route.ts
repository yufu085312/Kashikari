export const runtime = "edge";

import {
  getSettlementGroupId,
  deleteSettlement,
} from "@/lib/repositories/settlementRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const DELETE = withAuthParams<{ settlementId: string }>(
  async (_req, user, { settlementId }) => {
    // 精算が属するグループを取得
    const groupId = await getSettlementGroupId(settlementId);

    // メンバーシップ検証
    await verifyGroupMembership(groupId, user.id);

    // 削除実行
    await deleteSettlement(settlementId);

    return ok({ success: true });
  },
);
