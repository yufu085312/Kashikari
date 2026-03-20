import { getPaymentsByGroupId } from '@/lib/repositories/paymentRepository'
import { getSettlementsByGroupId } from '@/lib/repositories/settlementRepository'
import { getGroupById } from '@/lib/repositories/groupRepository'
import { calcBalance } from '@/utils/calcBalance'
import { Balance } from '@/types/balance'

export async function getBalances(groupId: string): Promise<Balance[]> {
  const [groupWithMembers, payments, settlements] = await Promise.all([
    getGroupById(groupId),
    getPaymentsByGroupId(groupId),
    getSettlementsByGroupId(groupId),
  ])

  return calcBalance(payments, settlements, groupWithMembers.members)
}
