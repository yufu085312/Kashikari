import { createGroup as repoCreateGroup } from "@/lib/repositories/groupRepository";
import { findUsersBySearchIds } from "@/lib/repositories/userRepository";
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

  const userIds: string[] = [creatorId];

  // 空文字はフィルタリング
  const validSearchIds = memberSearchIds
    .map((s) => s.trim())
    .filter((s) => s !== "");

  if (validSearchIds.length > 0) {
    const users = await findUsersBySearchIds(validSearchIds);
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
