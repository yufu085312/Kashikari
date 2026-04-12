"use client";

export const runtime = "edge";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, LIMITS, MESSAGES, METADATA } from "@/lib/constants";

import { SocialLoginButtons } from "@/components/ui/social-login-buttons";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = use(searchParams);
  const serverError = params.error;
  const serverMessage = params.message;

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = MESSAGES.ERROR.EMAIL_REQUIRED;
    } else if (!LIMITS.EMAIL_PATTERN.test(email)) {
      newErrors.email = MESSAGES.ERROR.EMAIL_INVALID;
    }

    if (!password) newErrors.password = MESSAGES.ERROR.PASSWORD_REQUIRED;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    startTransition(() => {
      login({
        email,
        password,
        next: params.next,
      });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl border border-slate-200 overflow-hidden mb-6 shadow-emerald-100">
          <Image
            src="/icon.png"
            alt={METADATA.SHORT_NAME}
            width={80}
            height={80}
            className="w-full h-full object-cover p-3"
          />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">
          {METADATA.SHORT_NAME}
        </h1>
        <p className="text-slate-500 font-medium tracking-wide">
          {MESSAGES.UI.APP_TAGLINE}
        </p>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white backdrop-blur-xl border border-slate-200 shadow-xl animate-slide-up">
        <h2 className="text-xl font-bold text-slate-800 mb-8 text-center">
          {MESSAGES.UI.LOGIN}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {params.next && (
            <input type="hidden" name="next" value={params.next} />
          )}
          <Input
            name="email"
            type="email"
            label={MESSAGES.UI.EMAIL_LABEL}
            placeholder="you@example.com"
            autoComplete="email"
            required
            error={errors.email}
          />
          <Input
            name="password"
            type="password"
            label={MESSAGES.UI.PASSWORD_LABEL}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={errors.password}
          />

          <div className="flex justify-end -mt-3">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-slate-500 hover:text-emerald-600 transition-colors"
            >
              {MESSAGES.UI.FORGOT_PASSWORD_PROMPT}
            </Link>
          </div>

          {serverMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-600 mb-6 animate-fade-in">
              {serverMessage}
            </div>
          )}

          {serverError && (
            <p className="text-red-500 text-sm mt-2">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? MESSAGES.UI.LOGGING_IN : MESSAGES.UI.LOGIN}
          </Button>
        </form>

        <div className="mt-8">
          <SocialLoginButtons next={params.next} />
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 text-sm text-slate-500">
          <Link
            href={`${ROUTES.SIGNUP}${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
            className="hover:text-emerald-600 transition-colors"
          >
            {MESSAGES.UI.NO_ACCOUNT_PROMPT}
          </Link>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <Link
              href={ROUTES.TERMS}
              className="hover:text-gray-300 transition-colors"
            >
              {MESSAGES.UI.TERMS_LABEL}
            </Link>
            <Link
              href={ROUTES.PRIVACY}
              className="hover:text-gray-300 transition-colors"
            >
              {MESSAGES.UI.PRIVACY_POLICY_LABEL}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
