import { createClient } from '@/utils/supabase/server'
import { getGroupById } from '@/lib/repositories/groupRepository'
import { getBalances } from '@/lib/usecases/getBalances'
import { getPaymentsByGroupId } from '@/lib/repositories/paymentRepository'
import { GroupDetailClient } from '@/components/groups/group-detail-client'
import { redirect } from 'next/navigation'

export default async function GroupDetailPage(props: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  try {
    const group = await getGroupById(groupId)
    const isMember = group.members.some(m => m.id === user.id)
    
    if (!isMember) {
      // メンバー外なら招待ページにリダイレクト
      redirect(`/groups/${groupId}/invite`)
    }

    const { getSettlementsByGroupId } = await import('@/lib/repositories/settlementRepository')
    const [balances, payments, settlements] = await Promise.all([
      getBalances(groupId),
      getPaymentsByGroupId(groupId),
      getSettlementsByGroupId(groupId)
    ])

    return (
      <div className="min-h-dvh max-w-lg mx-auto px-4 py-6 pb-24">
        <GroupDetailClient 
          groupId={groupId}
          userId={user.id}
          initialGroupName={group.name}
          initialMembers={group.members}
          initialCreatedBy={group.created_by}
          initialBalances={balances}
          initialPayments={payments}
          initialSettlements={settlements}
        />
      </div>
    )
  } catch {
    // グループが存在しない場合など
    redirect('/')
  }
}
