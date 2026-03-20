'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api/client'

interface GroupFormProps {
  onSuccess?: (groupId: string) => void
}

export function GroupForm({ onSuccess }: GroupFormProps) {
  const router = useRouter()
  const [groupName, setGroupName] = useState('')
  const [memberSearchIds, setMemberSearchIds] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  const addSearchId = () => setMemberSearchIds(prev => [...prev, ''])
  const removeSearchId = (i: number) => setMemberSearchIds(prev => prev.filter((_, idx) => idx !== i))
  const updateSearchId = (i: number, value: string) =>
    setMemberSearchIds(prev => prev.map((m, idx) => (idx === i ? value : m)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError(null)
    
    if (!groupName.trim()) {
      setNameError('グループ名を入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const validSearchIds = memberSearchIds.filter(n => n.trim() !== '')
      const group = await api.createGroup({ name: groupName, memberSearchIds: validSearchIds })
      onSuccess ? onSuccess(group.id) : router.push(`/groups/${group.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        label="グループ名"
        placeholder="例：沖縄旅行、渋谷飲み会"
        value={groupName}
        onChange={e => {
          setGroupName(e.target.value)
          if (e.target.value.trim()) setNameError(null)
        }}
        error={nameError || undefined}
        required
      />

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-300">招待するメンバーの検索ID (任意)</label>
        
        {memberSearchIds.map((id, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="例: tanaka_123"
                value={id}
                onChange={e => updateSearchId(i, e.target.value)}
              />
            </div>
            {memberSearchIds.length > 1 && (
              <button
                type="button"
                onClick={() => removeSearchId(i)}
                className="mt-2 px-3 py-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addSearchId}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          検索IDを追加
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        グループを作成
      </Button>
    </form>
  )
}
