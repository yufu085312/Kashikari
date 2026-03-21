export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { getGroupById } from "@/lib/repositories/groupRepository";
import { createClient } from "@/utils/supabase/server";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function GET(
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
    const group = await getGroupById(groupId);

    // ここでグループメンバーかどうかのチェックを入れることも可能
    const isMember = group.members.some((m) => m.id === user.id);
    if (!isMember) {
      return err("アクセス権がありません", 403);
    }

    return ok(group);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}

export async function DELETE(
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
    const group = await getGroupById(groupId);

    // メンバーであれば削除可能
    const isMember = group.members.some((m) => m.id === user.id);
    if (!isMember) {
      return err("グループメンバーのみが削除できます", 403);
    }

    const { deleteGroup } = await import("@/lib/repositories/groupRepository");
    await deleteGroup(groupId);

    return ok({ success: true });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}
