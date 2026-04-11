export const runtime = "edge";

import { getPaymentsByGroupId } from "@/lib/repositories/paymentRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const GET = withAuthParams<{ groupId: string }>(
  async (_req, user, { groupId }) => {
    await verifyGroupMembership(groupId, user.id);

    const payments = await getPaymentsByGroupId(groupId);
    return ok(payments);
  },
);
