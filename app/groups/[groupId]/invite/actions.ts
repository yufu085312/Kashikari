"use server";

import { createClient } from "@/utils/supabase/server";
import { MESSAGES } from "@/lib/constants";
import { addMemberToGroup } from "@/lib/repositories/groupRepository";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const isRedirectError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "digest" in error &&
  typeof (error as { digest?: unknown }).digest === "string" &&
  (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");

export async function joinGroupAction(groupId: string) {
  try {
    const supabaseSrv = await createClient();
    const {
      data: { user: authUser },
    } = await supabaseSrv.auth.getUser();
    if (!authUser) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);

    await addMemberToGroup(groupId, authUser.id);
    revalidatePath(`/groups/${groupId}`);
    redirect(`/groups/${groupId}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Failed to join group:", error);
    const message =
      error instanceof Error ? error.message : MESSAGES.ERROR.JOIN_FAILED;
    // エラー時はメッセージ付きで招待ページに戻す
    redirect(`/groups/${groupId}/invite?error=${encodeURIComponent(message)}`);
  }
}
