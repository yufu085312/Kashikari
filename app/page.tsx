export const runtime = 'edge';
import { createClient } from '@/utils/supabase/server'
import { getGroupsByUserId } from '@/lib/repositories/groupRepository'
import { HomePageClient } from '@/components/home/home-client'

export default async function HomePage() {
  try {
    const supabase = await createClient()
    
    // Auth取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw new Error(`Auth Error: ${authError.message}`)
    if (!user) return (<div>User not found. Check middleware.</div>)

    // グループ取得
    let groups = []
    try {
      groups = await getGroupsByUserId(user.id)
    } catch (ge: any) {
      throw new Error(`Group Fetch Error: ${ge.message}`)
    }

    const userName = user.user_metadata?.name || 'ゲスト'
    const searchId = user.user_metadata?.search_id || ''

    return (
      <div>
        <HomePageClient initialGroups={groups} userName={userName} searchId={searchId} />
      </div>
    )
  } catch (e: any) {
    return (
      <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fff5f5', border: '2px solid red', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🚨 DEBUG: 致命的なエラーが発生しました</h1>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #ffcccc' }}>
          <p style={{ fontWeight: 'bold' }}>エラーメッセージ:</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#d00' }}>{e.message}</pre>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          <p>🔧 システムチェック:</p>
          <ul>
            <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ OK' : '❌ MISSING'}</li>
            <li>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ OK' : '❌ MISSING'}</li>
            <li>Current Path: / (HomePage)</li>
          </ul>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666' }}>※原因特定のため、この画面の情報を教えてください。</p>
      </div>
    )
  }
}
