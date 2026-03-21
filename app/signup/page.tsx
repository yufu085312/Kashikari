"use client";

export const runtime = "edge";

import { use, useState, useTransition } from "react";
import Link from "next/link";
import { signup } from "../login/actions";
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
          <svg
            className="w-full h-full p-2.5"
            viewBox="0 0 1024 1024"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="signup-logo-bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient
                id="signup-logo-wallet"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <filter
                id="signup-logo-shadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="20"
                  stdDeviation="30"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              rx="220"
              fill="url(#signup-logo-bg)"
            />
            <g filter="url(#signup-logo-shadow)">
              <rect
                x="180"
                y="380"
                width="664"
                height="360"
                rx="80"
                fill="url(#signup-logo-wallet)"
              />
            </g>
            <rect
              x="600"
              y="420"
              width="240"
              height="260"
              rx="60"
              fill="#1d4ed8"
            />
            <circle cx="720" cy="550" r="18" fill="#fde047" />
            <text
              x="360"
              y="600"
              fontSize="220"
              fill="white"
              fontWeight="700"
              fontFamily="Arial, sans-serif"
            >
              ¥
            </text>
            <path
              d="M380 250 L640 250 M640 250 L600 210 M640 250 L600 290"
              stroke="white"
              strokeWidth="18"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx="780" cy="260" r="70" fill="white" opacity="0.95" />
            <path
              d="M740 260 L770 290 L820 230"
              stroke="#22c55e"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
            label={`${MESSAGES.UI.NAME_LABEL} (最大${LIMITS.MAX_NAME_LENGTH}文字)`}
            placeholder="田中 太郎"
            autoComplete="name"
            required
            maxLength={LIMITS.MAX_NAME_LENGTH}
            error={errors.name}
          />
          <Input
            name="search_id"
            type="text"
            label={`${MESSAGES.UI.SEARCH_ID_LABEL} (半角英数字/最大${LIMITS.MAX_SEARCH_ID_LENGTH}文字)`}
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
            label={`${MESSAGES.UI.PASSWORD_LABEL} (${LIMITS.MIN_PASSWORD_LENGTH}文字以上)`}
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
