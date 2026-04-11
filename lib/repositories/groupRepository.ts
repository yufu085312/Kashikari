import { createClient } from "@/utils/supabase/server";
import { Group, GroupMember } from "@/types/group";
import { User } from "@/types/user";
import { NotFoundError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export async function createGroup(
  name: string,
  userIds: string[],
): Promise<Group> {
  const supabase = await createClient();
  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, created_by: userIds[0] })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // メンバーを追加
  const members = userIds.map((userId) => ({
    group_id: group.id,
    user_id: userId,
  }));
  const { error: memberError } = await supabase
    .from("group_members")
    .insert(members);
  if (memberError) throw new Error(memberError.message);

  return group;
}

interface GroupMemberRow {
  user: User | null;
}

export async function getGroupById(
  groupId: string,
): Promise<Group & { members: User[] }> {
  const supabase = await createClient();
  const { data: group, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!group)
    throw new NotFoundError(MESSAGES.ERROR.GROUP_NOT_FOUND_OR_FORBIDDEN);

  const { data: memberRows, error: memberError } = await supabase
    .from("group_members")
    .select("*, user:users(*)")
    .eq("group_id", groupId);

  if (memberError) throw new Error(memberError.message);

  const members: User[] = (memberRows || [])
    .filter((row: GroupMemberRow) => row.user !== null)
    .map((row: GroupMemberRow) => row.user as User);

  return { ...group, members };
}

interface GroupRow {
  group: unknown | null;
}

export async function getGroupsByUserId(userId: string): Promise<Group[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("group:groups(*, members:group_members(user_id))")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return (data || [])
    .filter((row: GroupRow) => row.group !== null)
    .map((row: GroupRow) => row.group as Group);
}

export async function addMemberToGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId });

  if (error) throw new Error(error.message);
}

export async function removeMemberFromGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function deleteGroup(groupId: string): Promise<void> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("groups")
    .delete({ count: "exact" })
    .eq("id", groupId);

  if (error) throw new Error(error.message);
  if (count === 0)
    throw new NotFoundError(MESSAGES.ERROR.GROUP_DELETE_FORBIDDEN);
}
