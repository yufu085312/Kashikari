import { NextRequest, NextResponse } from 'next/server'
import { getBalances } from '@/lib/usecases/getBalances'
import { createClient } from '@/utils/supabase/server'

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null })
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const { groupId } = await params
    const balances = await getBalances(groupId)
    return ok(balances)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}
