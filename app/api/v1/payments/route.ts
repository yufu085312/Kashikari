export const runtime = "edge";

import { createPayment } from "@/lib/usecases/createPayment";
import { withAuth, ok } from "@/lib/api/handler";
import { createPaymentSchema } from "@/lib/schemas";
import { ValidationError } from "@/lib/errors";
import { verifyGroupMembership } from "@/lib/api/withGroupMembership";

export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const result = createPaymentSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }

  const { groupId, payerId, amount, participants, memo } = result.data;

  // メンバーシップ検証
  await verifyGroupMembership(groupId, user.id);

  const payment = await createPayment({
    groupId,
    payerId,
    amount,
    participants,
    memo,
  });

  return ok(payment);
});
