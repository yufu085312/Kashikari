"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LIMITS, MESSAGES } from "@/lib/constants";
import { createGroupSchema, CreateGroupSchemaInput } from "@/lib/schemas/group";
import { createGroupAction } from "@/app/actions/group";

interface GroupFormProps {
  onSuccess?: (groupId: string) => void;
}

export function GroupForm({ onSuccess }: GroupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateGroupSchemaInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      memberSearchIds: [""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "memberSearchIds" as never, // react-hook-form の string array 判定回避用
  });

  const groupName = watch("name") || "";

  const onSubmit = (data: CreateGroupSchemaInput) => {
    setServerError(null);
    startTransition(async () => {
      // 空欄の searchId は除外
      const validSearchIds =
        data.memberSearchIds?.filter((id) => id.trim() !== "") || [];

      const { data: group, error } = await createGroupAction({
        name: data.name,
        memberSearchIds: validSearchIds,
      });

      if (error) {
        setServerError(error);
        return;
      }

      if (group) {
        if (onSuccess) {
          onSuccess(group.id);
        } else {
          router.push(`/groups/${group.id}`);
        }
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <Input
        label={`${MESSAGES.UI.NAME_LABEL} (${groupName.length}/${LIMITS.MAX_GROUP_NAME_LENGTH}文字)`}
        placeholder={MESSAGES.UI.GROUP_NAME_EXAMPLE}
        {...register("name")}
        error={errors.name?.message}
        required
        maxLength={LIMITS.MAX_GROUP_NAME_LENGTH}
      />

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-300">
          {MESSAGES.UI.INVITE_SEARCH_ID_LABEL}
        </label>

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder={MESSAGES.UI.SEARCH_ID_EXAMPLE}
                {...register(`memberSearchIds.${index}` as const)}
              />
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 px-3 py-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append("")}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors py-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {MESSAGES.UI.ADD_SEARCH_ID}
        </button>
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        {MESSAGES.UI.GROUP_CREATE}
      </Button>
    </form>
  );
}
