export const runtime = "edge";

import { removeMemberFromGroup } from "@/lib/repositories/groupRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const DELETE = withAuthParams<{ groupId: string; userId: string }>(
  async (_req, user, { groupId, userId }) => {
    // リクエストユーザーがグループのメンバーであることを確認
    await verifyGroupMembership(groupId, user.id);

    await removeMemberFromGroup(groupId, userId);
    return ok({ success: true });
  },
);
