"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { PasswordForm } from "@/components/home/password-form";
import { ROUTES, MESSAGES, METADATA } from "@/lib/constants";

export default function ResetPasswordPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // パスワード更新成功後、ログイン画面へ遷移
    router.push(
      `${ROUTES.LOGIN}?message=${encodeURIComponent(MESSAGES.UI.PASSWORD_UPDATE_SUCCESS)}`,
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden mb-6 shadow-emerald-500/10">
          <Image
            src="/icon.png"
            alt={METADATA.SHORT_NAME}
            width={64}
            height={64}
            className="w-full h-full object-cover p-2.5"
          />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-3">
          {MESSAGES.UI.RESET_PASSWORD_TITLE}
        </h1>
        <p className="text-gray-400 font-medium tracking-wide">
          {MESSAGES.UI.RESET_PASSWORD_DESCRIPTION}
        </p>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-up">
        <PasswordForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
