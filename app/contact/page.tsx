"use client";

export const runtime = "edge";

import { useState } from "react";
import { submitInquiry } from "./actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MESSAGES, ROUTES } from "@/lib/constants";

export default function ContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    type?: string;
    content?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const type = formData.get("type") as string;
    const content = formData.get("content") as string;

    const newErrors: { type?: string; content?: string } = {};
    if (!type) newErrors.type = MESSAGES.ERROR.INQUIRY_TYPE_REQUIRED;
    if (!content) newErrors.content = MESSAGES.ERROR.INQUIRY_CONTENT_REQUIRED;
    else if (content.length > 1000)
      newErrors.content = MESSAGES.ERROR.INQUIRY_CONTENT_TOO_LONG;

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitInquiry(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(true);
      }
    } catch {
      setError(MESSAGES.ERROR.INQUIRY_NETWORK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="mb-8 px-4 sm:px-0">
        <button
          onClick={() => router.back()}
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
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl mx-4 sm:mx-0">
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
          {MESSAGES.UI.INQUIRY_TITLE}
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          {MESSAGES.UI.INQUIRY_DESCRIPTION}
        </p>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-scale-in">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <svg
                className="w-6 h-6"
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
            </div>
            <h3 className="text-white font-bold mb-2">
              {MESSAGES.UI.INQUIRY_SUBMITTED_TITLE}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {MESSAGES.UI.INQUIRY_SUBMITTED_MSG}
            </p>
            <Button onClick={() => router.push(ROUTES.HOME)} className="w-full">
              {MESSAGES.UI.BACK_TO_HOME}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300 ml-1">
                {MESSAGES.UI.INQUIRY_TYPE_LABEL}
              </label>
              <div className="relative">
                <select
                  name="type"
                  required
                  defaultValue=""
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                >
                  <option value="" disabled className="text-gray-500">
                    {MESSAGES.UI.INQUIRY_TYPE_PLACEHOLDER}
                  </option>
                  <option value="機能要望" className="bg-gray-900 text-white">
                    {MESSAGES.UI.INQUIRY_TYPE_REQUEST}
                  </option>
                  <option value="不具合報告" className="bg-gray-900 text-white">
                    {MESSAGES.UI.INQUIRY_TYPE_BUG}
                  </option>
                  <option
                    value="アカウントに関するお問い合わせ"
                    className="bg-gray-900 text-white"
                  >
                    {MESSAGES.UI.INQUIRY_TYPE_ACCOUNT}
                  </option>
                  <option value="その他" className="bg-gray-900 text-white">
                    {MESSAGES.UI.INQUIRY_TYPE_OTHER}
                  </option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {validationErrors.type && (
                <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                  {validationErrors.type}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline mx-1">
                <label className="block text-sm font-medium text-gray-300">
                  {MESSAGES.UI.INQUIRY_CONTENT_LABEL}
                </label>
                <span className="text-xs text-gray-500">
                  {MESSAGES.UI.INQUIRY_CONTENT_CHAR_LIMIT}
                </span>
              </div>
              <textarea
                name="content"
                required
                maxLength={1000}
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 resize-none"
                placeholder={MESSAGES.UI.INQUIRY_CONTENT_PLACEHOLDER}
              />
              {validationErrors.content && (
                <p className="text-red-400 text-xs mt-1 ml-1 animate-fade-in">
                  {validationErrors.content}
                </p>
              )}
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? MESSAGES.UI.SENDING : MESSAGES.UI.SEND}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
