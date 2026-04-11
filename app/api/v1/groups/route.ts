export const runtime = "edge";

import { createGroup } from "@/lib/usecases/createGroup";
import { getGroupsByUserId } from "@/lib/repositories/groupRepository";
import { withAuth, ok } from "@/lib/api/handler";
import { createGroupSchema } from "@/lib/schemas";
import { ValidationError } from "@/lib/errors";

export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const result = createGroupSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }

  const { name, memberSearchIds } = result.data;

  const group = await createGroup({
    name,
    creatorId: user.id,
    memberSearchIds,
  });

  return ok(group);
});

export const GET = withAuth(async (_req, user) => {
  const groups = await getGroupsByUserId(user.id);
  return ok(groups);
});
