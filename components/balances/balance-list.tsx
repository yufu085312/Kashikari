"use client";

import { useState } from "react";
import { Balance } from "@/types/balance";
import { formatCurrency } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface BalanceListProps {
  balances: Balance[];
  groupId: string;
  onSettle?: () => void;
}

export function BalanceList({ balances, groupId, onSettle }: BalanceListProps) {
  const { alert, confirm } = useAlert();
  const [loading, setLoading] = useState<string | null>(null);

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
    try {
      await api.createSettlement({
        groupId,
        fromUserId: balance.fromUserId,
        toUserId: balance.toUserId,
        amount: balance.amount,
      });
      onSettle?.();
    } catch (e) {
      await alert({
        title: MESSAGES.UI.ERROR_TITLE,
        message: MESSAGES.ERROR.SETTLEMENT_FAILED,
        type: "error",
      });
    } finally {
      setLoading(null);
    }
  };

  if (balances.length === 0) {
    return (
      <GlassCard className="py-12 flex flex-col items-center justify-center text-gray-500 border-dashed">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
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
        <p className="text-white font-bold">
          {MESSAGES.UI.BALANCE_ALL_SETTLED}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {MESSAGES.UI.BALANCE_NO_DEBT}
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {balances.map((balance) => {
        const key = `${balance.fromUserId}-${balance.toUserId}`;
        return (
          <GlassCard
            key={key}
            className="p-4 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* 「AがBに支払う」表示 */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/5 rounded-md border border-glass-border">
                    {balance.fromUserName}
                  </span>
                  <svg
                    className="w-4 h-4 text-orange-400 opacity-50 flex-shrink-0"
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
                  <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/5 rounded-md border border-glass-border">
                    {balance.toUserName}
                  </span>
                </div>
                <p className="text-2xl font-black text-orange-400 leading-tight">
                  <span className="text-xs mr-1 font-medium opacity-60 text-white">
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
                loading={loading === key}
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
