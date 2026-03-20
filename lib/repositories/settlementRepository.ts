import { createClient } from '@/utils/supabase/server'
import { Settlement, CreateSettlementInput } from '@/types/balance'

export async function insertSettlement(input: CreateSettlementInput): Promise<Settlement> {
  const supabase = await createClient()
  const { groupId, fromUserId, toUserId, amount } = input

  const { data, error } = await supabase
    .from('settlements')
    .insert({
      group_id: groupId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getSettlementsByGroupId(groupId: string): Promise<Settlement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settlements')
    .select(`
      *,
      from_user:users!from_user_id(*),
      to_user:users!to_user_id(*)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function deleteSettlement(settlementId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('settlements')
    .delete()
    .eq('id', settlementId)

  if (error) throw new Error(error.message)
}
