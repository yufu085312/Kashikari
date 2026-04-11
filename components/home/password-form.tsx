"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MESSAGES, LIMITS } from "@/lib/constants";
import { updatePassword } from "@/app/settings/actions";

interface PasswordFormProps {
  onSuccess: () => void;
}

export function PasswordForm({ onSuccess }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirm_password?: string;
  }>({});
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});

    // クライアントサイドバリデーション
    const newErrors: { password?: string; confirm_password?: string } = {};
    if (!password) newErrors.password = MESSAGES.ERROR.PASSWORD_REQUIRED;
    if (password.length < LIMITS.MIN_PASSWORD_LENGTH)
      newErrors.password = MESSAGES.ERROR.PASSWORD_TOO_SHORT;

    if (password !== confirmPassword) {
      newErrors.confirm_password = MESSAGES.ERROR.PASSWORD_MISMATCH;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: MESSAGES.UI.PASSWORD_UPDATE_SUCCESS,
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <Input
        label={MESSAGES.UI.NEW_PASSWORD_LABEL}
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.password}
        disabled={isPending}
        autoComplete="new-password"
      />

      <Input
        label={MESSAGES.UI.CONFIRM_PASSWORD_LABEL}
        type="password"
        name="confirm_password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.confirm_password}
        disabled={isPending}
        autoComplete="new-password"
      />

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm border animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? MESSAGES.UI.SAVING : MESSAGES.UI.SAVE}
        </Button>
      </div>
    </form>
  );
}
