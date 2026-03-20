'use client'

import { Settlement } from '@/types/balance'
import { formatCurrency, formatDate } from '@/utils/format'
import { useState } from 'react'
import { api } from '@/lib/api/client'

interface SettlementListProps {
  settlements: any[]
  onDelete?: () => void
}

export function SettlementList({ settlements, onDelete }: SettlementListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('この精算記録を取り消して、残高を未精算の状態に戻しますか？')) return
    
    setDeletingId(id)
    try {
      await api.deleteSettlement(id)
      onDelete?.()
    } catch (e) {
      alert('キャンセルに失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  if (settlements.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-sm">精算履歴はまだありません</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {settlements.map(s => (
        <div
          key={s.id}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-fade-in"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="font-bold text-white">{s.from_user?.name}</span>
                <span className="text-gray-600">→</span>
                <span className="font-bold text-white">{s.to_user?.name}</span>
              </div>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                {formatCurrency(s.amount)}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">{formatDate(s.created_at)}</p>
            </div>

            <button
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
              className="text-gray-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10"
              title="精算を取り消して残高に戻す"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
