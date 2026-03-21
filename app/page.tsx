export const runtime = 'edge';
import { createClient } from '@/utils/supabase/server'
import { getGroupsByUserId } from '@/lib/repositories/groupRepository'
import { HomePageClient } from '@/components/home/home-client'

export default async function HomePage() {
  const supabase = await createClient()
  
  // ミドルウェアで /login にリダイレクトされるため絶対にuserが存在する前提
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null 

  const groups = await getGroupsByUserId(user.id)
  const userName = user.user_metadata?.name || 'ゲスト'
  const searchId = user.user_metadata?.search_id || ''

  return (
    <div>
      <HomePageClient initialGroups={groups} userName={userName} searchId={searchId} />
    </div>
  )

}
