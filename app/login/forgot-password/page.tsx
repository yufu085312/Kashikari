"use client";

export const runtime = "edge";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { sendResetPasswordEmail } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, LIMITS, MESSAGES, METADATA } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError(MESSAGES.ERROR.EMAIL_REQUIRED);
      return;
    }
    if (!LIMITS.EMAIL_PATTERN.test(email)) {
      setError(MESSAGES.ERROR.EMAIL_INVALID);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await sendResetPasswordEmail({ email });
      if (result.error) {
        setError(result.error);
      } else {
        setMessage(MESSAGES.UI.RESET_EMAIL_SENT);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden mb-6 shadow-emerald-500/10">
          <Image
            src="/icon.png"
            alt={METADATA.SHORT_NAME}
            width={64}
            height={64}
            className="w-full h-full object-cover p-2.5"
          />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-3">
          {MESSAGES.UI.RESET_PASSWORD_TITLE}
        </h1>
        <p className="text-gray-400 font-medium tracking-wide">
          {MESSAGES.UI.APP_TAGLINE}
        </p>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-up">
        {message ? (
          <div className="text-center space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-emerald-400 font-medium">{message}</p>
            </div>
            <Link
              href={ROUTES.LOGIN}
              className="inline-block text-gray-400 hover:text-white transition-colors"
            >
              {MESSAGES.UI.BACK_TO_LOGIN}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-400 text-center mb-2">
              {MESSAGES.UI.FORGOT_PASSWORD_DESC_1}
              <br />
              {MESSAGES.UI.FORGOT_PASSWORD_DESC_2}
            </p>
            <Input
              name="email"
              type="email"
              label={MESSAGES.UI.EMAIL_LABEL}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              error={error || undefined}
              disabled={isPending}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? MESSAGES.UI.SAVING : MESSAGES.UI.SEND_RESET_EMAIL}
            </Button>

            <div className="text-center pt-2">
              <Link
                href={ROUTES.LOGIN}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {MESSAGES.UI.BACK_TO_LOGIN}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
