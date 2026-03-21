export const runtime = 'edge';
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  
  // URLパラメータの next か、Cookie に保存された遷移先を優先
  const cookieStore = await cookies()
  const pendingRedirect = cookieStore.get('pending_redirect')?.value
  const next = searchParams.get('next') || pendingRedirect || '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // 登録完了画面へリダイレクト
      // ユーザーが元の招待URLを保持したタブに戻るよう誘導します
      redirect('/signup/complete')
    }
  }

  // 失敗した場合はエラー画面（またはログイン画面）へ
  redirect('/login?error=認証に失敗したか、リンクの期限が切れています。')
}
