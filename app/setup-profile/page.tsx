"use client";

export const runtime = "edge";

import { use, useState, useTransition } from "react";
import Image from "next/image";
import { setupProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIMITS, MESSAGES, METADATA } from "@/lib/constants";
import { AuthHero } from "@/components/ui/auth-hero";

export default function SetupProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = use(searchParams);
  const serverError = params.error;

  const [errors, setErrors] = useState<{
    name?: string;
    search_id?: string;
  }>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const search_id = formData.get("search_id") as string;

    const newErrors: {
      name?: string;
      search_id?: string;
    } = {};

    if (!name) newErrors.name = MESSAGES.ERROR.NAME_REQUIRED;
    if (!search_id) newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_REQUIRED;

    if (name && name.length > LIMITS.MAX_NAME_LENGTH)
      newErrors.name = MESSAGES.ERROR.NAME_TOO_LONG;
    if (search_id && search_id.length > LIMITS.MAX_SEARCH_ID_LENGTH)
      newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_TOO_LONG;
    if (search_id && !LIMITS.SEARCH_ID_PATTERN.test(search_id))
      newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_INVALID;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    startTransition(() => {
      setupProfile({
        name,
        search_id,
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
          <div className="lg:hidden flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-200 overflow-hidden mb-6 shadow-emerald-100">
              <Image
                src="/icon.png"
                alt={METADATA.SHORT_NAME}
                width={64}
                height={64}
                className="w-full h-full object-cover p-2.5"
              />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter mb-3">
              {MESSAGES.UI.PROFILE_SETUP_TITLE}
            </p>
            <p className="text-slate-500 font-medium tracking-wide">
              {MESSAGES.UI.PROFILE_SETUP_DESCRIPTION}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <h1 className="text-xl font-black text-slate-900 mb-1 lg:text-2xl lg:mb-2">
              {MESSAGES.UI.PROFILE_SETUP_TITLE}
            </h1>
            <p className="text-slate-500 text-xs mb-8 font-medium">
              Almost there! Just a few more details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                required
                maxLength={LIMITS.MAX_SEARCH_ID_LENGTH}
                error={errors.search_id}
              />

              {serverError && (
                <p className="text-red-500 text-xs mt-1">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full py-4 rounded-xl shadow-xl shadow-emerald-500/10 text-base mt-2"
                size="lg"
                disabled={isPending}
              >
                {isPending ? MESSAGES.UI.SAVING : MESSAGES.UI.COMPLETE_SETUP}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
