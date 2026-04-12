export const runtime = "edge";

import Link from "next/link";
import { MESSAGES } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="mb-8">
        <Link
          href="/login"
          className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium"
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

      <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
          {MESSAGES.UI.PRIVACY_POLICY_LABEL}
        </h1>

        <div className="space-y-10 text-slate-600 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {MESSAGES.POLICY.PRIVACY_1_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.PRIVACY_1_DESC}</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
              <li>{MESSAGES.POLICY.PRIVACY_1_ITEM_1}</li>
              <li>{MESSAGES.POLICY.PRIVACY_1_ITEM_2}</li>
              <li>{MESSAGES.POLICY.PRIVACY_1_ITEM_3}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {MESSAGES.POLICY.PRIVACY_2_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.PRIVACY_2_DESC}</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
              <li>{MESSAGES.POLICY.PRIVACY_2_ITEM_1}</li>
              <li>{MESSAGES.POLICY.PRIVACY_2_ITEM_2}</li>
              <li>{MESSAGES.POLICY.PRIVACY_2_ITEM_3}</li>
              <li>{MESSAGES.POLICY.PRIVACY_2_ITEM_4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {MESSAGES.POLICY.PRIVACY_3_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.PRIVACY_3_DESC}</p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-2">
              <li>
                <strong>{MESSAGES.POLICY.PRIVACY_3_ITEM_1_NAME}</strong>:
                {MESSAGES.POLICY.PRIVACY_3_ITEM_1_DESC}
              </li>
              <li>
                <strong>{MESSAGES.POLICY.PRIVACY_3_ITEM_2_NAME}</strong>:
                {MESSAGES.POLICY.PRIVACY_3_ITEM_2_DESC}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {MESSAGES.POLICY.PRIVACY_4_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.PRIVACY_4_DESC}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {MESSAGES.POLICY.PRIVACY_5_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.PRIVACY_5_DESC}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {MESSAGES.POLICY.PRIVACY_6_TITLE}
            </h2>
            <p>{MESSAGES.POLICY.PRIVACY_6_DESC}</p>
          </section>

          <div className="pt-8 border-t border-slate-200 text-slate-500 text-xs text-right">
            {MESSAGES.POLICY.PRIVACY_UPDATED}
          </div>
        </div>
      </div>
    </div>
  );
}
