"use client";

export const runtime = "edge";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { signup } from "@/app/signup/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, LIMITS, MESSAGES, METADATA } from "@/lib/constants";

import { SocialLoginButtons } from "@/components/ui/social-login-buttons";
import { AuthHero } from "@/components/ui/auth-hero";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = use(searchParams);
  const serverError = params.error;

  const [errors, setErrors] = useState<{
    name?: string;
    search_id?: string;
    email?: string;
    password?: string;
  }>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const search_id = formData.get("search_id") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: {
      name?: string;
      search_id?: string;
      email?: string;
      password?: string;
    } = {};

    // 必須チェック
    if (!name) newErrors.name = MESSAGES.ERROR.NAME_REQUIRED;
    if (!search_id) newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_REQUIRED;

    if (!email) {
      newErrors.email = MESSAGES.ERROR.EMAIL_REQUIRED;
    } else if (!LIMITS.EMAIL_PATTERN.test(email)) {
      newErrors.email = MESSAGES.ERROR.EMAIL_INVALID;
    }

    if (!password) newErrors.password = MESSAGES.ERROR.PASSWORD_REQUIRED;

    // フォーマット・文字数チェック
    if (name && name.length > LIMITS.MAX_NAME_LENGTH)
      newErrors.name = MESSAGES.ERROR.NAME_TOO_LONG;
    if (search_id && search_id.length > LIMITS.MAX_SEARCH_ID_LENGTH)
      newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_TOO_LONG;
    if (search_id && !LIMITS.SEARCH_ID_PATTERN.test(search_id))
      newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_INVALID;
    if (password && password.length < LIMITS.MIN_PASSWORD_LENGTH)
      newErrors.password = MESSAGES.ERROR.PASSWORD_TOO_SHORT;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    startTransition(() => {
      signup({
        name,
        search_id,
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
        <div className="flex flex-col p-6 sm:p-10 lg:py-8 lg:px-14 overflow-y-auto max-h-[90vh] lg:max-h-none">
          {/* モバイル版のみ表示するヘッダー */}
          <div className="lg:hidden flex flex-col items-center mb-6 text-center">
            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-200 overflow-hidden mb-3 shadow-emerald-100">
              <Image
                src="/icon.png"
                alt={METADATA.SHORT_NAME}
                width={64}
                height={64}
                className="w-full h-full object-cover p-2.5"
              />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
              {METADATA.SHORT_NAME}
            </p>
            <p className="text-slate-500 text-xs font-medium tracking-wide">
              {MESSAGES.UI.APP_TAGLINE}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-2">
            <h1 className="text-xl font-black text-slate-900 mb-1 lg:text-2xl lg:mb-1">
              {MESSAGES.UI.CREATE_ACCOUNT}
            </h1>
            <p className="text-slate-500 text-xs mb-6 font-medium">
              Join us to start splitting bills effortlessly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {params.next && (
                <input type="hidden" name="next" value={params.next} />
              )}
              <Input
                name="name"
                type="text"
                label={`${MESSAGES.UI.NAME_LABEL} (${LIMITS.MAX_NAME_LENGTH}${MESSAGES.UI.SIGNUP_CHARS})`}
                placeholder={MESSAGES.UI.NAME_PLACEHOLDER}
                autoComplete="name"
                required
                maxLength={LIMITS.MAX_NAME_LENGTH}
                error={errors.name}
              />
              <Input
                name="search_id"
                type="text"
                label={`${MESSAGES.UI.SEARCH_ID_LABEL} (${LIMITS.MAX_SEARCH_ID_LENGTH}${MESSAGES.UI.SIGNUP_CHARS})`}
                placeholder={MESSAGES.UI.SEARCH_ID_EXAMPLE}
                autoComplete="username"
                required
                maxLength={LIMITS.MAX_SEARCH_ID_LENGTH}
                error={errors.search_id}
              />
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
                label={`${MESSAGES.UI.PASSWORD_LABEL} (${LIMITS.MIN_PASSWORD_LENGTH}${MESSAGES.UI.SIGNUP_CHARS}以上)`}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={LIMITS.MIN_PASSWORD_LENGTH}
                error={errors.password}
              />

              {serverError && (
                <p className="text-red-500 text-xs mt-1">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full py-4 rounded-xl shadow-xl shadow-emerald-500/10 text-base mt-1"
                size="lg"
                disabled={isPending}
              >
                {isPending ? MESSAGES.UI.SIGNING_UP : MESSAGES.UI.SIGNUP}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-4 text-slate-400 font-bold tracking-widest leading-none">
                    OR
                  </span>
                </div>
              </div>
              <SocialLoginButtons next={params.next} isSignUp={true} />
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm">
              <p className="text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  href={`${ROUTES.LOGIN}${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
                  className="text-emerald-600 font-bold hover:underline underline-offset-4"
                >
                  {MESSAGES.UI.LOGIN}
                </Link>
              </p>
              <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold py-3 border-t border-slate-50 w-full justify-center">
                <Link
                  href={ROUTES.TERMS}
                  className="hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  {MESSAGES.UI.TERMS_LABEL}
                </Link>
                <Link
                  href={ROUTES.PRIVACY}
                  className="hover:text-slate-800 transition-colors uppercase tracking-widest"
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
