export const runtime = "edge";

import { getSettlementsByGroupId } from "@/lib/repositories/settlementRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const GET = withAuthParams<{ groupId: string }>(
  async (_req, user, { groupId }) => {
    await verifyGroupMembership(groupId, user.id);

    const settlements = await getSettlementsByGroupId(groupId);
    return ok(settlements);
  },
);
