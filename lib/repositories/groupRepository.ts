import { createClient } from '@/utils/supabase/server'
import { Group, GroupMember } from '@/types/group'
import { User } from '@/types/user'

export async function createGroup(name: string, userIds: string[]): Promise<Group> {
  const supabase = await createClient()
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, created_by: userIds[0] })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // メンバーを追加
  const members = userIds.map(userId => ({ group_id: group.id, user_id: userId }))
  const { error: memberError } = await supabase.from('group_members').insert(members)
  if (memberError) throw new Error(memberError.message)

  return group
}

export async function getGroupById(groupId: string): Promise<Group & { members: User[] }> {
  const supabase = await createClient()
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle()
 
  if (error) throw new Error(error.message)
  if (!group) throw new Error('グループが見つからないか、アクセス権限がありません')

  const { data: memberRows, error: memberError } = await supabase
    .from('group_members')
    .select('*, user:users(*)')
    .eq('group_id', groupId)

  if (memberError) throw new Error(memberError.message)

  const members: User[] = (memberRows || [])
    .filter((row: any) => row.user !== null) // user情報が一時的に欠けている場合を除外
    .map((row: any) => row.user as User)

  return { ...group, members }
}

export async function getGroupsByUserId(userId: string): Promise<Group[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('group:groups(*)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || [])
    .filter((row: any) => row.group !== null)
    .map((row: any) => row.group as Group)
}

export async function addMemberToGroup(groupId: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId })

  if (error) throw new Error(error.message)
}

export async function deleteGroup(groupId: string): Promise<void> {
  const supabase = await createClient()
  const { error, count } = await supabase
    .from('groups')
    .delete({ count: 'exact' })
    .eq('id', groupId)
 
  if (error) throw new Error(error.message)
  if (count === 0) throw new Error('グループを削除する権限がないか、グループが見つかりません')
}
