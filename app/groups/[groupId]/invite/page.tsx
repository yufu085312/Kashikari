export const runtime = "edge";
import { createClient } from "@/utils/supabase/server";
import { getGroupById } from "@/lib/repositories/groupRepository";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
// Next.js の redirect() はエラーを投げることで動作するため、
// try-catch で誤ってキャッチしないように判定関数を用意します。
const isRedirectError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "digest" in error &&
  typeof (error as { digest?: unknown }).digest === "string" &&
  (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");
import { joinGroupAction } from "./actions";
import type { Metadata } from "next";
import { METADATA, MESSAGES } from "@/lib/constants";

export async function generateMetadata(props: {
  params: Promise<{ groupId: string }>;
}): Promise<Metadata> {
  const { groupId } = await props.params;
  try {
    const group = await getGroupById(groupId);
    const title = `${MESSAGES.UI.INVITE_META_TITLE_1}${group.name}${MESSAGES.UI.INVITE_META_TITLE_2}${METADATA.SHORT_NAME}`;
    const description = `${MESSAGES.UI.INVITE_META_DESC_1}${group.name}${MESSAGES.UI.INVITE_META_DESC_2}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    const fallbackTitle = `${MESSAGES.UI.INVITE_META_FALLBACK_TITLE}${METADATA.SHORT_NAME}`;
    const fallbackDesc = MESSAGES.UI.INVITE_META_FALLBACK_DESC;
    return {
      title: fallbackTitle,
      description: fallbackDesc,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDesc,
      },
    };
  }
}

export default async function InvitePage(props: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { groupId } = await props.params;
  const { error: serverError } = await props.searchParams;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const nextPath = `/groups/${groupId}/invite`;
      redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    }

    const group = await getGroupById(groupId);
    const isMember = group.members.some((m) => m.id === user.id);

    if (isMember) {
      // すでにメンバーならグループへ
      redirect(`/groups/${groupId}`);
    }

    const joinGroup = joinGroupAction.bind(null, groupId);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl flex items-center justify-center text-3xl">
            👋
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{group.name}</h1>
          <p className="text-gray-400 mb-8">{MESSAGES.UI.INVITE_PAGE_PROMPT}</p>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-6 animate-fade-in">
              {serverError}
            </div>
          )}

          <form action={joinGroup}>
            <Button type="submit" size="lg" className="w-full">
              {MESSAGES.UI.INVITE_JOIN_BUTTON}
            </Button>
          </form>
        </div>
      </div>
    );
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    console.error("Invite page error:", error);

    const detail = error instanceof Error ? error.message : String(error);
    const message = encodeURIComponent(
      `${MESSAGES.ERROR.GENERAL_ERROR_PREFIX}${detail}`,
    );
    redirect(`/?error=${message}`);
  }
}
