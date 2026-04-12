"use client";

import { useTransition } from "react";
import {
  signInWithGoogle /*, signInWithApple */,
} from "@/app/login/oauth-actions";
import { MESSAGES } from "@/lib/constants";

interface SocialLoginButtonsProps {
  next?: string;
  isSignUp?: boolean;
}

export function SocialLoginButtons({
  next,
  isSignUp = false,
}: SocialLoginButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleGoogleLogin = () => {
    startTransition(() => {
      signInWithGoogle(next);
    });
  };

  /* TODO: Apple Developer アカウント取得後に有効化
  const handleAppleLogin = () => {
    startTransition(() => {
      signInWithApple(next);
    });
  };
  */

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400 font-bold">
            {MESSAGES.UI.OR_SIGN_IN_WITH}
            {isSignUp ? MESSAGES.UI.REGISTER : MESSAGES.UI.LOGIN}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isPending}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-slate-700 font-bold"
        >
          {/* Google Icon (Simplified generic SVG for demo, or real if they have it) */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {MESSAGES.UI.SIGN_IN_WITH_GOOGLE}
          {isSignUp ? MESSAGES.UI.REGISTER : MESSAGES.UI.LOGIN}
        </button>

        {/* TODO: Apple Developer アカウント取得後に有効化
        <button
          type="button"
          onClick={handleAppleLogin}
          disabled={isPending}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-slate-900 border border-slate-900 rounded-xl hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-white font-bold"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M15.42 1.34c.86-1.04 1.44-2.52 1.28-3.98-1.26.05-2.8.84-3.69 1.91-.79.94-1.48 2.44-1.3 3.86 1.41.11 2.85-.75 3.71-1.79zm-4.7 18.06c-1.39 0-2.81-1-4.2-1C3.84 18.4 1 21.03 1 24.84c0 3.78 2.45 7.28 5.6 11.83 1.5 2.21 3.25 4.67 5.68 4.58 2.37-.09 3.33-1.52 6.18-1.52 s3.73 1.44 6.2 1.5c2.47.07 4-2.27 5.5-4.48 1.73-2.54 2.44-5.01 2.48-5.14-.05-.02-4.81-1.84-4.86-7.4-.04-4.65 3.78-6.87 3.96-6.97-2.17-3.17-5.55-3.6-6.75-3.66-2.86-.3-5.63 1.68-7.07 1.68-1.46 0-3.74-1.7-6.2-1.64z" transform="translate(0, -6)" />
          </svg>
          {MESSAGES.UI.SIGN_IN_WITH_APPLE}{isSignUp ? MESSAGES.UI.REGISTER : MESSAGES.UI.LOGIN}
        </button>
        */}
      </div>
    </div>
  );
}
