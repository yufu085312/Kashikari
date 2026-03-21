export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { removeMemberFromGroup } from "@/lib/repositories/groupRepository";
import { createClient } from "@/utils/supabase/server";
import { MESSAGES } from "@/lib/constants";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; userId: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(MESSAGES.ERROR.UNAUTHORIZED, 401);

    const { groupId, userId } = await params;

    await removeMemberFromGroup(groupId, userId);
    return ok({ success: true });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}
