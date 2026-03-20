export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'
import { settleDebt } from '@/lib/usecases/settleDebt'
import { createClient } from '@/utils/supabase/server'

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null })
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { groupId, fromUserId, toUserId, amount } = await req.json()
    if (!groupId || !fromUserId || !toUserId || !amount) {
      return err('groupId, fromUserId, toUserId, amount are required')
    }

    const settlement = await settleDebt({ groupId, fromUserId, toUserId, amount })
    return ok(settlement)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}
