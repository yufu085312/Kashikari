"use client";

import Image from "next/image";
import { METADATA, MESSAGES } from "@/lib/constants";

export function AuthHero() {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center p-10 overflow-hidden bg-slate-900 rounded-l-[3rem]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-900 opacity-90" />

      {/* Decorative Circles (Glassmorphism) */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2.2rem] flex items-center justify-center border border-white/20 shadow-2xl p-3.5">
          <Image
            src="/icon.png"
            alt={METADATA.SHORT_NAME}
            width={72}
            height={72}
            className="w-full h-full object-cover brightness-110 contrast-125"
          />
        </div>

        <div className="space-y-3">
          <p className="text-4xl font-black text-white tracking-tighter drop-shadow-sm">
            {METADATA.SHORT_NAME}
          </p>
          <p className="text-emerald-100/80 text-base font-medium tracking-wide max-w-xs leading-relaxed">
            {MESSAGES.UI.APP_TAGLINE}
          </p>
        </div>

        {/* Brand visual / decoration */}
        <div className="pt-8">
          <div className="flex -space-x-4 opacity-70 scale-110">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-white/30 bg-emerald-700/50 backdrop-blur-md flex items-center justify-center text-white/50 text-[10px] font-bold overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-tr from-emerald-400 to-teal-500 opacity-20" />
              </div>
            ))}
          </div>
          <p className="text-emerald-300/50 text-xs mt-6 font-bold uppercase tracking-widest">
            Streamlined Bill Splitting
          </p>
        </div>
      </div>
    </div>
  );
}
