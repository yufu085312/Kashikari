export const runtime = "edge";

import { createClient } from "@/utils/supabase/server";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";
import { NotFoundError } from "@/lib/errors";

export const DELETE = withAuthParams<{ paymentId: string }>(
  async (_req, user, { paymentId }) => {
    const supabase = await createClient();

    // 支払いが属するグループを取得
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("group_id")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      throw new NotFoundError("Payment not found");
    }

    // メンバーシップ検証
    await verifyGroupMembership(payment.group_id, user.id);

    // 削除実行
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) throw new Error(error.message);

    return ok({ success: true });
  },
);
