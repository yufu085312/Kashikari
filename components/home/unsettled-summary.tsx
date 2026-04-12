"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { MESSAGES } from "@/lib/constants";
import type { UnsettledBalance } from "@/lib/usecases/getUnsettledBalances";

interface UnsettledSummaryProps {
  balances: UnsettledBalance[];
  currentUserId: string;
}

export function UnsettledSummary({
  balances,
  currentUserId,
}: UnsettledSummaryProps) {
  if (balances.length === 0) {
    return (
      <section className="animate-fade-in">
        <GlassCard className="py-12 flex flex-col items-center justify-center text-slate-400 border-dashed border-slate-200 shadow-none">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-emerald-500"
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
      </section>
    );
  }

  // 合計計算
  let totalPay = 0;
  let totalReceive = 0;
  for (const b of balances) {
    if (b.fromUserId === currentUserId) {
      totalPay += b.amount;
    } else {
      totalReceive += b.amount;
    }
  }

  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            {MESSAGES.UI.UNSETTLED_TITLE}
          </h2>
        </div>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* 合計 */}
      {(totalPay > 0 || totalReceive > 0) && (
        <div className="mb-6 flex justify-center gap-3 px-1">
          {totalPay > 0 && (
            <GlassCard className="flex-1 max-w-[200px] p-3 sm:p-4 text-center border-orange-200 bg-orange-50/80">
              <p className="text-[10px] sm:text-xs font-bold text-orange-600/80 mb-1.5 uppercase tracking-widest">
                {MESSAGES.UI.UNSETTLED_TOTAL_PAY}
              </p>
              <p className="text-xl sm:text-2xl font-black text-orange-600">
                {totalPay.toLocaleString()}
                <span className="text-xs sm:text-sm font-medium ml-1">
                  {MESSAGES.UI.CURRENCY_JPY}
                </span>
              </p>
            </GlassCard>
          )}
          {totalReceive > 0 && (
            <GlassCard className="flex-1 max-w-[200px] p-3 sm:p-4 text-center border-emerald-200 bg-emerald-50/80">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-600/80 mb-1.5 uppercase tracking-widest">
                {MESSAGES.UI.UNSETTLED_TOTAL_RECEIVE}
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">
                {totalReceive.toLocaleString()}
                <span className="text-xs sm:text-sm font-medium ml-1">
                  {MESSAGES.UI.CURRENCY_JPY}
                </span>
              </p>
            </GlassCard>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {[...balances]
          .sort((a, b) => {
            const aIsPay = a.fromUserId === currentUserId ? 1 : 0;
            const bIsPay = b.fromUserId === currentUserId ? 1 : 0;
            // 支払い(aIsPay=1)が受取り(0)より上（先）になるように降順でソート
            return bIsPay - aIsPay;
          })
          .map((balance) => {
            const isPayee = balance.fromUserId === currentUserId;
            const key = `${balance.groupId}-${balance.fromUserId}-${balance.toUserId}`;

            return (
              <Link key={key} href={`/groups/${balance.groupId}`}>
                <GlassCard
                  hoverable
                  className={`p-4 transition-all ${
                    isPayee
                      ? "border-orange-200 bg-orange-50/50 hover:bg-orange-50"
                      : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* グループ名 */}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {balance.groupName}
                      </p>
                      {/* 誰→誰 */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-sm font-bold px-2 py-0.5 rounded-md border shadow-sm ${
                            isPayee
                              ? "text-orange-700 bg-orange-100 border-orange-200"
                              : "text-slate-700 bg-white border-slate-200"
                          }`}
                        >
                          {isPayee
                            ? MESSAGES.UI.UNSETTLED_YOU_PAY
                            : balance.fromUserName}
                        </span>
                        <svg
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isPayee ? "text-orange-400" : "text-emerald-400"
                          }`}
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
                        <span
                          className={`text-sm font-bold px-2 py-0.5 rounded-md border shadow-sm ${
                            !isPayee
                              ? "text-emerald-700 bg-emerald-100 border-emerald-200"
                              : "text-slate-700 bg-white border-slate-200"
                          }`}
                        >
                          {!isPayee
                            ? MESSAGES.UI.UNSETTLED_YOU_PAY
                            : balance.toUserName}
                        </span>
                      </div>
                    </div>
                    {/* 金額 */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-xl font-black leading-tight ${
                          isPayee ? "text-orange-600" : "text-emerald-600"
                        }`}
                      >
                        {balance.amount.toLocaleString()}
                        <span className="text-xs font-medium ml-0.5">
                          {MESSAGES.UI.CURRENCY_JPY}
                        </span>
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
      </div>
    </section>
  );
}
