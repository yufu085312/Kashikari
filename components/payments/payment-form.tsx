"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { User } from "@/lib/domain/models/user";
import { Button } from "@/components/ui/button";
import { calcEvenSplit } from "@/utils/format";
import { MESSAGES } from "@/lib/constants";
import { createPaymentAction } from "@/app/actions/payment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPaymentSchema,
  CreatePaymentSchemaInput,
} from "@/lib/schemas/payment";

interface PaymentFormProps {
  groupId: string;
  members: User[];
  currentUserId: string;
  onSuccess?: () => void;
}

export function PaymentForm({
  groupId,
  members,
  currentUserId,
  onSuccess,
}: PaymentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePaymentSchemaInput>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      groupId,
      payerId: currentUserId,
      amount: "" as unknown as number,
      participants: [],
      memo: "",
    },
  });

  // UI用の状態（動的計算が伴うためRHFと併用）
  const [selectedIds, setSelectedIds] = useState<string[]>(
    members.map((m) => m.id),
  );
  const [isManual, setIsManual] = useState(false);
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>(
    {},
  );

  const amountInput = watch("amount");
  const amount = Number(amountInput) || 0;
  const payerId = watch("payerId");

  // 均等割り自動計算（メモ化して参照を安定させる）
  const autoSplitAmounts = useMemo(
    () => calcEvenSplit(amount, selectedIds),
    [amount, selectedIds],
  );

  // 手動入力の合計計算（メモ化）
  const manualTotal = useMemo(
    () =>
      Object.values(manualAmounts).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
      ),
    [manualAmounts],
  );

  const isTotalMatching = useMemo(
    () => !isManual || manualTotal === amount,
    [isManual, manualTotal, amount],
  );

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      if (!next.includes(userId)) {
        const newManual = { ...manualAmounts };
        delete newManual[userId];
        setManualAmounts(newManual);
      }
      return next;
    });
  };

  const handleManualAmountChange = (userId: string, value: string) => {
    setManualAmounts((prev) => ({ ...prev, [userId]: value }));
  };

  // 参加者情報を React Hook Form の内部状態に同期
  useEffect(() => {
    const participants = isManual
      ? selectedIds.map((id) => ({
          userId: id,
          share: Number(manualAmounts[id]) || 0,
        }))
      : autoSplitAmounts.map((s) => ({ userId: s.userId, share: s.share }));

    setValue("participants", participants, { shouldValidate: true });
  }, [
    selectedIds,
    manualAmounts,
    isManual,
    amount,
    autoSplitAmounts,
    setValue,
  ]);

  const onSubmit = (data: CreatePaymentSchemaInput) => {
    setServerError(null);

    if (selectedIds.length === 0) return;
    if (isManual && !isTotalMatching) {
      setServerError(
        `${MESSAGES.UI.PAYMENT_AMOUNT_MISMATCH_ERROR}${manualTotal.toLocaleString()}）`,
      );
      return;
    }

    // Participants の構築
    const participants = isManual
      ? selectedIds.map((id) => ({
          userId: id,
          share: Number(manualAmounts[id]) || 0,
        }))
      : autoSplitAmounts.map((s) => ({ userId: s.userId, share: s.share }));

    startTransition(async () => {
      const payload = {
        ...data,
        participants,
      };

      const { error } = await createPaymentAction(payload);

      if (error) {
        setServerError(error);
        return;
      }

      // 成功時リセット
      reset();
      setManualAmounts({});
      setSelectedIds(members.map((m) => m.id));
      onSuccess?.();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* 金額 */}
      <div className="flex flex-col gap-1.5 animate-slide-up">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {MESSAGES.UI.PAYMENT_LABEL_AMOUNT}
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-2xl font-black group-focus-within:scale-110 transition-transform">
            ¥
          </span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            {...register("amount", { valueAsNumber: true })}
            className={`w-full bg-white/5 border-2 rounded-2xl pl-10 pr-4 py-4 text-white text-3xl font-black placeholder-gray-800 focus:outline-none transition-all shadow-inner ${
              errors.amount
                ? "border-red-500/50 focus:border-red-500/50 focus:bg-red-500/5"
                : "border-white/5 focus:border-emerald-500/50 focus:bg-emerald-500/5"
            }`}
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 text-xs font-bold px-1 animate-fade-in">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* 支払者 */}
      <div
        className="flex flex-col gap-3 animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {MESSAGES.UI.PAYMENT_WHO_PAID}
        </label>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setValue("payerId", member.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                payerId === member.id
                  ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5"
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* 分割設定 */}
      <div
        className="flex flex-col gap-4 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {MESSAGES.UI.PAYMENT_WHO_BORROWS}
          </label>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setIsManual(false)}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                !isManual ? "bg-white/10 text-white shadow-sm" : "text-gray-600"
              }`}
            >
              {MESSAGES.UI.PAYMENT_SPLIT_AUTO}
            </button>
            <button
              type="button"
              onClick={() => setIsManual(true)}
              className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                isManual ? "bg-white/10 text-white shadow-sm" : "text-gray-600"
              }`}
            >
              {MESSAGES.UI.PAYMENT_SPLIT_MANUAL}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {members.map((member) => {
            const isSelected = selectedIds.includes(member.id);
            const autoShare =
              autoSplitAmounts.find((s) => s.userId === member.id)?.share || 0;

            return (
              <div
                key={member.id}
                className={`flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-white/5 border-emerald-500/20"
                    : "bg-transparent border-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className="flex items-center gap-3 group"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-700 group-hover:border-gray-500"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={4}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`font-bold transition-colors ${isSelected ? "text-white" : "text-gray-600"}`}
                    >
                      {member.name}
                    </span>
                  </button>

                  {!isManual && isSelected && amount > 0 && (
                    <span className="text-emerald-400 font-black tabular-nums">
                      ¥{autoShare.toLocaleString()}
                    </span>
                  )}
                </div>

                {isManual && isSelected && (
                  <div className="relative animate-scale-in">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      ¥
                    </span>
                    <input
                      type="number"
                      placeholder={MESSAGES.UI.PAYMENT_ENTER_AMOUNT}
                      value={manualAmounts[member.id] || ""}
                      onChange={(e) =>
                        handleManualAmountChange(member.id, e.target.value)
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.participants && (
          <p className="text-red-500 text-xs font-bold px-1 animate-fade-in">
            {errors.participants.message}
          </p>
        )}

        {isManual && amount > 0 && (
          <div
            className={`flex items-center justify-between p-3 rounded-xl border-dashed border-2 ${
              isTotalMatching
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              {MESSAGES.UI.PAYMENT_MANUAL_TOTAL}
              {manualTotal.toLocaleString()}
            </span>
            <span
              className={`text-[10px] font-bold uppercase ${isTotalMatching ? "text-emerald-500" : "text-red-500"}`}
            >
              {isTotalMatching
                ? MESSAGES.UI.PAYMENT_AMOUNT_MATCH
                : `${MESSAGES.UI.PAYMENT_AMOUNT_SHORT}${(amount - manualTotal).toLocaleString()}`}
            </span>
          </div>
        )}
      </div>

      {/* メモ */}
      <div
        className="flex flex-col gap-1.5 animate-slide-up"
        style={{ animationDelay: "0.3s" }}
      >
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {MESSAGES.UI.PAYMENT_MEMO_LABEL}
        </label>
        <input
          placeholder={MESSAGES.UI.PAYMENT_MEMO_PLACEHOLDER}
          {...register("memo")}
          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-medium placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all outline-none"
        />
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-xs font-bold text-red-400 animate-shake">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={isPending}
        className="w-full py-6 rounded-2xl text-lg font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all"
        disabled={isManual && !isTotalMatching}
      >
        {MESSAGES.UI.PAYMENT_ADD}
      </Button>
    </form>
  );
}
