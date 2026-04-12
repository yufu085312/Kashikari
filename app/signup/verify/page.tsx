"use client";

export const runtime = "edge";

import { use, useState, useTransition, useEffect } from "react";
import { verifySignupOtp, resendSignupOtp } from "@/app/signup/actions";
import { Button } from "@/components/ui/button";
import { MESSAGES, ROUTES } from "@/lib/constants";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    next?: string;
    error?: string;
    message?: string;
  }>;
}) {
  const params = use(searchParams);
  const email = params.email || "";
  const next = params.next || ROUTES.HOME;
  const serverError = params.error;
  const serverMessage = params.message;

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isResending, startResend] = useTransition();
  const [countdown, setCountdown] = useState(45); // 再送信までのカウントダウン

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (token.length < 6) {
      setError(MESSAGES.ERROR.OTP_INVALID);
      return;
    }
    setError("");
    const formData = new FormData();
    formData.append("email", email);
    formData.append("token", token);
    formData.append("next", next);

    startTransition(() => {
      verifySignupOtp({ email, token, next });
    });
  };

  const handleResend = () => {
    setCountdown(45); // 再送信後にカウントダウンリセット
    startResend(() => {
      resendSignupOtp({ email, next });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 animate-fade-in text-slate-900">
      <div className="w-full max-w-md p-10 rounded-3xl bg-white backdrop-blur-xl border border-slate-200 shadow-xl text-center shadow-emerald-100 border-emerald-200">
        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-lg shadow-emerald-100">
          <svg
            className="w-10 h-10 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 21a11.955 11.955 0 01-9.618-7.016m19.236 0h-19.236"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-4 text-slate-900">
          {MESSAGES.UI.VERIFY_OTP_TITLE}
        </h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          <span className="text-emerald-600 font-bold">{email}</span>{" "}
          {MESSAGES.UI.VERIFY_OTP_DESC_1}
          <br />
          {MESSAGES.UI.VERIFY_OTP_DESC_2}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <input
              type="text"
              name="token"
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="00000000"
              className="w-full h-20 text-center text-4xl font-mono tracking-[0.2em] bg-white border border-slate-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none placeholder-slate-300 text-slate-800"
              autoFocus
              required
              autoComplete="one-time-code"
            />
          </div>

          {serverMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-600 animate-fade-in">
              {serverMessage}
            </div>
          )}

          {(error || serverError) && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 animate-fade-in">
              {error || serverError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold"
            disabled={isPending || token.length < 6}
          >
            {isPending ? MESSAGES.UI.AUTHENTICATING : MESSAGES.UI.AUTHENTICATE}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
          <p className="text-sm text-slate-400">
            {MESSAGES.UI.VERIFY_OTP_SPAM_CHECK}
          </p>
          <Button
            type="button"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? MESSAGES.UI.SENDING
              : countdown > 0
                ? `${MESSAGES.UI.VERIFY_OTP_COOLDOWN_PREFIX}${countdown}${MESSAGES.UI.VERIFY_OTP_COOLDOWN_SUFFIX}`
                : MESSAGES.UI.RESEND_OTP}
          </Button>
        </div>
      </div>
    </div>
  );
}
