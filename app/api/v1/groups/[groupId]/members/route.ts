export const runtime = "edge";

import { addMemberToGroup } from "@/lib/repositories/groupRepository";
import { createClient } from "@/utils/supabase/server";
import { withAuthParams, ok } from "@/lib/api/handler";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";
import { addMemberSchema } from "@/lib/schemas";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export const POST = withAuthParams<{ groupId: string }>(
  async (req, user, { groupId }) => {
    // メンバーシップ検証
    await verifyGroupMembership(groupId, user.id);

    const body = await req.json();
    const result = addMemberSchema.safeParse(body);

    if (!result.success) {
      throw new ValidationError(result.error.issues[0].message);
    }

    const { searchId } = result.data;

    const supabase = await createClient();
    const { data: targetUser, error } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", searchId)
      .single();

    if (error || !targetUser) {
      throw new NotFoundError(MESSAGES.ERROR.USER_NOT_FOUND);
    }

    try {
      await addMemberToGroup(groupId, targetUser.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unique constraint")) {
        throw new ConflictError(MESSAGES.ERROR.USER_ALREADY_MEMBER);
      }
      throw e;
    }

    return ok({ success: true });
  },
);
