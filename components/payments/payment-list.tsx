"use client";

import { useState } from "react";
import { Payment } from "@/types/payment";
import { formatDate } from "@/utils/format";
import { api } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/glass-card";
import { useAlert } from "@/components/providers/alert-provider";
import { MESSAGES } from "@/lib/constants";

interface PaymentListProps {
  payments: Payment[];
  latestSettlementAt?: string | null;
  onDelete?: () => void;
}

export function PaymentList({
  payments,
  latestSettlementAt,
  onDelete,
}: PaymentListProps) {
  const { alert, confirm } = useAlert();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLocked = (createdAt: string | undefined) => {
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
      title: MESSAGES.UI.GROUP_DELETE,
      message: MESSAGES.UI.CONFIRM_DELETE_PAYMENT,
      type: "danger",
      confirmText: MESSAGES.UI.DELETE_LABEL,
      cancelText: MESSAGES.UI.CANCEL_LABEL,
    });

    if (!isConfirmed) return;
    setDeletingId(paymentId);
    try {
      await api.deletePayment(paymentId);
      onDelete?.();
    } catch (e) {
      await alert({
        title: MESSAGES.UI.ERROR_TITLE,
        message: MESSAGES.ERROR.DELETE_FAILED,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (payments.length === 0) {
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm font-medium">{MESSAGES.UI.PAYMENT_EMPTY}</p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((payment) => (
        <GlassCard key={payment.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/5 rounded-md border border-glass-border">
                  {payment.payer?.name}
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-tight">
                  が支払い
                </span>
              </div>
              <p className="text-xl font-black text-white leading-none mt-1">
                {payment.amount.toLocaleString()}
                <span className="text-xs ml-1 text-gray-400 font-normal">
                  円
                </span>
              </p>

              {/* 参加メンバー内訳 */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {payment.participants?.map((p) => (
                  <div
                    key={p.user_id}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 bg-white/[0.03] border border-glass-border rounded-lg text-gray-400"
                  >
                    <span className="font-bold text-gray-300">
                      {p.user?.name}
                    </span>
                    <span className="opacity-40">
                      ¥{p.share_amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {payment.memo && (
                <p className="text-xs text-gray-400 mt-2 bg-white/5 px-2 py-1 rounded-lg border border-glass-border inline-block">
                  {payment.memo}
                </p>
              )}
              <p className="text-[10px] text-gray-500 mt-3 font-medium opacity-50">
                {payment.created_at ? formatDate(payment.created_at) : ""}
              </p>
            </div>

            <button
              onClick={() => handleDelete(payment.id)}
              disabled={
                deletingId === payment.id || isLocked(payment.created_at)
              }
              className={`transition-all p-2 rounded-xl flex-shrink-0 ${
                isLocked(payment.created_at)
                  ? "text-gray-800 cursor-not-allowed opacity-20"
                  : "text-gray-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95"
              }`}
              title={
                isLocked(payment.created_at)
                  ? MESSAGES.ERROR.PAYMENT_LOCKED_DELETE_SHORT
                  : "支払いを削除"
              }
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
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
