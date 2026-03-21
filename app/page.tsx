export const runtime = 'edge';
import { createClient } from '@/utils/supabase/server'
import { getGroupsByUserId } from '@/lib/repositories/groupRepository'
import { HomePageClient } from '@/components/home/home-client'

export default async function HomePage() {
  try {
    const supabase = await createClient()
    
    // ミドルウェアで /login にリダイレクトされるため絶対にuserが存在する前提
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw new Error(`Auth Error: ${authError.message}`)
    if (!user) return null 

    const groups = await getGroupsByUserId(user.id)
    const userName = user.user_metadata?.name || 'ゲスト'
    const searchId = user.user_metadata?.search_id || ''

    return (
      <div>
        <HomePageClient initialGroups={groups} userName={userName} searchId={searchId} />
      </div>
    )
  } catch (e: any) {
    return (
      <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fff5f5' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>DEBUG: ページ読み込みエラー</h1>
        <p style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>{e.message}</p>
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666' }}>
          <p>環境変数チェック:</p>
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING'}</p>
        </div>
      </div>
    )
  }
}
