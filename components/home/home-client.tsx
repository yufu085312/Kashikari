"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GroupForm } from "@/components/groups/group-form";
import { Group } from "@/lib/domain/models/group";
import Link from "next/link";
import { AddToHomeScreenBanner } from "@/components/ui/add-to-home-screen-banner";
import { MESSAGES } from "@/lib/constants";
import { HomeHeader } from "./home-header";

interface HomePageClientProps {
  initialGroups: Group[];
  userName: string;
  searchId: string;
}

export function HomePageClient({
  initialGroups,
  userName,
  searchId,
}: HomePageClientProps) {
  const router = useRouter();
  const [groups] = useState<Group[]>(initialGroups);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const handleGroupCreated = (groupId: string) => {
    setShowGroupForm(false);
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-24 sm:pb-0">
      {/* SP版: ホーム画面追加バナー */}
      <div className="sm:hidden">
        <AddToHomeScreenBanner />
      </div>

      {/* ユーザープロフィールと設定メニュー群 */}
      <HomeHeader
        userName={userName}
        searchId={searchId}
        onNewGroup={() => setShowGroupForm(true)}
      />

      {/* グループ一覧 */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
            {MESSAGES.UI.GROUP_LIST_LABEL}
          </h2>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length === 0 ? (
            <div className="col-span-full">
              <GlassCard className="py-12 flex flex-col items-center justify-center text-gray-500 border-dashed">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">
                  {MESSAGES.UI.NO_GROUPS_MSG}
                </p>
                <p className="text-[10px] mt-1 opacity-50">
                  {MESSAGES.UI.CREATE_GROUP_PROMPT}
                </p>
              </GlassCard>
            </div>
          ) : (
            groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <GlassCard
                  hoverable
                  className="p-4 flex items-center justify-between group h-full"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight break-words">
                      {group.name}
                    </h3>
                    <p className="text-[10px] text-gray-600 font-medium mt-1">
                      {group.members?.length || 0}
                      {MESSAGES.UI.MEMBER_COUNT_SUFFIX}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-700 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </GlassCard>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 画面下部固定アクションボタン（SP専用） */}
      <div className="sm:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-full px-6 z-40">
        <div className="animate-slide-up">
          <Button
            onClick={() => setShowGroupForm(true)}
            size="lg"
            className="w-full rounded-2xl shadow-2xl shadow-emerald-500/30 overflow-hidden py-4 text-base font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 border border-white/20 active:scale-95 transition-all text-white"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {MESSAGES.UI.NEW_GROUP_LABEL}
          </Button>
        </div>
      </div>
      <Modal
        isOpen={showGroupForm}
        onClose={() => setShowGroupForm(false)}
        title={MESSAGES.UI.GROUP_CREATE}
      >
        <GroupForm onSuccess={handleGroupCreated} />
      </Modal>
    </div>
  );
}
