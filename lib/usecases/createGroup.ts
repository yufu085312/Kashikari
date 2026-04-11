import { createClient } from "@/utils/supabase/server";
import { createGroup as repoCreateGroup } from "@/lib/repositories/groupRepository";
import { Group } from "@/types/group";
import { NotFoundError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export interface CreateGroupInput {
  name: string;
  creatorId: string;
  memberSearchIds?: string[];
}

export async function createGroup(
  input: CreateGroupInput,
): Promise<Group & { userIds: string[] }> {
  const { name, creatorId, memberSearchIds = [] } = input;
  const supabase = await createClient();

  const userIds: string[] = [creatorId];

  // 空文字はフィルタリング
  const validSearchIds = memberSearchIds
    .map((s) => s.trim())
    .filter((s) => s !== "");

  if (validSearchIds.length > 0) {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, search_id")
      .in("search_id", validSearchIds);

    if (error) throw new Error(error.message);
    if (users.length !== validSearchIds.length) {
      throw new NotFoundError(MESSAGES.ERROR.GROUP_INVITE_NOT_FOUND);
    }

    users.forEach((u) => {
      if (!userIds.includes(u.id)) {
        userIds.push(u.id);
      }
    });
  }

  const group = await repoCreateGroup(name, userIds);

  return { ...group, userIds };
}
