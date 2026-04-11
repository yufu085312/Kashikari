"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Payment } from "@/types/payment";
import { Balance, Settlement } from "@/types/balance";
import { User } from "@/types/user";
import { BalanceList } from "@/components/balances/balance-list";
import { PaymentForm } from "@/components/payments/payment-form";
import { PaymentList } from "@/components/payments/payment-list";
import { SettlementList } from "@/components/settlements/settlement-list";
import { InviteModal } from "./invite-modal";
import { MembersModal } from "./members-modal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { deleteGroupAction } from "@/app/actions/group";
import { useAlert } from "@/components/providers/alert-provider";
import { ROUTES, MESSAGES } from "@/lib/constants";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/${groupId}/invite`
      : "";

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
  };

  const handleRemoveSuccess = (removedMemberId: string) => {
    if (removedMemberId === userId) {
      router.push(ROUTES.HOME);
    }
  };

  const latestSettlementAt =
    initialSettlements.length > 0 ? initialSettlements[0].created_at : null;

  const handleDeleteGroup = async () => {
    const hasBalance = initialBalances.some((b) => b.amount > 0);
    if (hasBalance) {
      await alert({
        title: MESSAGES.UI.DELETE_NOT_REMOVABLE,
        message: MESSAGES.ERROR.GROUP_DELETE_SETTLEMENT_PENDING,
        type: "warn",
      });
      return;
    }

    const isConfirmed = await confirm({
      title: MESSAGES.UI.GROUP_DELETE,
      message: MESSAGES.UI.CONFIRM_DELETE_GROUP,
      type: "danger",
      confirmText: MESSAGES.UI.DELETE_EXECUTE,
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    startDeleteTransition(async () => {
      try {
        await deleteGroupAction(groupId);
        router.push(ROUTES.HOME);
      } catch {
        await alert({
          title: MESSAGES.UI.ERROR_TITLE,
          message: MESSAGES.ERROR.GROUP_DELETE_FAILED,
          type: "error",
        });
      }
    });
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
              {MESSAGES.UI.BACK}
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
              {MESSAGES.UI.MEMBER_INVITE_LABEL}
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
            {MESSAGES.UI.MEMBER_LIST} {initialMembers.length}
            {MESSAGES.UI.MEMBER_COUNT_UNIT}
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
              ? MESSAGES.UI.TAB_BALANCES
              : tab === "payment"
                ? MESSAGES.UI.TAB_HISTORY
                : MESSAGES.UI.SETTLEMENT_EXECUTE.replace("の実行", "")}
          </button>
        ))}
      </div>

      {/* コンテンツエリア */}
      <div className="min-h-[400px]">
        {activeTab === "balance" && (
          <div className="space-y-6 animate-slide-up">
            <BalanceList balances={initialBalances} groupId={groupId} />
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-6 animate-slide-up">
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  {MESSAGES.UI.HISTORY_PAYMENTS}
                </h2>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
              </div>
              <PaymentList
                groupId={groupId}
                payments={initialPayments}
                latestSettlementAt={latestSettlementAt}
              />
            </section>
          </div>
        )}

        {activeTab === "settlement" && (
          <div className="space-y-6 animate-slide-up">
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  {MESSAGES.UI.HISTORY_SETTLEMENTS}
                </h2>
                <div className="h-px flex-1 bg-white/5 ml-4"></div>
              </div>
              <SettlementList
                groupId={groupId}
                settlements={initialSettlements}
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
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={groupId}
        inviteUrl={inviteUrl}
        onSuccess={handleInviteSuccess}
      />

      {/* メンバー一覧モーダル */}
      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        groupId={groupId}
        userId={userId}
        members={initialMembers}
        createdBy={initialCreatedBy}
        balances={initialBalances}
        onRemoveSuccess={handleRemoveSuccess}
      />

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
          }}
        />
      </Modal>
    </div>
  );
}
