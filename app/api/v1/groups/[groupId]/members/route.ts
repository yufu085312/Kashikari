export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { addMemberToGroup } from "@/lib/repositories/groupRepository";
import { createClient } from "@/utils/supabase/server";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err("Unauthorized", 401);

    const { groupId } = await params;
    const { searchId } = await req.json();
    if (!searchId) return err("searchId is required");

    const { data: targetUser, error } = await supabase
      .from("users")
      .select("id")
      .eq("search_id", searchId.trim())
      .single();

    if (error || !targetUser) {
      return err("ユーザーが見つかりません", 404);
    }

    await addMemberToGroup(groupId, targetUser.id);
    return ok({ success: true });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    // Unique制約エラーなどのハンドリング
    if (errorMsg.includes("unique constraint")) {
      return err("すでに参加しているユーザーです", 400);
    }
    return err(errorMsg, 500);
  }
}
