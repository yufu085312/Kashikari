"use client";

export const runtime = "edge";

import { use, useState, useTransition } from "react";
import Image from "next/image";
import { setupProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIMITS, MESSAGES, METADATA } from "@/lib/constants";

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
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-200 overflow-hidden mb-6 shadow-emerald-100">
          <Image
            src="/icon.png"
            alt={METADATA.SHORT_NAME}
            width={64}
            height={64}
            className="w-full h-full object-cover p-2.5"
          />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">
          {MESSAGES.UI.PROFILE_SETUP_TITLE}
        </h1>
        <p className="text-slate-500 font-medium tracking-wide">
          {MESSAGES.UI.PROFILE_SETUP_DESCRIPTION}
        </p>
      </div>

      <div className="w-full max-w-sm p-6 rounded-3xl bg-white backdrop-blur-xl border border-slate-200 shadow-xl animate-slide-up">
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
            required
            maxLength={LIMITS.MAX_SEARCH_ID_LENGTH}
            error={errors.search_id}
          />

          {serverError && (
            <p className="text-red-500 text-sm mt-2">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? MESSAGES.UI.SAVING : MESSAGES.UI.COMPLETE_SETUP}
          </Button>
        </form>
      </div>
    </div>
  );
}
