"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 1. Backdrop Layer: 独立した固定レイヤーで全画面を覆う */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 2. Positioning Wrapper: スクロール可能な flex コンテナ */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* 3. Modal Body: 実際のカード部分 */}
        <div
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl animate-slide-up flex flex-col max-h-[85vh] sm:my-8 overflow-hidden isolation-isolate"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-6 pt-8 pb-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-all p-2 rounded-xl hover:bg-slate-100 active:scale-90"
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
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
