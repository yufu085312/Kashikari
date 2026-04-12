"use client";

export const runtime = "edge";

import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/lib/constants";

export default function SignupCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = use(searchParams);
  const next = params.next || "/";
  const isInvite = next.includes("/invite");

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20 animate-fade-in text-slate-900">
      <div className="w-full max-w-md p-10 rounded-3xl bg-white backdrop-blur-xl border border-slate-200 shadow-xl text-center shadow-emerald-100">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-200 shadow-lg shadow-emerald-100">
          <svg
            className="w-12 h-12 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
          {MESSAGES.UI.SIGNUP_COMPLETE_TITLE}
        </h1>

        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          {MESSAGES.UI.SIGNUP_COMPLETE_MSG}
          {isInvite && (
            <span className="text-emerald-600 font-bold block mt-3">
              {MESSAGES.UI.INVITE_COMPLETE_PROMPT}
            </span>
          )}
        </p>

        <div className="pt-4 border-t border-slate-200">
          <Button
            className="w-full h-14 text-lg font-bold shadow-lg shadow-emerald-500/10 bg-emerald-500 hover:bg-emerald-400 text-white border-none"
            onClick={() => (window.location.href = next)}
          >
            {isInvite ? MESSAGES.UI.GO_TO_INVITE_PAGE : MESSAGES.UI.GO_TO_HOME}
          </Button>
        </div>
      </div>
    </div>
  );
}
