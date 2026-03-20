'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GroupCard } from '@/components/groups/group-card'
import { GroupForm } from '@/components/groups/group-form'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Group } from '@/types/group'
import { logout } from '@/app/login/actions'

interface HomePageClientProps {
  initialGroups: Group[]
  userName: string
  searchId: string
}

export function HomePageClient({ initialGroups, userName, searchId }: HomePageClientProps) {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyId = () => {
    navigator.clipboard.writeText(searchId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGroupCreated = (groupId: string) => {
    setShowGroupForm(false)
    router.push(`/groups/${groupId}`)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💸</span>
            <h1 className="text-2xl font-extrabold text-white">Kashikari</h1>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-400">こんにちは、<span className="text-emerald-400 font-semibold">{userName}</span></p>
            <button 
              onClick={handleCopyId}
              className="flex items-center gap-1 text-[10px] text-gray-500 font-mono hover:text-emerald-400 transition-colors group mt-0.5"
              title="IDをコピー"
            >
              ID: {searchId}
              {copied ? (
                <span className="text-emerald-500 text-[9px] font-sans ml-1 animate-in fade-in zoom-in duration-300">コピーしました！</span>
              ) : (
                <svg className="w-3 h-3 text-gray-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowGroupForm(true)} size="md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しいグループ
          </Button>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm" className="bg-transparent border-white/20 text-gray-300 hover:text-white mx-2">
              ログアウト
            </Button>
          </form>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">グループ一覧</h2>

        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
              👥
            </div>
            <h3 className="text-white font-bold mb-2">グループを作成しよう</h3>
            <p className="text-sm text-gray-500 mb-6">飲み会・旅行・同棲の精算をラクに管理</p>
            <Button onClick={() => setShowGroupForm(true)}>
              最初のグループを作成
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-slide-up">
            {groups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={showGroupForm}
        onClose={() => setShowGroupForm(false)}
        title="グループを作成"
      >
        <GroupForm onSuccess={handleGroupCreated} />
      </Modal>
    </>
  )
}
