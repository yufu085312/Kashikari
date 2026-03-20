import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null })
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { paymentId } = await params
    if (!paymentId) return err('paymentId is required')

    // 権限チェック: 支払いが属するグループのメンバーかどうか
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('group_id')
      .eq('id', paymentId)
      .single()

    if (fetchError || !payment) return err('Payment not found', 404)

    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', payment.group_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) return err('Unauthorized: You are not a member of this group', 403)

    // 削除実行
    const { error } = await supabase.from('payments').delete().eq('id', paymentId)
    
    if (error) return err(error.message, 500)
    
    return ok({ success: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}
