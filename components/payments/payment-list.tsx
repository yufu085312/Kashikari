"use client";

import { useOptimistic, useTransition, useState } from "react";
import { Payment } from "@/lib/domain/models/payment";
import { formatDate } from "@/utils/format";
import { deletePaymentAction } from "@/app/actions/payment";
import { GlassCard } from "@/components/ui/glass-card";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface PaymentListProps {
  groupId: string;
  payments: Payment[];
  latestSettlementAt?: string | null;
}

export function PaymentList({
  groupId,
  payments,
  latestSettlementAt,
}: PaymentListProps) {
  const { alert, confirm } = useAlert();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Optimistic UI (楽観的更新)
  const [optimisticPayments, removeOptimisticPayment] = useOptimistic(
    payments,
    (state, idToRemove: string) => state.filter((p) => p.id !== idToRemove),
  );

  const isLocked = (createdAt: string | undefined | null) => {
    if (!latestSettlementAt || !createdAt) return false;
    return new Date(createdAt) <= new Date(latestSettlementAt);
  };

  const handleDelete = async (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (payment && isLocked(payment.created_at)) {
      await alert({
        title: MESSAGES.UI.DELETE_NOT_REMOVABLE,
        message: MESSAGES.ERROR.PAYMENT_LOCKED_DELETE,
        type: "warn",
      });
      return;
    }

    const isConfirmed = await confirm({
      title: MESSAGES.UI.PAYMENT_DELETE_ACTION,
      message: MESSAGES.UI.CONFIRM_DELETE_PAYMENT,
      type: "danger",
      confirmText: MESSAGES.UI.DELETE_EXECUTE,
      cancelText: MESSAGES.UI.BACK,
    });

    if (!isConfirmed) return;

    setDeletingId(paymentId);
    startTransition(async () => {
      // 一瞬でUIから消す
      removeOptimisticPayment(paymentId);

      const { error } = await deletePaymentAction({ paymentId, groupId });
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

  if (optimisticPayments.length === 0) {
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm font-medium">{MESSAGES.UI.PAYMENT_EMPTY}</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {optimisticPayments.map((payment) => (
        <GlassCard key={payment.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-slate-800 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                  {payment.payer?.name || MESSAGES.UI.DELETED_USER}
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                  {MESSAGES.UI.PAYMENT_PAID_BY_SUFFIX}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 leading-none mt-1">
                {payment.amount.toLocaleString()}
                <span className="text-xs ml-1 text-slate-500 font-normal">
                  {MESSAGES.UI.CURRENCY_JPY}
                </span>
              </p>

              {/* 参加メンバー内訳 */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {payment.participants?.map((p, index) => (
                  <div
                    key={p.id || index}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm"
                  >
                    <span className="font-bold text-slate-700">
                      {p.user?.name || MESSAGES.UI.DELETED_USER}
                    </span>
                    <span className="opacity-60">
                      ¥{p.share_amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {payment.memo && (
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 inline-block">
                  {payment.memo}
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-3 font-medium">
                {payment.created_at ? formatDate(payment.created_at) : ""}
              </p>
            </div>

            <button
              onClick={() => handleDelete(payment.id)}
              disabled={
                deletingId === payment.id ||
                isPending ||
                isLocked(payment.created_at)
              }
              className={`transition-all p-2 rounded-xl flex-shrink-0 ${
                isLocked(payment.created_at)
                  ? "text-slate-300 cursor-not-allowed relative"
                  : "text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-95"
              }`}
              title={
                isLocked(payment.created_at)
                  ? MESSAGES.ERROR.PAYMENT_LOCKED_DELETE_SHORT
                  : MESSAGES.UI.PAYMENT_DELETE_ACTION
              }
            >
              <svg
                className="w-5 h-5 relative"
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
                {isLocked(payment.created_at) && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M4 4l16 16"
                  />
                )}
              </svg>
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
