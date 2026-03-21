export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'
import { createGroup } from '@/lib/usecases/createGroup'
import { getGroupsByUserId } from '@/lib/repositories/groupRepository'
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

    const { name, memberSearchIds } = await req.json()
    if (!name) return err('name is required')
    if (name.length > 20) return err('グループ名は20文字以内で入力してください')

    const group = await createGroup({
      name,
      creatorId: user.id,
      memberSearchIds: memberSearchIds || []
    })
    return ok(group)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return err('Unauthorized', 401)

    const groups = await getGroupsByUserId(user.id)
    return ok(groups)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return err(String(e.message || e), 500)
  }
}
