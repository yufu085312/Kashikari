import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { deleteSettlement, getSettlementsByGroupId } from '@/lib/repositories/settlementRepository'

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null })
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { settlementId } = await params
    if (!settlementId) return err('settlementId is required')

    // 権限チェック: 精算が属するグループのメンバーかどうか
    const { data: settlement, error: fetchError } = await supabase
      .from('settlements')
      .select('group_id')
      .eq('id', settlementId)
      .single()

    if (fetchError || !settlement) return err('Settlement not found', 404)

    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', settlement.group_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) return err('Unauthorized: You are not a member of this group', 403)
    
    // 削除実行
    await deleteSettlement(settlementId)
    
    return ok({ success: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}
