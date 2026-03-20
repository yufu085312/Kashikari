'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { GroupForm } from '@/components/groups/group-form'
import { Group } from '@/types/group'
import Link from 'next/link'
import { logout } from '@/app/login/actions'

interface HomePageClientProps {
  initialGroups: Group[]
  userName: string
  searchId: string
}

export function HomePageClient({ initialGroups, userName, searchId }: HomePageClientProps) {
  const router = useRouter()
  const [groups] = useState<Group[]>(initialGroups)
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
    <div className="space-y-8 animate-fade-in">
      {/* ユーザープロフィール */}
      <section className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Kashikari</h1>
          </div>
          <div className="space-y-0.5">
            <p className="text-sm text-gray-500 font-medium">こんにちは、<span className="text-emerald-400">{userName}</span></p>
            <button 
              onClick={handleCopyId}
              className="group flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-emerald-400 transition-colors bg-white/5 px-2 py-0.5 rounded-full border border-white/5 active:scale-95"
              title="IDをコピー"
            >
              <span className="font-mono">ID: {searchId}</span>
              {copied ? (
                <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <Button 
            onClick={() => setShowGroupForm(true)}
            size="sm"
            className="rounded-2xl w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            新しいグループ
          </Button>
          <form action={logout} className="absolute right-0 top-0 sm:relative sm:top-auto sm:right-auto">
            <button 
              type="submit"
              className="text-xs text-gray-500 hover:text-white transition-colors whitespace-nowrap py-2"
            >
              ログアウト
            </button>
          </form>
        </div>
      </section>

      {/* グループ一覧 */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">グループ一覧</h2>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length === 0 ? (
            <div className="col-span-full">
              <GlassCard className="py-12 flex flex-col items-center justify-center text-gray-500 border-dashed">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">参加しているグループがありません</p>
                <p className="text-[10px] mt-1 opacity-50">右上のボタンから作成しましょう</p>
              </GlassCard>
            </div>
          ) : (
            groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <GlassCard hoverable className="p-4 flex items-center justify-between group h-full">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                        {group.name}
                      </h3>
                      <p className="text-[10px] text-gray-600 font-medium mt-1">
                        {group.members?.length || 0}人のメンバー
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-700 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            ))
          )}
        </div>
      </section>

      <Modal
        isOpen={showGroupForm}
        onClose={() => setShowGroupForm(false)}
        title="グループを作成"
      >
        <GroupForm onSuccess={handleGroupCreated} />
      </Modal>
    </div>
  )
}
