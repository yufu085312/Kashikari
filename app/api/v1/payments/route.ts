export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/usecases/createPayment'
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

    const body = await req.json()
    const { groupId, payerId, amount, participants, memo } = body

    if (!groupId || !payerId || !amount || !participants) {
      return err('groupId, payerId, amount, participants are required')
    }

    const payment = await createPayment({ groupId, payerId, amount, participants, memo })
    return ok(payment)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}

