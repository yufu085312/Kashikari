import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/usecases/createPayment", () => ({
  createPayment: vi.fn(),
}));

vi.mock("@/lib/repositories/paymentRepository", () => ({
  deletePayment: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createPayment } from "@/lib/usecases/createPayment";
import { deletePayment } from "@/lib/repositories/paymentRepository";
import {
  createPaymentAction,
  deletePaymentAction,
} from "@/app/actions/payment";
import { MESSAGES } from "@/lib/constants";

const mockCreateClient = vi.mocked(createClient);
const mockCreatePayment = vi.mocked(createPayment);
const mockDeletePayment = vi.mocked(deletePayment);
const mockRevalidatePath = vi.mocked(revalidatePath);

function makeAuthenticatedSupabase(userId = "user-1") {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
  };
}

describe("actions/payment", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createPaymentAction", () => {
    it("正常に支払いを登録し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      const mockResult = { id: "p-1", amount: 1000 };
      mockCreatePayment.mockResolvedValue(mockResult as never);

      const input = {
        groupId: "00000000-0000-4000-8000-000000000001",
        payerId: "00000000-0000-4000-8000-000000000001",
        amount: 1000,
        participants: [
          { userId: "00000000-0000-4000-8000-000000000001", share: 500 },
          { userId: "00000000-0000-4000-8000-000000000002", share: 500 },
        ],
        memo: "テスト",
      };

      const result = await createPaymentAction(input);

      expect(result.data).toEqual(mockResult);
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/groups/${input.groupId}`,
      );
    });
  });

  describe("deletePaymentAction", () => {
    it("正常に支払いを削除し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      mockDeletePayment.mockResolvedValue(undefined);

      const input = {
        paymentId: "00000000-0000-4000-8000-000000000001",
        groupId: "00000000-0000-4000-8000-000000000002",
      };
      const result = await deletePaymentAction(input);

      expect(result.data?.success).toBe(true);
      expect(mockDeletePayment).toHaveBeenCalledWith(input.paymentId);
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/groups/${input.groupId}`,
      );
    });
  });
});
