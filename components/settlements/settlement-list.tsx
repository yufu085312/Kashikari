"use client";

import { useOptimistic, useTransition, useState } from "react";
import { Settlement } from "@/lib/domain/models/settlement";
import { formatDate } from "@/utils/format";
import { deleteSettlementAction } from "@/app/actions/settlement";
import { GlassCard } from "@/components/ui/glass-card";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface SettlementListProps {
  groupId: string;
  settlements: Settlement[];
}

export function SettlementList({ groupId, settlements }: SettlementListProps) {
  const { alert, confirm } = useAlert();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Optimistic UI (楽観的更新)
  const [optimisticSettlements, removeOptimisticSettlement] = useOptimistic(
    settlements,
    (state, idToRemove: string) => state.filter((s) => s.id !== idToRemove),
  );

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
    startTransition(async () => {
      // 一瞬でUIから消去
      removeOptimisticSettlement(id);

      const { error } = await deleteSettlementAction({
        settlementId: id,
        groupId,
      });
      if (error) {
        await alert({
          title: MESSAGES.UI.ERROR_TITLE,
          message: error,
          type: "error",
        });
      }
      setDeletingId(null);
    });
  };

  if (optimisticSettlements.length === 0) {
    return (
      <GlassCard className="py-12 flex flex-col items-center justify-center text-slate-400 border-dashed border-slate-200 shadow-none">
        <svg
          className="w-12 h-12 mb-3 opacity-30 text-emerald-500"
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
      {optimisticSettlements.map((s) => (
        <GlassCard key={s.id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-slate-800 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                  {s.from_user?.name}
                </span>
                <svg
                  className="w-4 h-4 text-slate-400 flex-shrink-0"
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
                <span className="text-sm font-bold text-slate-800 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                  {s.to_user?.name}
                </span>
              </div>
              <p className="text-xl font-black text-emerald-600 leading-none mt-1">
                {s.amount.toLocaleString()}
                <span className="text-xs ml-1 text-slate-500 font-normal">
                  {MESSAGES.UI.CURRENCY_JPY}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">
                {formatDate(s.created_at)}
              </p>
            </div>

            <button
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id || isPending}
              className="transition-all p-2 rounded-xl flex-shrink-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 active:scale-95 disabled:opacity-50"
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
