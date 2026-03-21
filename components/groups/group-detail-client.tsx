"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Group } from "@/types/group";
import { Payment } from "@/types/payment";
import { Balance, Settlement } from "@/types/balance";
import { User } from "@/types/user";
import { BalanceList } from "@/components/balances/balance-list";
import { PaymentList } from "@/components/payments/payment-list";
import { SettlementList } from "@/components/settlements/settlement-list";
import { PaymentForm } from "@/components/payments/payment-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { useAlert } from "@/components/providers/alert-provider";
import { ROUTES, TIMEOUTS, MESSAGES } from "@/lib/constants";

interface GroupDetailClientProps {
  groupId: string;
  userId: string;
  initialGroupName: string;
  initialMembers: User[];
  initialCreatedBy?: string;
  initialPayments: Payment[];
  initialBalances: Balance[];
  initialSettlements: Settlement[];
}

export function GroupDetailClient({
  groupId,
  userId,
  initialGroupName,
  initialMembers,
  initialCreatedBy,
  initialPayments,
  initialBalances,
  initialSettlements,
}: GroupDetailClientProps) {
  const router = useRouter();
  const { alert, confirm } = useAlert();
  const [activeTab, setActiveTab] = useState<
    "balance" | "payment" | "settlement"
  >("balance");
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [balances, setBalances] = useState<Balance[]>(initialBalances);
  const [settlements, setSettlements] =
    useState<Settlement[]>(initialSettlements);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [searchIdInput, setSearchIdInput] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMemberId, setIsRemovingMemberId] = useState<string | null>(
    null,
  );
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/${groupId}/invite`
      : "";

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
  };

  const handleAddMemberBySearchId = async () => {
    if (!searchIdInput.trim()) return;
    setIsAddingMember(true);
    setAddMemberError(null);
    try {
      await api.addMember(groupId, searchIdInput.trim());
      setSearchIdInput("");
      setShowInviteModal(false);
      // リフレッシュ
      window.location.reload();
    } catch (e) {
      setAddMemberError(MESSAGES.ERROR.USER_NOT_FOUND);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (member: User) => {
    // 自分自身が作成者の場合、自分を削除することはできない
    if (member.id === initialCreatedBy) return;

    // 残高チェック
    const hasBalance = balances.some(
      (b) => b.fromUserId === member.id || b.toUserId === member.id,
    );
    if (hasBalance) {
      await alert({
        title: member.id === userId ? "退会できません" : "削除できません",
        message:
          member.id === userId
            ? MESSAGES.ERROR.MEMBER_LEAVE_SETTLEMENT_PENDING
            : MESSAGES.ERROR.MEMBER_REMOVE_SETTLEMENT_PENDING,
        type: "warn",
      });
      return;
    }

    const isConfirmed = await confirm({
      title:
        member.id === userId ? MESSAGES.UI.LEAVE_GROUP : MESSAGES.UI.REMOVE,
      message:
        member.id === userId
          ? MESSAGES.UI.CONFIRM_LEAVE_GROUP
          : MESSAGES.UI.CONFIRM_REMOVE_MEMBER,
      type: "danger",
      confirmText:
        member.id === userId ? MESSAGES.UI.LEAVE : MESSAGES.UI.REMOVE,
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    setIsRemovingMemberId(member.id);
    try {
      await api.removeMember(groupId, member.id);
      // 自分を削除した（退会した）場合はホームへ
      if (member.id === userId) {
        router.push(ROUTES.HOME);
      } else {
        window.location.reload();
      }
    } catch (e) {
      await alert({
        title: "エラー",
        message: MESSAGES.ERROR.MEMBER_REMOVE_FAILED,
        type: "error",
      });
    } finally {
      setIsRemovingMemberId(null);
    }
  };

  const refreshData = async () => {
    try {
      const [p, b, s] = await Promise.all([
        api.getPayments(groupId),
        api.getBalances(groupId),
        api.getSettlements(groupId),
      ]);
      setPayments(p as Payment[]);
      setBalances(b);
      setSettlements(s);
    } catch (e) {
      console.error("Failed to refresh data:", e);
    }
  };

  const latestSettlementAt =
    settlements.length > 0 ? settlements[0].created_at : null;

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteGroup = async () => {
    // 貸し借りチェック
    const hasBalance = balances.some((b) => b.amount > 0);
    if (hasBalance) {
      await alert({
        title: "削除できません",
        message: MESSAGES.ERROR.GROUP_DELETE_SETTLEMENT_PENDING,
        type: "warn",
      });
      return;
    }

    const isConfirmed = await confirm({
      title: MESSAGES.UI.GROUP_DELETE,
      message: MESSAGES.UI.CONFIRM_DELETE_GROUP,
      type: "danger",
      confirmText: "削除する",
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await api.deleteGroup(groupId);
      router.push(ROUTES.HOME);
    } catch (e) {
      await alert({
        title: "エラー",
        message: MESSAGES.ERROR.GROUP_DELETE_FAILED,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      {/* ページヘッダー */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center text-[10px] font-bold text-gray-500 hover:text-white transition-colors mb-4 group"
            >
              <svg
                className="w-3 h-3 mr-1 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              戻る
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white break-all tracking-tight leading-tight">
                {initialGroupName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteGroup}
              className="rounded-2xl p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 active:scale-95 transition-all flex-shrink-0"
              loading={isDeleting}
              title={MESSAGES.UI.GROUP_DELETE}
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
                  strokeWidth={2.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="rounded-2xl flex-shrink-0 whitespace-nowrap"
            >
              メンバー招待
            </Button>
          </div>
        </div>

        {/* メンバーリスト呼び出しボタン */}
        <div className="px-2 pb-1 animate-slide-up">
          <button
            onClick={() => setShowMembersModal(true)}
            className="inline-flex items-center text-xs font-bold text-gray-400 bg-white/5 py-1.5 px-3 rounded-full border border-glass-border hover:text-white hover:bg-white/10 transition-all group shadow-sm"
          >
            <svg
              className="w-4 h-4 mr-1.5 text-brand-400 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            メンバー {initialMembers.length}名
          </button>
        </div>
      </section>

      {/* タブナビゲーション */}
      <div className="flex p-1 bg-white/5 rounded-2xl border border-glass-border">
        {(["balance", "payment", "settlement"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "balance"
              ? "貸し借り"
              : tab === "payment"
                ? "履歴"
                : MESSAGES.UI.SETTLEMENT_EXECUTE.replace("の実行", "")}
          </button>
        ))}
      </div>

      {/* コンテンツエリア */}
      <div className="min-h-[400px]">
        {activeTab === "balance" && (
          <div className="space-y-6 animate-slide-up">
            <BalanceList
              balances={balances}
              groupId={groupId}
              onSettle={refreshData}
            />
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-6 animate-slide-up">
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  支払い履歴
                </h2>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
              </div>
              <PaymentList
                payments={payments}
                latestSettlementAt={latestSettlementAt}
                onDelete={refreshData}
              />
            </section>
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="space-y-6 animate-slide-up">
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  直近の精算
                </h2>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
              </div>
              <SettlementList
                settlements={settlements}
                onDelete={refreshData}
              />
            </section>
          </div>
        )}
      </div>

      {/* 固定アクションボタン */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-screen-xl px-6 z-40">
        <Button
          onClick={() => setShowPaymentModal(true)}
          size="lg"
          className="w-full rounded-2xl shadow-2xl shadow-brand-500/40 py-4 text-base"
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
          {MESSAGES.UI.PAYMENT_RECORD}
        </Button>
      </div>

      {/* メンバー招待モーダル */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={MESSAGES.UI.MEMBER_INVITE}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              検索IDで追加
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="tanaka_123"
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all"
              />
              <Button
                onClick={handleAddMemberBySearchId}
                loading={isAddingMember}
                size="sm"
                className="rounded-xl"
              >
                追加
              </Button>
            </div>
            {addMemberError && (
              <p className="text-[10px] text-red-500 font-bold">
                {addMemberError}
              </p>
            )}
          </div>

          <div className="h-px bg-white/5"></div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              招待リンクを共有
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-[10px] font-mono text-gray-400"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyInvite}
                className="rounded-xl whitespace-nowrap"
              >
                {copied ? MESSAGES.UI.COPIED : MESSAGES.UI.COPY}
              </Button>
            </div>
            <p className="text-[10px] text-gray-500">
              このリンクを開いた人は誰でもグループに参加できます。
            </p>
          </div>
        </div>
      </Modal>

      {/* メンバー一覧モーダル */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={MESSAGES.UI.MEMBER_LIST}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {initialMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {m.name}
                </p>
              </div>
              {m.id === initialCreatedBy && (
                <span className="shrink-0 ml-2 text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                  作成者
                </span>
              )}

              {/* 削除ボタン表示条件:
                  1. 自分が作成者で、対象が自分以外
                  2. 対象が自分自身で、自分が作成者ではない（退会）
              */}
              {((userId === initialCreatedBy && m.id !== initialCreatedBy) ||
                (m.id === userId && userId !== initialCreatedBy)) && (
                <button
                  onClick={() => handleRemoveMember(m)}
                  disabled={isRemovingMemberId !== null}
                  className="ml-2 p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
                  title={
                    m.id === userId ? MESSAGES.UI.LEAVE : MESSAGES.UI.REMOVE
                  }
                >
                  {isRemovingMemberId === m.id ? (
                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  ) : m.id === userId ? (
                    <span className="text-[10px] font-bold px-1.5">
                      {MESSAGES.UI.LEAVE}
                    </span>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() => setShowMembersModal(false)}
          >
            {MESSAGES.UI.CLOSE}
          </Button>
        </div>
      </Modal>

      {/* 支払い登録モーダル */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={MESSAGES.UI.PAYMENT_RECORD}
      >
        <PaymentForm
          currentUserId={userId}
          groupId={groupId}
          members={initialMembers}
          onSuccess={() => {
            setShowPaymentModal(false);
            refreshData();
          }}
        />
      </Modal>
    </div>
  );
}
