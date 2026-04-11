"use client";

import { useState } from "react";
import { Settlement } from "@/types/balance";
import { formatCurrency, formatDate } from "@/utils/format";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface SettlementListProps {
  settlements: Settlement[];
  onDelete?: () => void;
}

export function SettlementList({ settlements, onDelete }: SettlementListProps) {
  const { alert, confirm } = useAlert();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: MESSAGES.UI.SETTLEMENT_CANCEL,
      message: MESSAGES.UI.CONFIRM_CANCEL_SETTLEMENT,
      type: "warn",
      confirmText: MESSAGES.UI.CANCEL_ACTION,
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    setDeletingId(id);
    try {
      await api.deleteSettlement(id);
      onDelete?.();
    } catch (e) {
      await alert({
        title: MESSAGES.UI.ERROR_TITLE,
        message: MESSAGES.ERROR.CANCEL_FAILED,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (settlements.length === 0) {
    return (
      <GlassCard className="py-12 flex flex-col items-center justify-center text-gray-500 border-dashed">
        <svg
          className="w-12 h-12 mb-3 opacity-20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium">
          {MESSAGES.UI.SETTLEMENT_EMPTY_HISTORY}
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {settlements.map((s) => (
        <GlassCard key={s.id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/5 rounded-md border border-glass-border">
                  {s.from_user?.name}
                </span>
                <svg
                  className="w-4 h-4 text-gray-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/5 rounded-md border border-glass-border">
                  {s.to_user?.name}
                </span>
              </div>
              <p className="text-xl font-black text-brand-500 leading-none mt-1">
                {s.amount.toLocaleString()}
                <span className="text-xs ml-1 text-gray-400 font-normal">
                  {MESSAGES.UI.CURRENCY_JPY}
                </span>
              </p>
              <p className="text-[10px] text-gray-500 mt-3 font-medium opacity-50">
                {formatDate(s.created_at)}
              </p>
            </div>

            <button
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
              className="transition-all p-2 rounded-xl flex-shrink-0 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 active:scale-95"
              title={MESSAGES.UI.SETTLEMENT_CANCEL}
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
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
