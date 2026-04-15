"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { logout } from "@/app/login/actions";
import { ROUTES, TIMEOUTS, MESSAGES, METADATA } from "@/lib/constants";

interface HomeHeaderProps {
  userName: string;
  searchId: string;
  onNewGroup: () => void;
}

export function HomeHeader({
  userName,
  searchId,
  onNewGroup,
}: HomeHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<
    "closed" | "view" | "edit"
  >("closed");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(searchId);
    setCopied(true);
    setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
  };

  return (
    <>
      <section className="relative flex flex-col sm:flex-row sm:items-start justify-between sm:gap-6">
        <div className="flex-1 min-w-0 pr-10 sm:pr-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-200 overflow-hidden">
              <Image
                src="/icon.png"
                alt={METADATA.SHORT_NAME}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">
              {MESSAGES.UI.APP_TAGLINE}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <Button
            onClick={onNewGroup}
            size="sm"
            className="hidden sm:flex rounded-2xl w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {MESSAGES.UI.NEW_GROUP_LABEL}
          </Button>

          <div className="absolute right-0 top-0 sm:relative sm:top-auto sm:right-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100 active:scale-95"
              title={MESSAGES.UI.SETTINGS_LABEL}
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
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 py-1 animate-fade-in origin-top-right">
                  <button
                    onClick={() => {
                      setProfileModalMode("view");
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-l-2 border-transparent hover:border-emerald-400 text-left"
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
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {MESSAGES.UI.PROFILE_VIEW_TITLE}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(true);
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-l-2 border-transparent hover:border-emerald-400 text-left"
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
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {MESSAGES.UI.CHANGE_PASSWORD_TITLE}
                  </button>
                  <Link
                    href={ROUTES.TERMS}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-l-2 border-transparent hover:border-emerald-400"
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
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {MESSAGES.UI.TERMS_LABEL}
                  </Link>
                  <Link
                    href={ROUTES.PRIVACY}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-l-2 border-transparent hover:border-emerald-400"
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
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    {MESSAGES.UI.PRIVACY_POLICY_LABEL}
                  </Link>
                  <Link
                    href={ROUTES.CONTACT}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border-l-2 border-transparent hover:border-emerald-400"
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
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {MESSAGES.UI.CONTACT_LABEL}
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border-l-2 border-transparent hover:border-red-500"
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      {MESSAGES.UI.LOGOUT_LABEL}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Modal
        isOpen={profileModalMode !== "closed"}
        onClose={() => {
          setProfileModalMode("closed");
          setCopied(false);
        }}
        title={
          profileModalMode === "edit"
            ? MESSAGES.UI.PROFILE_EDIT_TITLE
            : MESSAGES.UI.PROFILE_VIEW_TITLE
        }
      >
        {profileModalMode === "view" ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest text-left">
                  {MESSAGES.UI.NAME_LABEL}
                </p>
                <div className="flex items-center mt-1">
                  <p className="font-bold text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm text-left">
                    {userName}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest text-left">
                    {MESSAGES.UI.ID_LABEL}
                  </p>
                  <p className="font-mono font-bold text-slate-800 tracking-wider bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm mt-1 text-left">
                    {searchId}
                  </p>
                </div>
                <button
                  onClick={handleCopyId}
                  className={`flex items-center justify-center p-2 gap-1.5 rounded-xl transition-all active:scale-95 ${
                    copied
                      ? "text-emerald-500 bg-emerald-50"
                      : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                  }`}
                  title={MESSAGES.UI.COPY_ID}
                >
                  {copied ? (
                    <>
                      <span className="text-xs font-bold animate-fade-in px-1">
                        {MESSAGES.UI.ID_COPY_SUCCESS}
                      </span>
                      <svg
                        className="w-5 h-5 animate-fade-in"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  ) : (
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
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={() => setProfileModalMode("edit")}
              className="w-full font-bold py-3 box-border group border-2 bg-white text-slate-700 hover:bg-slate-50 hover:border-emerald-200 shadow-sm transition-all"
              variant="secondary"
              size="lg"
            >
              <svg
                className="w-4 h-4 mr-2 text-slate-400 group-hover:text-emerald-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              {MESSAGES.UI.PROFILE_EDIT_TITLE}
            </Button>
          </div>
        ) : (
          <ProfileForm
            initialName={userName}
            initialSearchId={searchId}
            onSuccess={() => setProfileModalMode("view")}
          />
        )}
      </Modal>

      <Modal
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
        title={MESSAGES.UI.CHANGE_PASSWORD_TITLE}
      >
        <PasswordForm onSuccess={() => setShowPasswordForm(false)} />
      </Modal>
    </>
  );
}
