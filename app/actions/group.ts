"use server";

import { createClient } from "@/utils/supabase/server";
import { createGroup } from "@/lib/usecases/createGroup";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
} from "@/lib/repositories/groupRepository";
import { MESSAGES } from "@/lib/constants";
import {
  createGroupSchema,
  CreateGroupSchemaInput,
  addMemberSchema,
  AddMemberSchemaInput,
} from "@/lib/schemas/group";
import { revalidatePath } from "next/cache";

import { NotFoundError, ConflictError } from "@/lib/errors";

/** グループ作成アクション */
export async function createGroupAction(input: CreateGroupSchemaInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    const parsed = createGroupSchema.parse(input);

    const group = await createGroup({
      name: parsed.name,
      creatorId: user.id,
      memberSearchIds: parsed.memberSearchIds,
    });

    revalidatePath("/");

    return { data: group, error: null };
  } catch (error) {
    console.error("createGroupAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "グループの作成に失敗しました",
    };
  }
}

/** メンバー追加アクション */
export async function addMemberAction(
  groupId: string,
  input: AddMemberSchemaInput,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    const parsed = addMemberSchema.parse(input);

    const { data: targetUser, error: queryError } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", parsed.searchId)
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
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("addMemberAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "メンバーの追加に失敗しました",
    };
  }
}

/** メンバー削除アクション */
export async function removeMemberAction(
  groupId: string,
  targetUserId: string,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    await removeMemberFromGroup(groupId, targetUserId);

    revalidatePath(`/groups/${groupId}`);
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("removeMemberAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "メンバーの削除に失敗しました",
    };
  }
}

/** グループ削除アクション */
export async function deleteGroupAction(groupId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    await deleteGroup(groupId);
    revalidatePath("/");

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("deleteGroupAction error:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "グループの削除に失敗しました",
    };
  }
}
