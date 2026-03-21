export const runtime = 'edge';
import { createClient } from '@/utils/supabase/server'
import { getGroupById, addMemberToGroup } from '@/lib/repositories/groupRepository'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export default async function InvitePage(props: { 
  params: Promise<{ groupId: string }>,
  searchParams: Promise<{ error?: string }>
}) {
  const { groupId } = await props.params
  const { error: serverError } = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const nextPath = `/groups/${groupId}/invite`
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  try {
    const group = await getGroupById(groupId)
    const isMember = group.members.some(m => m.id === user.id)

    if (isMember) {
      // すでにメンバーならグループへ
      redirect(`/groups/${groupId}`)
    }

    async function joinGroup() {
      'use server'
      try {
        const supabaseSrv = await createClient()
        const { data: { user: authUser } } = await supabaseSrv.auth.getUser()
        if (!authUser) throw new Error('認証されていません')
        
        await addMemberToGroup(groupId, authUser.id)
        revalidatePath(`/groups/${groupId}`)
        redirect(`/groups/${groupId}`)
      } catch (error) {
        console.error('Failed to join group:', error)
        const message = error instanceof Error ? error.message : '参加に失敗しました'
        redirect(`/groups/${groupId}/invite?error=${encodeURIComponent(message)}`)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl flex items-center justify-center text-3xl">
            👋
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{group.name}</h1>
          <p className="text-gray-400 mb-8">このグループへ招待されています！</p>
          
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-6 animate-fade-in">
              {serverError}
            </div>
          )}

          <form action={joinGroup}>
            <Button type="submit" size="lg" className="w-full">
              グループに参加する
            </Button>
          </form>
        </div>
      </div>
    )
  } catch {
    redirect('/')
  }
}
