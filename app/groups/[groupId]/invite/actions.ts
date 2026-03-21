'use server'

import { createClient } from '@/utils/supabase/server'
import { addMemberToGroup } from '@/lib/repositories/groupRepository'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const isRedirectError = (error: any) => error?.digest?.startsWith('NEXT_REDIRECT')

export async function joinGroupAction(groupId: string) {
  try {
    const supabaseSrv = await createClient()
    const { data: { user: authUser } } = await supabaseSrv.auth.getUser()
    if (!authUser) throw new Error('認証されていません')
    
    await addMemberToGroup(groupId, authUser.id)
    revalidatePath(`/groups/${groupId}`)
    redirect(`/groups/${groupId}`)
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error('Failed to join group:', error)
    const message = error instanceof Error ? error.message : '参加に失敗しました'
    // エラー時はメッセージ付きで招待ページに戻す
    redirect(`/groups/${groupId}/invite?error=${encodeURIComponent(message)}`)
  }
}
