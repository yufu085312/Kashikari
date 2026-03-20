'use client'

import { Balance } from '@/types/balance'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api/client'
import { useState } from 'react'

interface BalanceListProps {
  balances: Balance[]
  groupId: string
  onSettle?: () => void
}

export function BalanceList({ balances, groupId, onSettle }: BalanceListProps) {
  const [settlingKey, setSettlingKey] = useState<string | null>(null)

  const handleSettle = async (balance: Balance) => {
    const key = `${balance.fromUserId}-${balance.toUserId}`
    if (!confirm(`${balance.fromUserName} → ${balance.toUserName} の ${formatCurrency(balance.amount)} を精算しますか？`)) return

    setSettlingKey(key)
    try {
      await api.createSettlement({
        groupId,
        fromUserId: balance.fromUserId,
        toUserId: balance.toUserId,
        amount: balance.amount,
      })
      onSettle?.()
    } catch (e) {
      alert('精算に失敗しました')
    } finally {
      setSettlingKey(null)
    }
  }

  if (balances.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">全員精算済み！</p>
        <p className="text-sm text-gray-600 mt-1">貸し借りはありません 🎉</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {balances.map(balance => {
        const key = `${balance.fromUserId}-${balance.toUserId}`
        return (
          <div
            key={key}
            className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 animate-fade-in"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                {/* 「AがBに支払う」表示 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{balance.fromUserName}</span>
                  <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-bold text-white">{balance.toUserName}</span>
                </div>
                <p className="text-2xl font-bold text-orange-400 mt-1">
                  {formatCurrency(balance.amount)}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="flex-shrink-0"
                loading={settlingKey === key}
                onClick={() => handleSettle(balance)}
              >
                精算
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
