import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAccountAction } from "@/app/actions/user";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { fetchUnsettledBalances } from "@/lib/usecases/getUnsettledBalances";
import { MESSAGES } from "@/lib/constants";
import { redirect } from "next/navigation";

// モックの定義
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/usecases/getUnsettledBalances", () => ({
  fetchUnsettledBalances: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT");
    (error as any).digest = `NEXT_REDIRECT;${url};303;`;
    throw error;
  }),
}));

const mockCreateClient = vi.mocked(createClient);
const mockCreateAdminClient = vi.mocked(createAdminClient);
const mockFetchUnsettledBalances = vi.mocked(fetchUnsettledBalances);
const mockRedirect = vi.mocked(redirect);

describe("actions/user/deleteAccountAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const VALID_USER_ID = "00000000-0000-4000-8000-000000000001";

  it("未認証の場合、エラーを返す", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any);

    const result = await deleteAccountAction({});
    expect(result.error).toBe(MESSAGES.ERROR.UNAUTHORIZED);
  });

  it("未精算の残高がある場合、エラーを返す", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: VALID_USER_ID } },
          error: null,
        }),
      },
    } as any);

    mockFetchUnsettledBalances.mockResolvedValue([
      { groupId: "g1", groupName: "Group 1", amount: 1000 } as any,
    ]);

    const result = await deleteAccountAction({});
    expect(result.error).toBe(MESSAGES.ERROR.MEMBER_LEAVE_SETTLEMENT_PENDING);
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it("正常な場合、ユーザーを削除してリダイレクトされること", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: VALID_USER_ID } },
          error: null,
        }),
      },
    } as any);

    mockFetchUnsettledBalances.mockResolvedValue([]);

    const mockDeleteUser = vi.fn().mockResolvedValue({ error: null });
    mockCreateAdminClient.mockReturnValue({
      auth: {
        admin: {
          deleteUser: mockDeleteUser,
        },
      },
    } as any);

    // createSafeAction 内で redirect が re-throw されることを期待
    await expect(deleteAccountAction({})).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/");
    expect(mockDeleteUser).toHaveBeenCalledWith(VALID_USER_ID);
  });

  it("Adminでの削除に失敗した場合、エラーを返す", async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: VALID_USER_ID } },
          error: null,
        }),
      },
    } as any);

    mockFetchUnsettledBalances.mockResolvedValue([]);

    mockCreateAdminClient.mockReturnValue({
      auth: {
        admin: {
          deleteUser: vi
            .fn()
            .mockResolvedValue({ error: { message: "Internal Error" } }),
        },
      },
    } as any);

    const result = await deleteAccountAction({});
    expect(result.error).toBe(MESSAGES.ERROR.ACCOUNT_DELETE_FAILED);
  });
});
