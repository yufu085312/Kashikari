export const runtime = "edge";

import {
  getPaymentGroupId,
  deletePayment,
} from "@/lib/repositories/paymentRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const DELETE = withAuthParams<{ paymentId: string }>(
  async (_req, user, { paymentId }) => {
    // 支払いが属するグループを取得
    const groupId = await getPaymentGroupId(paymentId);

    // メンバーシップ検証
    await verifyGroupMembership(groupId, user.id);

    // 削除実行
    await deletePayment(paymentId);

    return ok({ success: true });
  },
);
