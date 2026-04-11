export const runtime = "edge";

import { getBalances } from "@/lib/usecases/getBalances";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const GET = withAuthParams<{ groupId: string }>(
  async (_req, user, { groupId }) => {
    await verifyGroupMembership(groupId, user.id);

    const balances = await getBalances(groupId);
    return ok(balances);
  },
);
