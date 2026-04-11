"use client";

import Link from "next/link";
import { ROUTES, MESSAGES } from "@/lib/constants";

export function LandingPage() {
  return (
    <div className="flex flex-col items-center px-4 md:px-6 max-w-6xl mx-auto animate-fade-in relative z-10 w-full overflow-hidden">
      {/* 1. ヒーローセクション */}
      <section className="w-full min-h-[75vh] flex flex-col justify-center items-center text-center space-y-8 py-12 md:py-20 relative">
        <div className="inline-flex items-center justify-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-bold tracking-wider mb-2 md:mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{MESSAGES.UI.APP_TAGLINE}</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-green-400 drop-shadow-2xl p-2 leading-[1.1]">
          Kashikari
        </h1>

        <p className="text-2xl md:text-4xl font-bold text-white leading-snug drop-shadow-md mt-4 whitespace-pre-wrap">
          {MESSAGES.LANDING.HERO_SUBTITLE}
        </p>

        <p className="max-w-2xl mx-auto text-base md:text-xl text-gray-300 font-medium leading-relaxed mt-6 whitespace-pre-wrap">
          {MESSAGES.LANDING.HERO_DESC}
        </p>

        <div className="pt-8 w-full flex justify-center">
          <Link
            href={ROUTES.LOGIN}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 w-full sm:w-auto text-lg"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
              {MESSAGES.LANDING.CTA_FREE}
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* 2. 特徴セクション (Features) */}
      <section className="w-full py-16 md:py-24 border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {MESSAGES.LANDING.FEATURES_TITLE}
          </h2>
          <p className="text-gray-400">{MESSAGES.LANDING.FEATURES_SUBTITLE}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="relative group rounded-3xl p-8 bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:border-emerald-500/40 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {MESSAGES.LANDING.FEATURE_1_TITLE}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {MESSAGES.LANDING.FEATURE_1_DESC}
            </p>
          </div>

          <div className="relative group rounded-3xl p-8 bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:border-teal-500/40 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-teal-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <svg
                className="w-8 h-8 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {MESSAGES.LANDING.FEATURE_2_TITLE}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {MESSAGES.LANDING.FEATURE_2_DESC}
            </p>
          </div>

          <div className="relative group rounded-3xl p-8 bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:border-green-500/40 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6 border border-green-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {MESSAGES.LANDING.FEATURE_3_TITLE}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {MESSAGES.LANDING.FEATURE_3_DESC}
            </p>
          </div>
        </div>
      </section>

      {/* 3. ユースケースセクション (Use Cases) */}
      <section className="w-full py-16 md:py-24 border-t border-white/5 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            {MESSAGES.LANDING.USECASES_TITLE}
          </h2>
          <p className="text-gray-400">{MESSAGES.LANDING.USECASES_SUBTITLE}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Use Case 1 */}
          <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-900/30 flex items-start space-x-4">
            <div className="text-4xl">✈️</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                {MESSAGES.LANDING.USECASE_1_TITLE}
              </h3>
              <p className="text-sm text-emerald-100/60 leading-relaxed">
                {MESSAGES.LANDING.USECASE_1_DESC}
              </p>
            </div>
          </div>
          {/* Use Case 2 */}
          <div className="p-6 rounded-3xl bg-teal-950/20 border border-teal-900/30 flex items-start space-x-4">
            <div className="text-4xl">🍻</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                {MESSAGES.LANDING.USECASE_2_TITLE}
              </h3>
              <p className="text-sm text-teal-100/60 leading-relaxed">
                {MESSAGES.LANDING.USECASE_2_DESC}
              </p>
            </div>
          </div>
          {/* Use Case 3 */}
          <div className="p-6 rounded-3xl bg-cyan-950/20 border border-cyan-900/30 flex items-start space-x-4">
            <div className="text-4xl">🏠</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                {MESSAGES.LANDING.USECASE_3_TITLE}
              </h3>
              <p className="text-sm text-cyan-100/60 leading-relaxed">
                {MESSAGES.LANDING.USECASE_3_DESC}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 使い方ステップ (How it Works) */}
      <section className="w-full py-16 md:py-24 border-t border-white/5 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {MESSAGES.LANDING.STEPS_TITLE}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 lg:gap-8 max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="flex-1 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-emerald-400">
              1
            </div>
            <h3 className="text-xl font-bold text-white">
              {MESSAGES.LANDING.STEP_1_TITLE}
            </h3>
            <p className="text-sm text-gray-400">
              {MESSAGES.LANDING.STEP_1_DESC}
            </p>
          </div>
          <div className="hidden md:block text-white/30 text-4xl">➡</div>
          {/* Step 2 */}
          <div className="flex-1 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-teal-400">
              2
            </div>
            <h3 className="text-xl font-bold text-white">
              {MESSAGES.LANDING.STEP_2_TITLE}
            </h3>
            <p className="text-sm text-gray-400">
              {MESSAGES.LANDING.STEP_2_DESC}
            </p>
          </div>
          <div className="hidden md:block text-white/30 text-4xl">➡</div>
          {/* Step 3 */}
          <div className="flex-1 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-cyan-400">
              3
            </div>
            <h3 className="text-xl font-bold text-white">
              {MESSAGES.LANDING.STEP_3_TITLE}
            </h3>
            <p className="text-sm text-gray-400">
              {MESSAGES.LANDING.STEP_3_DESC}
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQセクション */}
      <section className="w-full py-16 md:py-24 border-t border-white/5 relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {MESSAGES.LANDING.FAQ_TITLE}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <span className="text-xl">Q.</span> {MESSAGES.LANDING.FAQ_1_Q}
            </h3>
            <p className="text-gray-300 text-sm ml-7">
              {MESSAGES.LANDING.FAQ_1_A}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <span className="text-xl">Q.</span> {MESSAGES.LANDING.FAQ_2_Q}
            </h3>
            <p className="text-gray-300 text-sm ml-7">
              {MESSAGES.LANDING.FAQ_2_A}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <span className="text-xl">Q.</span> {MESSAGES.LANDING.FAQ_3_Q}
            </h3>
            <p className="text-gray-300 text-sm ml-7">
              {MESSAGES.LANDING.FAQ_3_A}
            </p>
          </div>
        </div>
      </section>

      {/* 6. ボトムCTAセクション */}
      <section className="w-full py-20 relative text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent -z-10 rounded-3xl blur-2xl"></div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight whitespace-pre-wrap">
          {MESSAGES.LANDING.BOTTOM_CTA_TITLE}
        </h2>
        <p className="text-gray-400 mb-10 text-lg">
          {MESSAGES.LANDING.BOTTOM_CTA_DESC}
        </p>
        <div className="flex justify-center">
          <Link
            href={ROUTES.LOGIN}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold transition-all duration-300 bg-white text-emerald-950 rounded-full hover:scale-105 active:scale-95 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {MESSAGES.LANDING.BOTTOM_CTA_BTN}
            <svg
              className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* フッター */}
      <footer className="w-full py-8 text-center border-t border-white/10 mt-8">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} {MESSAGES.LANDING.FOOTER_RIGHTS}
        </p>
      </footer>
    </div>
  );
}
