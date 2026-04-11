export const runtime = "edge";

import { getGroupById, deleteGroup } from "@/lib/repositories/groupRepository";
import { withAuthParams, ok } from "@/lib/api/handler";
import { ForbiddenError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export const GET = withAuthParams<{ groupId: string }>(
  async (_req, user, { groupId }) => {
    const group = await getGroupById(groupId);

    const isMember = group.members.some((m) => m.id === user.id);
    if (!isMember) {
      throw new ForbiddenError(MESSAGES.ERROR.FORBIDDEN);
    }

    return ok(group);
  },
);

export const DELETE = withAuthParams<{ groupId: string }>(
  async (_req, user, { groupId }) => {
    const group = await getGroupById(groupId);

    const isMember = group.members.some((m) => m.id === user.id);
    if (!isMember) {
      throw new ForbiddenError(MESSAGES.ERROR.GROUP_DELETE_NOT_MEMBER);
    }

    await deleteGroup(groupId);
    return ok({ success: true });
  },
);
