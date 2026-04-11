"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MESSAGES, LIMITS } from "@/lib/constants";
import { updateProfile } from "@/app/settings/actions";

interface ProfileFormProps {
  initialName: string;
  initialSearchId: string;
  onSuccess: () => void;
}

export function ProfileForm({
  initialName,
  initialSearchId,
  onSuccess,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [searchId, setSearchId] = useState(initialSearchId);
  const [errors, setErrors] = useState<{ name?: string; search_id?: string }>(
    {},
  );
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
    const newErrors: { name?: string; search_id?: string } = {};
    if (!name) newErrors.name = MESSAGES.ERROR.NAME_REQUIRED;
    if (name.length > LIMITS.MAX_NAME_LENGTH)
      newErrors.name = MESSAGES.ERROR.NAME_TOO_LONG;

    if (!searchId) newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_REQUIRED;
    if (searchId.length > LIMITS.MAX_SEARCH_ID_LENGTH)
      newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_TOO_LONG;
    if (!LIMITS.SEARCH_ID_PATTERN.test(searchId))
      newErrors.search_id = MESSAGES.ERROR.SEARCH_ID_INVALID;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("search_id", searchId);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: MESSAGES.UI.PROFILE_UPDATE_SUCCESS,
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
        label={MESSAGES.UI.NAME_LABEL}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={MESSAGES.UI.NAME_PLACEHOLDER}
        error={errors.name}
        disabled={isPending}
      />

      <Input
        label={MESSAGES.UI.SEARCH_ID_LABEL}
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder={MESSAGES.UI.SEARCH_ID_EXAMPLE}
        error={errors.search_id}
        disabled={isPending}
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
