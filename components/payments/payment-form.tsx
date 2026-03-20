'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api/client'
import { calcEvenSplit } from '@/utils/format'

interface PaymentFormProps {
  groupId: string
  members: User[]
  currentUserId: string
  onSuccess?: () => void
}

export function PaymentForm({ groupId, members, currentUserId, onSuccess }: PaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState(currentUserId)
  const [selectedIds, setSelectedIds] = useState<string[]>(members.map(m => m.id))
  const [memo, setMemo] = useState('')
  const [isManual, setIsManual] = useState(false)
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 均等割り自動計算
  const autoSplitAmounts = calcEvenSplit(Number(amount) || 0, selectedIds)

  // 手動入力の合計計算
  const manualTotal = Object.values(manualAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0)
  const isTotalMatching = !isManual || manualTotal === Number(amount)

  const toggleMember = (userId: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      // 手動モードで選択解除されたら金額もクリア
      if (!next.includes(userId)) {
        const newManual = { ...manualAmounts }
        delete newManual[userId]
        setManualAmounts(newManual)
      }
      return next
    })
  }

  const handleManualAmountChange = (userId: string, value: string) => {
    setManualAmounts(prev => ({ ...prev, [userId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || selectedIds.length === 0) return

    if (isManual && !isTotalMatching) {
      setError(`合計金額が一致しません（現在: ¥${manualTotal.toLocaleString()}）`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const participants = isManual 
        ? selectedIds.map(id => ({ userId: id, share: Number(manualAmounts[id]) || 0 }))
        : autoSplitAmounts.map(s => ({ userId: s.userId, share: s.share }))

      await api.createPayment({
        groupId,
        payerId,
        amount: Number(amount),
        participants,
        memo: memo.trim() || undefined,
      })

      // Reset
      setAmount('')
      setMemo('')
      setManualAmounts({})
      setSelectedIds(members.map(m => m.id))
      onSuccess?.()
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 金額 */}
      <div className="flex flex-col gap-1.5 animate-slide-up">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">金額</label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-2xl font-black group-focus-within:scale-110 transition-transform">¥</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            min={1}
            className="w-full bg-white/5 border-2 border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white text-3xl font-black placeholder-gray-800 focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 支払者 */}
      <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">誰が払った？</label>
        <div className="flex flex-wrap gap-2">
          {members.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => setPayerId(member.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                payerId === member.id
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5'
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* 分割設定 */}
      <div className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">負担するメンバー</label>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${!isManual ? 'bg-white/10 text-white shadow-sm' : 'text-gray-600'}`}
            >
              自動割り勘
            </button>
            <button
              type="button"
              onClick={() => setIsManual(true)}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${isManual ? 'bg-white/10 text-white shadow-sm' : 'text-gray-600'}`}
            >
              手動入力
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {members.map(member => {
            const isSelected = selectedIds.includes(member.id)
            const autoShare = autoSplitAmounts.find(s => s.userId === member.id)?.share || 0
            
            return (
              <div
                key={member.id}
                className={`flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'bg-white/5 border-emerald-500/20'
                    : 'bg-transparent border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className="flex items-center gap-3 group"
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700 group-hover:border-gray-500'
                    }`}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                      {member.name}
                    </span>
                  </button>

                  {!isManual && isSelected && amount && (
                    <span className="text-emerald-400 font-black tabular-nums">
                      ¥{autoShare.toLocaleString()}
                    </span>
                  )}
                </div>

                {isManual && isSelected && (
                  <div className="relative animate-scale-in">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">¥</span>
                    <input
                      type="number"
                      placeholder="金額を入力"
                      value={manualAmounts[member.id] || ''}
                      onChange={e => handleManualAmountChange(member.id, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {isManual && amount && (
          <div className={`flex items-center justify-between p-3 rounded-xl border-dashed border-2 ${
            isTotalMatching ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
          }`}>
            <span className="text-[10px] font-bold text-gray-500 uppercase">入力合計: ¥{manualTotal.toLocaleString()}</span>
            <span className={`text-[10px] font-bold uppercase ${isTotalMatching ? 'text-emerald-500' : 'text-red-500'}`}>
              {isTotalMatching ? '金額が一致しています ✓' : `不足: ¥${(Number(amount) - manualTotal).toLocaleString()}`}
            </span>
          </div>
        )}
      </div>

      {/* メモ */}
      <div className="flex flex-col gap-1.5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">メモ</label>
        <input
          placeholder="例：焼肉ランチ"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-medium placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-red-400 animate-shake">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        size="lg" 
        loading={loading} 
        className="w-full py-6 rounded-2xl text-lg font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all"
        disabled={isManual && !isTotalMatching}
      >
        支払いを追加する
      </Button>
    </form>
  )
}
