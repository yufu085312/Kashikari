'use client'

import { Payment } from '@/types/payment'
import { formatCurrency, formatDate } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api/client'
import { useState } from 'react'

interface PaymentListProps {
  payments: Payment[]
  latestSettlementAt?: string | null
  onDelete?: () => void
}

export function PaymentList({ payments, latestSettlementAt, onDelete }: PaymentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isLocked = (createdAt: string | undefined) => {
    if (!latestSettlementAt || !createdAt) return false
    return new Date(createdAt) <= new Date(latestSettlementAt)
  }

  const handleDelete = async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId)
    if (payment && isLocked(payment.created_at)) {
      alert('この支払いはすでに精算が済んでいる履歴に含まれているため、削除できません。\n修正したい場合は、先に「精算」タブから対象の精算（↩︎）を取り消してください。')
      return
    }
    if (!confirm('この支払いを削除しますか？')) return
    setDeletingId(paymentId)
    try {
      await api.deletePayment(paymentId)
      onDelete?.()
    } catch (e) {
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">まだ支払いがありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map(payment => (
        <div
          key={payment.id}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-fade-in"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                  {payment.payer?.name}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">が支払い</span>
              </div>
              <p className="text-xl font-black text-white leading-none mt-1">
                {payment.amount.toLocaleString()}<span className="text-xs ml-1 text-gray-400 font-normal">円</span>
              </p>
              
              {/* 参加メンバー内訳 */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {payment.participants?.map(p => (
                  <span
                    key={p.user_id}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-gray-400"
                  >
                    <span className="font-bold text-gray-300">{p.user?.name}</span>
                    <span className="opacity-40">¥{p.share_amount.toLocaleString()}</span>
                  </span>
                ))}
              </div>

              {payment.memo && (
                <p className="text-xs text-gray-400 mt-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5 inline-block">
                  {payment.memo}
                </p>
              )}
              <p className="text-[10px] text-gray-500 mt-3 font-medium opacity-50">
                {payment.created_at ? formatDate(payment.created_at) : ''}
              </p>
            </div>

            <button
              onClick={() => handleDelete(payment.id)}
              disabled={deletingId === payment.id || isLocked(payment.created_at)}
              className={`transition-all p-2 rounded-xl flex-shrink-0 ${
                isLocked(payment.created_at)
                  ? 'text-gray-800 cursor-not-allowed opacity-20' 
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95'
              }`}
              title={
                isLocked(payment.created_at)
                  ? '精算済みのデータに含まれているため削除できません。まず精算履歴を取り消してください。' 
                  : '支払いを削除'
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
