export const runtime = "edge";

import { settleDebt } from "@/lib/usecases/settleDebt";
import { withAuth, ok } from "@/lib/api/handler";
import { createSettlementSchema } from "@/lib/schemas";
import { ValidationError } from "@/lib/errors";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const result = createSettlementSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }

  const { groupId, fromUserId, toUserId, amount } = result.data;

  // メンバーシップ検証
  await verifyGroupMembership(groupId, user.id);

  const settlement = await settleDebt({
    groupId,
    fromUserId,
    toUserId,
    amount,
  });

  return ok(settlement);
});
