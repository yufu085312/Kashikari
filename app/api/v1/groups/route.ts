export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { createGroup } from "@/lib/usecases/createGroup";
import { getGroupsByUserId } from "@/lib/repositories/groupRepository";
import { createClient } from "@/utils/supabase/server";
import { MESSAGES, LIMITS } from "@/lib/constants";

function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}
function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(MESSAGES.ERROR.UNAUTHORIZED, 401);

    const { name, memberSearchIds } = await req.json();
    if (!name) return err(MESSAGES.ERROR.GROUP_NAME_REQUIRED);
    if (name.length > LIMITS.MAX_GROUP_NAME_LENGTH)
      return err(MESSAGES.ERROR.GROUP_NAME_TOO_LONG);

    const group = await createGroup({
      name,
      creatorId: user.id,
      memberSearchIds: memberSearchIds || [],
    });
    return ok(group);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return err(MESSAGES.ERROR.UNAUTHORIZED, 401);

    const groups = await getGroupsByUserId(user.id);
    return ok(groups);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return err(errorMsg, 500);
  }
}
