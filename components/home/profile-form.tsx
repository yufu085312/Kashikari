"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MESSAGES } from "@/lib/constants";
import { updateProfile } from "@/app/settings/actions";
import {
  updateProfileSchema,
  UpdateProfileSchemaInput,
} from "@/lib/schemas/user";

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
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileSchemaInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName,
      search_id: initialSearchId,
    },
  });

  const onSubmit = (data: UpdateProfileSchemaInput) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfile(data);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-2"
      noValidate
    >
      <Input
        label={MESSAGES.UI.NAME_LABEL}
        placeholder={MESSAGES.UI.NAME_PLACEHOLDER}
        {...register("name")}
        error={errors.name?.message}
        disabled={isPending}
      />

      <Input
        label={MESSAGES.UI.SEARCH_ID_LABEL}
        placeholder={MESSAGES.UI.SEARCH_ID_EXAMPLE}
        {...register("search_id")}
        error={errors.search_id?.message}
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
        <Button type="submit" loading={isPending} className="w-full">
          {MESSAGES.UI.SAVE}
        </Button>
      </div>
    </form>
  );
}
