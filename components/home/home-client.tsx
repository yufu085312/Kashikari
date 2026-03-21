"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GroupForm } from "@/components/groups/group-form";
import { Group } from "@/types/group";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { AddToHomeScreenBanner } from "@/components/ui/add-to-home-screen-banner";
import { ROUTES, TIMEOUTS, MESSAGES, METADATA } from "@/lib/constants";
import Image from "next/image";
import { ProfileForm } from "./profile-form";

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
  const [copied, setCopied] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(searchId);
    setCopied(true);
    setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
  };

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
      {/* ユーザープロフィール */}
      <section className="relative flex flex-col sm:flex-row sm:items-start justify-between sm:gap-6">
        <div className="flex-1 min-w-0 pr-10 sm:pr-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 flex-shrink-0 border border-white/10 overflow-hidden">
              <Image
                src="/icon.png"
                alt={METADATA.SHORT_NAME}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {MESSAGES.UI.APP_TAGLINE}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-6 sm:mt-8">
            <button
              onClick={handleCopyId}
              className="group flex items-center justify-center min-w-[120px] gap-1.5 text-[10px] text-gray-600 hover:text-emerald-400 transition-colors bg-white/5 px-2 py-0.5 rounded-full border border-white/5 active:scale-95"
              title={MESSAGES.UI.COPY_ID}
            >
              {copied ? (
                <>
                  <span className="font-bold text-emerald-400">
                    {MESSAGES.UI.ID_COPY_SUCCESS}
                  </span>
                  <svg
                    className="w-3 h-3 text-emerald-400 animate-fade-in"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span className="font-mono">
                    {MESSAGES.UI.ID_LABEL}: {searchId}
                  </span>
                  <svg
                    className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 font-medium">
              {MESSAGES.UI.HELLO}、
              <span className="text-emerald-400">{userName}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <Button
            onClick={() => setShowGroupForm(true)}
            size="sm"
            className="hidden sm:flex rounded-2xl w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-1.5"
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

          <div className="absolute right-0 top-0 sm:relative sm:top-auto sm:right-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5 active:scale-95"
              title={MESSAGES.UI.SETTINGS_LABEL}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1 animate-fade-in origin-top-right">
                  <button
                    onClick={() => {
                      setShowProfileForm(true);
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent hover:border-emerald-400 text-left"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {MESSAGES.UI.PROFILE_EDIT_TITLE}
                  </button>
                  <Link
                    href={ROUTES.TERMS}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent hover:border-emerald-400"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {MESSAGES.UI.TERMS_LABEL}
                  </Link>
                  <Link
                    href={ROUTES.PRIVACY}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent hover:border-emerald-400"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {MESSAGES.UI.PRIVACY_POLICY_LABEL}
                  </Link>
                  <Link
                    href={ROUTES.CONTACT}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-l-2 border-transparent hover:border-emerald-400"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {MESSAGES.UI.CONTACT_LABEL}
                  </Link>
                  <div className="h-px bg-white/10 my-1 mx-2"></div>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-l-2 border-transparent hover:border-red-400"
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {MESSAGES.UI.LOGOUT_LABEL}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

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

      <Modal
        isOpen={showProfileForm}
        onClose={() => setShowProfileForm(false)}
        title={MESSAGES.UI.PROFILE_EDIT_TITLE}
      >
        <ProfileForm
          initialName={userName}
          initialSearchId={searchId}
          onSuccess={() => setShowProfileForm(false)}
        />
      </Modal>
    </div>
  );
}
