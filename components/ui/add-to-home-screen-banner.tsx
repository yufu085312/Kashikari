"use client";

import { useState, useEffect } from "react";
import { MESSAGES } from "@/lib/constants";

export function AddToHomeScreenBanner() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => void;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  } | null>(null);

  useEffect(() => {
    // すでにインストール済み（スタンドアロンモード）なら表示しない
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as unknown as { standalone: boolean }).standalone === true);

    if (isStandalone) return;

    // すでに「閉じた」記録があれば表示しない
    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);

    if (ios) {
      setIsIos(true);
      setShow(true);
      return;
    }

    // Android / Chrome: beforeinstallprompt を捕捉
    const handler = (e: Event) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDeferredPrompt(e as any);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setShow(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div className="animate-slide-up mb-4">
      <div className="relative flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {/* アイコン */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
          <svg
            className="w-5 h-5 text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {MESSAGES.UI.ADD_TO_HOME_SCREEN}
          </p>
          {isIos ? (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {MESSAGES.UI.SHARE_ICON_LABEL}
              <svg
                className="inline w-3.5 h-3.5 mx-0.5 -mt-0.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              →{MESSAGES.UI.ADD_IOS_INSTRUCTION}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              {MESSAGES.UI.ADD_ANDROID_INSTRUCTION}
            </p>
          )}
        </div>

        {/* Androidのインストールボタン */}
        {!isIos && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 px-3 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-400 rounded-xl transition-all active:scale-95"
          >
            {MESSAGES.UI.ADD}
          </button>
        )}

        {/* 閉じるボタン */}
        <button
          onClick={handleDismiss}
          className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
          aria-label={MESSAGES.UI.CLOSE}
        >
          <span className="sr-only">閉じる</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
