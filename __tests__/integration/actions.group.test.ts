import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase クライアントと revalidatePath をモック化
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// リポジトリとユースケースをモック化
vi.mock("@/lib/repositories/groupRepository", () => ({
  addMemberToGroup: vi.fn(),
  removeMemberFromGroup: vi.fn(),
  deleteGroup: vi.fn(),
}));

vi.mock("@/lib/usecases/createGroup", () => ({
  createGroup: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createGroup } from "@/lib/usecases/createGroup";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
} from "@/lib/repositories/groupRepository";
import {
  createGroupAction,
  addMemberAction,
  removeMemberAction,
  deleteGroupAction,
} from "@/app/actions/group";
import { MESSAGES } from "@/lib/constants";

const mockCreateClient = vi.mocked(createClient);
const mockCreateGroup = vi.mocked(createGroup);
const mockAddMemberToGroup = vi.mocked(addMemberToGroup);
const mockRemoveMemberFromGroup = vi.mocked(removeMemberFromGroup);
const mockDeleteGroup = vi.mocked(deleteGroup);
const mockRevalidatePath = vi.mocked(revalidatePath);

function makeAuthenticatedSupabase(userId = "user-1") {
  const mockSingle = vi
    .fn()
    .mockResolvedValue({ data: { id: "target-user-id" }, error: null });
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: mockSingle,
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
    from: mockFrom,
  };
}

function makeUnauthenticatedSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  };
}

describe("actions/group", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("createGroupAction", () => {
    it("未認証の場合、エラーを返す", async () => {
      mockCreateClient.mockResolvedValue(
        makeUnauthenticatedSupabase() as never,
      );
      const result = await createGroupAction({
        name: "テストグループ",
        memberSearchIds: [],
      });
      expect(result.error).toBe(MESSAGES.ERROR.UNAUTHORIZED);
    });

    it("正常なリクエストの場合、グループを返し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      const mockResultGroup = { id: "g-1", name: "テストグループ" };
      mockCreateGroup.mockResolvedValue(mockResultGroup as never);

      const result = await createGroupAction({
        name: "テストグループ",
        memberSearchIds: [],
      });

      expect(result.data).toEqual(mockResultGroup);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });
  });

  describe("addMemberAction", () => {
    it("ユーザーが見つからない場合、エラーを返す", async () => {
      const supabase = makeAuthenticatedSupabase();
      // @ts-ignore
      supabase.from().single.mockResolvedValue({
        data: null,
        error: new Error("Not found"),
      });
      mockCreateClient.mockResolvedValue(supabase as never);

      const result = await addMemberAction("g-1", { searchId: "unknown-id" });
      expect(result.error).toBe(MESSAGES.ERROR.USER_NOT_FOUND);
    });

    it("正常な場合、メンバーを追加し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      mockAddMemberToGroup.mockResolvedValue(undefined);

      const result = await addMemberAction("g-1", {
        searchId: "user-id-to-add",
      });

      expect(result.data?.success).toBe(true);
      expect(mockAddMemberToGroup).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/groups/g-1");
    });
  });

  describe("removeMemberAction", () => {
    it("正常にメンバーを削除し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      mockRemoveMemberFromGroup.mockResolvedValue(undefined);

      const result = await removeMemberAction("g-1", "user-2");

      expect(result.data?.success).toBe(true);
      expect(mockRemoveMemberFromGroup).toHaveBeenCalledWith("g-1", "user-2");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/groups/g-1");
    });
  });

  describe("deleteGroupAction", () => {
    it("正常にグループを削除し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never);
      mockDeleteGroup.mockResolvedValue(undefined);

      const result = await deleteGroupAction("g-1");

      expect(result.data?.success).toBe(true);
      expect(mockDeleteGroup).toHaveBeenCalledWith("g-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });
  });
});
