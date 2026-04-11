import { insertPayment } from "@/lib/repositories/paymentRepository";
import { CreatePaymentSchemaInput } from "@/lib/schemas/payment";
import { Payment } from "@/lib/domain/models/payment";
import { ValidationError } from "@/lib/errors";
import { MESSAGES } from "@/lib/constants";

export async function createPayment(
  input: CreatePaymentSchemaInput,
): Promise<Payment> {
  const { amount, participants } = input;

  // バリデーション
  if (amount <= 0) throw new ValidationError(MESSAGES.ERROR.PAYMENT_AMOUNT_MIN);

  const totalShare = participants.reduce((sum, p) => sum + p.share, 0);
  if (totalShare !== amount) {
    throw new ValidationError(
      MESSAGES.ERROR.PAYMENT_SHARE_MISMATCH +
        ` (${MESSAGES.ERROR.TOTAL_SHARE_LABEL}: ${totalShare}, ${MESSAGES.ERROR.PAYMENT_AMOUNT_LABEL}: ${amount})`,
    );
  }

  return await insertPayment(input);
}
