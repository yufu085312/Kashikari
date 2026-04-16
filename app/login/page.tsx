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
import { AuthHero } from "@/components/ui/auth-hero";

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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-5xl bg-white lg:rounded-[3rem] lg:shadow-2xl lg:border lg:border-slate-200 overflow-hidden lg:grid lg:grid-cols-2 animate-slide-up">
        {/* PC版 左側: ブランドビジュアル */}
        <AuthHero />

        {/* 右側: フォームエリア */}
        <div className="flex flex-col p-6 sm:p-12 lg:py-10 lg:px-14">
          {/* モバイル版のみ表示するヘッダー */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl border border-slate-200 overflow-hidden mb-6 shadow-emerald-100">
              <Image
                src="/icon.png"
                alt={METADATA.SHORT_NAME}
                width={80}
                height={80}
                className="w-full h-full object-cover p-3"
              />
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter mb-3">
              {METADATA.SHORT_NAME}
            </p>
            <p className="text-slate-500 font-medium tracking-wide">
              {MESSAGES.UI.APP_TAGLINE}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h1 className="text-2xl font-black text-slate-900 mb-1 lg:text-2xl lg:mb-2 lg:tracking-tight">
              {MESSAGES.UI.LOGIN}
            </h1>
            <p className="text-slate-500 text-xs mb-8 font-medium">
              Welcome back! Please enter your details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

              <div className="flex justify-end -mt-2">
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-[10px] text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {MESSAGES.UI.FORGOT_PASSWORD_PROMPT}
                </Link>
              </div>

              {serverMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-600 mb-4 animate-fade-in">
                  {serverMessage}
                </div>
              )}

              {serverError && (
                <p className="text-red-500 text-xs mt-1">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full py-4 rounded-xl shadow-xl shadow-emerald-500/10 text-base"
                size="lg"
                disabled={isPending}
              >
                {isPending ? MESSAGES.UI.LOGGING_IN : MESSAGES.UI.LOGIN}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest leading-none">
                    OR
                  </span>
                </div>
              </div>
              <SocialLoginButtons next={params.next} />
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 text-sm">
              <p className="text-slate-500 font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href={`${ROUTES.SIGNUP}${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
                  className="text-emerald-600 font-bold hover:underline underline-offset-4"
                >
                  {MESSAGES.UI.SIGNUP}
                </Link>
              </p>
              <div className="flex items-center gap-6 text-[10px] text-slate-400 font-medium pt-3 border-t border-slate-50 w-full justify-center">
                <Link
                  href={ROUTES.TERMS}
                  className="hover:text-slate-800 transition-colors"
                >
                  {MESSAGES.UI.TERMS_LABEL}
                </Link>
                <Link
                  href={ROUTES.PRIVACY}
                  className="hover:text-slate-800 transition-colors"
                >
                  {MESSAGES.UI.PRIVACY_POLICY_LABEL}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
