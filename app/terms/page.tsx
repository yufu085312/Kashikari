export const runtime = "edge";

import Link from "next/link";
import { MESSAGES } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="mb-8">
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 text-sm font-medium"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {MESSAGES.UI.BACK}
        </Link>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-8 tracking-tight">
          {MESSAGES.UI.TERMS_LABEL}
        </h1>

        <div className="space-y-8 text-gray-300 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {MESSAGES.POLICY.TERMS_1_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.TERMS_1_DESC}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {MESSAGES.POLICY.TERMS_2_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.TERMS_2_DESC}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {MESSAGES.POLICY.TERMS_3_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.TERMS_3_DESC}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {MESSAGES.POLICY.TERMS_4_TITLE}
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{MESSAGES.POLICY.TERMS_4_ITEM_1}</li>
              <li>{MESSAGES.POLICY.TERMS_4_ITEM_2}</li>
              <li>{MESSAGES.POLICY.TERMS_4_ITEM_3}</li>
              <li>{MESSAGES.POLICY.TERMS_4_ITEM_4}</li>
              <li>{MESSAGES.POLICY.TERMS_4_ITEM_5}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {MESSAGES.POLICY.TERMS_5_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.TERMS_5_DESC}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              {MESSAGES.POLICY.TERMS_6_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.TERMS_6_DESC}</p>
          </section>

          <div className="pt-8 border-t border-white/10 text-gray-500 text-xs text-right">
            {MESSAGES.POLICY.TERMS_UPDATED}
          </div>
        </div>
      </div>
    </div>
  );
}
