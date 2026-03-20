'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BalanceList } from '@/components/balances/balance-list'
import { PaymentList } from '@/components/payments/payment-list'
import { Modal } from '@/components/ui/modal'
import { PaymentForm } from '@/components/payments/payment-form'
import { SettlementList } from '@/components/settlements/settlement-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api/client'
import { Balance } from '@/types/balance'
import { Payment } from '@/types/payment'
import { User } from '@/types/user'

interface GroupDetailClientProps {
  groupId: string
  userId: string
  initialGroupName: string
  initialMembers: User[]
  initialCreatedBy?: string
  initialBalances: Balance[]
  initialPayments: Payment[]
  initialSettlements: any[]
}

export function GroupDetailClient({
  groupId,
  userId,
  initialGroupName,
  initialMembers,
  initialCreatedBy,
  initialBalances,
  initialPayments,
  initialSettlements,
}: GroupDetailClientProps) {
  const router = useRouter()

  const [balances, setBalances] = useState<Balance[]>(initialBalances)
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [settlements, setSettlements] = useState<any[]>(initialSettlements)
  const [activeTab, setActiveTab] = useState<'balances' | 'payments' | 'settlements'>('balances')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBalanceWarning, setShowBalanceWarning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [searchIdInput, setSearchIdInput] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [balanceData, paymentData, settlementData] = await Promise.all([
        api.getBalances(groupId),
        api.getPayments(groupId),
        api.getSettlements(groupId),
      ])
      setBalances(balanceData)
      setPayments(paymentData as Payment[])
      setSettlements(settlementData)
    } catch (e) {
      console.error(e)
    }
  }, [groupId])

  const handleDeleteGroup = async () => {
    setIsDeleting(true)
    try {
      await api.deleteGroup(groupId)
      router.push('/')
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    fetchData()
  }

  const handleSettle = () => fetchData()

  const copyInviteUrl = () => {
    const url = `${window.location.origin}/groups/${groupId}/invite`
    navigator.clipboard.writeText(url)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 2000)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchIdInput.trim()) return
    setAddingMember(true)
    setAddMemberError(null)
    try {
      await api.addMember(groupId, searchIdInput.trim())
      setSearchIdInput('')
      setShowInviteModal(false)
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setAddMemberError(String(err))
    } finally {
      setAddingMember(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-white truncate">{initialGroupName}</h1>
          <p className="text-xs text-gray-500">{initialMembers.length}人のメンバー</p>
        </div>

        <button 
          onClick={() => {
            if (balances.length > 0) {
              setShowBalanceWarning(true)
            } else {
              setShowDeleteConfirm(true)
            }
          }}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
          title="グループを削除"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <Button onClick={() => setShowInviteModal(true)} variant="secondary" size="sm">
          招待
        </Button>
        <Button onClick={() => setShowPaymentForm(true)} size="sm">
          追加
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {initialMembers.map(member => (
          <div
            key={member.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              member.id === userId
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10'
            }`}
          >
            {member.name}
            {member.id === userId && ' (自分)'}
          </div>
        ))}
      </div>

      {balances.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">未精算あり</span>
          </div>
          <p className="text-2xl font-extrabold text-white">
            {balances.length}件 の未精算
          </p>
        </div>
      )}

      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-5">
        {[
          { key: 'balances', label: '現時点の残高', icon: '💰' },
          { key: 'payments', label: '支払い', icon: '📋' },
          { key: 'settlements', label: '精算', icon: '✅' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {activeTab === 'balances' ? (
          <BalanceList
            balances={balances}
            groupId={groupId}
            onSettle={handleSettle}
          />
        ) : activeTab === 'payments' ? (
          <PaymentList
            payments={payments}
            latestSettlementAt={
              settlements.length > 0 
                ? settlements[0].created_at // order('created_at', { ascending: false }) なので 0番目が最新
                : null
            }
            onDelete={fetchData}
          />
        ) : (
          <SettlementList
            settlements={settlements}
            onDelete={fetchData}
          />
        )}
      </div>

      <Modal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title="支払いを登録"
      >
        <PaymentForm
          groupId={groupId}
          members={initialMembers}
          currentUserId={userId}
          onSuccess={handlePaymentSuccess}
        />
      </Modal>

      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false)
          setAddMemberError(null)
          setSearchIdInput('')
        }}
        title="メンバーを招待・追加"
      >
        <div className="space-y-6">
          {/* 検索ID追加 */}
          <form onSubmit={handleAddMember} className="space-y-3 p-4 bg-black/10 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-white">検索IDで直接追加</h3>
            <p className="text-xs text-gray-400">
              既に参加しているユーザーの検索IDがわかる場合はこちらから追加できます。
            </p>
            <div className="flex gap-2 items-start mt-2">
              <div className="flex-1">
                <Input
                  placeholder="例: tanaka_123"
                  value={searchIdInput}
                  onChange={e => setSearchIdInput(e.target.value)}
                />
              </div>
              <Button type="submit" loading={addingMember}>
                追加
              </Button>
            </div>
            {addMemberError && <p className="text-red-400 text-xs mt-1">{addMemberError}</p>}
          </form>

          {/* URL招待 */}
          <div className="space-y-3 p-4 bg-black/10 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-white">URLで招待</h3>
            <p className="text-xs text-gray-400">
              以下のURLをコピーして、LINEなどで共有してください。
            </p>
            <div className="flex gap-2 mt-2">
              <input 
                readOnly 
                value={typeof window !== 'undefined' ? `${window.location.origin}/groups/${groupId}/invite` : ''}
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 text-sm text-gray-300"
              />
              <Button onClick={copyInviteUrl} variant="secondary">
                {inviteCopied ? 'コピーした！' : 'コピー'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="グループを削除しますか？"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            グループを削除すると、これまでの支払い履歴や残高などの全てのデータが完全に消去されます。この操作は取り消せません。
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-500 border-red-500/50"
              onClick={handleDeleteGroup}
              loading={isDeleting}
            >
              削除する
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showBalanceWarning}
        onClose={() => setShowBalanceWarning(false)}
        title="未精算のデータがあります"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-400 mb-0.5">残高が残っています</p>
              <p className="text-xs text-orange-400/70">精算が完了していない支払いが {balances.length} 件あります。</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 leading-relaxed">
            グループを削除すると、これらすべてのデータが完全に消去されます。未精算の項目を確認してから削除することをお勧めします。
          </p>
          
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full"
              onClick={() => {
                setShowBalanceWarning(false)
                setShowDeleteConfirm(true)
              }}
            >
              削除の手続きへ進む
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-white"
              onClick={() => setShowBalanceWarning(false)}
            >
              今はやめておく
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
