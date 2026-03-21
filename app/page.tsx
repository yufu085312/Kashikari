import { createClient } from "@/utils/supabase/server";
import { getGroupsByUserId } from "@/lib/repositories/groupRepository";
import { HomePageClient } from "@/components/home/home-client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { ROUTES, MESSAGES } from "@/lib/constants";

const isRedirectError = (error: any) =>
  error?.digest?.startsWith("NEXT_REDIRECT");

export const runtime = "edge";

export default async function HomePage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: queryError } = await props.searchParams;

  try {
    const supabase = await createClient();

    // Auth取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect(ROUTES.LOGIN);
    }

    // メール確認後のトップページ遷移時に、Cookieに残っている遷移先があればそこへ飛ばす
    const cookieStore = await cookies();
    const pendingRedirect = cookieStore.get("pending_redirect")?.value;
    if (pendingRedirect) {
      cookieStore.delete("pending_redirect");
      redirect(pendingRedirect);
    }

    // グループ取得
    let groups = [];
    try {
      groups = await getGroupsByUserId(user.id);
    } catch (ge: any) {
      console.error("Group Fetch Error:", ge.message);
      throw ge;
    }

    const userName = user.user_metadata?.name || MESSAGES.UI.GUEST;
    const searchId = user.user_metadata?.search_id || "";

    return (
      <div className="space-y-6">
        {queryError && (
          <div className="animate-fade-in mb-6">
            <GlassCard className="p-4 border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium flex items-center gap-3">
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {queryError}
            </GlassCard>
          </div>
        )}
        <HomePageClient
          initialGroups={groups}
          userName={userName}
          searchId={searchId}
        />
      </div>
    );
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    console.error("HomePage Error:", e);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <GlassCard className="p-8 text-center max-w-sm border-red-500/20 bg-red-500/5">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-lg shadow-red-500/10">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            {MESSAGES.UI.ERROR_OCCURRED}
          </h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            {MESSAGES.ERROR.FETCH_FAILED}
            <br />
            {MESSAGES.ERROR.RETRY_LATER}
          </p>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold text-white transition-all bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-95"
          >
            {MESSAGES.UI.RELOAD}
          </Link>
        </GlassCard>
      </div>
    );
  }
}
