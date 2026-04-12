"use client";

import { useOptimistic, useTransition, useState } from "react";
import { Balance } from "@/lib/domain/models/balance";
import { Button } from "@/components/ui/button";
import { createSettlementAction } from "@/app/actions/settlement";
import { GlassCard } from "@/components/ui/glass-card";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface BalanceListProps {
  balances: Balance[];
  groupId: string;
}

export function BalanceList({ balances, groupId }: BalanceListProps) {
  const { alert, confirm } = useAlert();
  const [loading, setLoading] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic UI (楽観的更新)
  // 精算を実行した直後にローカルのBalancesリストから対象を消して完了したように見せる
  const [optimisticBalances, removeOptimisticBalance] = useOptimistic(
    balances,
    (state, keyToRemove: string) =>
      state.filter((b) => `${b.fromUserId}-${b.toUserId}` !== keyToRemove),
  );

  const handleSettle = async (balance: Balance) => {
    const key = `${balance.fromUserId}-${balance.toUserId}`;
    const isConfirmed = await confirm({
      title: MESSAGES.UI.SETTLEMENT_EXECUTE,
      message: `${balance.fromUserName}${MESSAGES.UI.BALANCE_SETTLE_CONFIRM_1}${balance.toUserName}${MESSAGES.UI.BALANCE_SETTLE_CONFIRM_2}${balance.amount.toLocaleString()}${MESSAGES.UI.BALANCE_SETTLE_CONFIRM_3}`,
      type: "info",
      confirmText: MESSAGES.UI.SETTLE,
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    setLoading(key);
    startTransition(async () => {
      // 一瞬でUI上から精算済みにする
      removeOptimisticBalance(key);

      const { error } = await createSettlementAction({
        groupId,
        fromUserId: balance.fromUserId,
        toUserId: balance.toUserId,
        amount: balance.amount,
      });

      if (error) {
        await alert({
          title: MESSAGES.UI.ERROR_TITLE,
          message: error,
          type: "error",
        });
      }
      setLoading(null);
    });
  };

  if (optimisticBalances.length === 0) {
    return (
      <GlassCard className="py-12 flex flex-col items-center justify-center text-slate-400 border-dashed border-slate-200 shadow-none">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-slate-700 font-bold">
          {MESSAGES.UI.BALANCE_ALL_SETTLED}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {MESSAGES.UI.BALANCE_NO_DEBT}
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {optimisticBalances.map((balance) => {
        const key = `${balance.fromUserId}-${balance.toUserId}`;
        return (
          <GlassCard
            key={key}
            className="p-4 border-orange-200 bg-orange-50 hover:bg-orange-100"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* 「AがBに支払う」表示 */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-slate-800 px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-sm">
                    {balance.fromUserName}
                  </span>
                  <svg
                    className="w-4 h-4 text-orange-500 opacity-50 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <span className="text-sm font-bold text-slate-800 px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-sm">
                    {balance.toUserName}
                  </span>
                </div>
                <p className="text-2xl font-black text-orange-600 leading-tight">
                  <span className="text-xs mr-1 font-medium opacity-80 text-slate-600">
                    {MESSAGES.UI.BALANCE_LABEL}
                  </span>
                  {balance.amount.toLocaleString()}
                  {MESSAGES.UI.CURRENCY_JPY}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="flex-shrink-0 from-orange-500 to-red-500 shadow-orange-500/20"
                loading={loading === key || isPending}
                onClick={() => handleSettle(balance)}
              >
                {MESSAGES.UI.SETTLE}
              </Button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
