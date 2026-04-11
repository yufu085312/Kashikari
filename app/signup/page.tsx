"use client";

export const runtime = "edge";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { signup } from "@/app/signup/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, LIMITS, MESSAGES, METADATA } from "@/lib/constants";

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
      signup(formData);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-6">
      <div className="flex flex-col items-center mb-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden mb-3 shadow-emerald-500/10">
          <Image
            src="/icon.png"
            alt={METADATA.SHORT_NAME}
            width={64}
            height={64}
            className="w-full h-full object-cover p-2.5"
          />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
          {METADATA.SHORT_NAME}
        </h1>
        <p className="text-gray-400 text-xs font-medium tracking-wide">
          {MESSAGES.UI.APP_TAGLINE}
        </p>
      </div>

      <div className="w-full max-w-sm p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-up">
        <h2 className="text-lg font-bold text-white mb-6 text-center">
          {MESSAGES.UI.CREATE_ACCOUNT}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {params.next && (
            <input type="hidden" name="next" value={params.next} />
          )}
          <Input
            name="name"
            type="text"
            label={`${MESSAGES.UI.NAME_LABEL} (${MESSAGES.UI.SIGNUP_MAX}${LIMITS.MAX_NAME_LENGTH}${MESSAGES.UI.SIGNUP_CHARS})`}
            placeholder={MESSAGES.UI.NAME_PLACEHOLDER}
            autoComplete="name"
            required
            maxLength={LIMITS.MAX_NAME_LENGTH}
            error={errors.name}
          />
          <Input
            name="search_id"
            type="text"
            label={`${MESSAGES.UI.SEARCH_ID_LABEL} (${MESSAGES.UI.SIGNUP_ALPHANUMERIC}/${MESSAGES.UI.SIGNUP_MAX}${LIMITS.MAX_SEARCH_ID_LENGTH}${MESSAGES.UI.SIGNUP_CHARS})`}
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
            <p className="text-red-400 text-sm mt-2">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? MESSAGES.UI.SIGNING_UP : MESSAGES.UI.SIGNUP}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4 text-sm text-gray-400">
          <Link
            href={`${ROUTES.LOGIN}${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}
            className="hover:text-brand-300 transition-colors"
          >
            {MESSAGES.UI.ALREADY_HAVE_ACCOUNT_PROMPT}
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
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
