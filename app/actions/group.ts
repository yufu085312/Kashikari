"use server";

import { createSafeAction } from "@/lib/actions/action-utils";
import { createGroup } from "@/lib/usecases/createGroup";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
  getGroupById,
} from "@/lib/repositories/groupRepository";
import { MESSAGES } from "@/lib/constants";
import { createGroupSchema, addMemberSchema } from "@/lib/schemas/group";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/errors";
import { createClient } from "@/utils/supabase/server";

/** グループ作成アクション */
export const createGroupAction = createSafeAction(
  createGroupSchema,
  async (input, userId) => {
    const group = await createGroup({
      name: input.name,
      creatorId: userId,
      memberSearchIds: input.memberSearchIds,
    });
    revalidatePath("/");
    return group;
  },
);

/** メンバー追加アクション */
export const addMemberAction = createSafeAction(
  z.object({
    groupId: z.string().uuid(),
    input: addMemberSchema,
  }),
  async ({ groupId, input }) => {
    const supabase = await createClient();
    const { data: targetUser, error: queryError } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", input.searchId)
      .single();

    if (queryError || !targetUser) {
      throw new NotFoundError(MESSAGES.ERROR.USER_NOT_FOUND);
    }

    try {
      await addMemberToGroup(groupId, targetUser.id);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("unique constraint")) {
        throw new ConflictError(MESSAGES.ERROR.USER_ALREADY_MEMBER);
      }
      throw e;
    }

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  },
);

/** メンバー削除アクション */
export const removeMemberAction = createSafeAction(
  z.object({
    groupId: z.string().uuid(),
    targetUserId: z.string().uuid(),
  }),
  async ({ groupId, targetUserId }, userId) => {
    const group = await getGroupById(groupId);

    // 作成者のみが削除可能
    if (group.created_by !== userId && targetUserId !== userId) {
      throw new ForbiddenError(MESSAGES.ERROR.FORBIDDEN);
    }

    await removeMemberFromGroup(groupId, targetUserId);
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  },
);

/** グループ削除アクション */
export const deleteGroupAction = createSafeAction(
  z.string().uuid(),
  async (groupId, userId) => {
    const group = await getGroupById(groupId);

    // 作成者のみがグループ削除可能
    if (group.created_by !== userId) {
      throw new ForbiddenError(MESSAGES.ERROR.FORBIDDEN);
    }

    await deleteGroup(groupId);
    revalidatePath("/");
    return { success: true };
  },
);
