import { describe, it, expect, vi, beforeEach } from "vitest";

// モック対象のインポート
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createGroup } from "@/lib/usecases/createGroup";
import {
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
  getGroupById,
} from "@/lib/repositories/groupRepository";
import {
  createGroupAction,
  addMemberAction,
  removeMemberAction,
  deleteGroupAction,
} from "@/app/actions/group";
import { MESSAGES } from "@/lib/constants";

// モックの定義
vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/repositories/groupRepository", () => ({
  addMemberToGroup: vi.fn(),
  removeMemberFromGroup: vi.fn(),
  deleteGroup: vi.fn(),
  getGroupById: vi.fn(),
}));

vi.mock("@/lib/usecases/createGroup", () => ({
  createGroup: vi.fn(),
}));

// モック関数の取得
const mockCreateClient = vi.mocked(createClient);
const mockCreateGroup = vi.mocked(createGroup);
const mockAddMemberToGroup = vi.mocked(addMemberToGroup);
const mockRemoveMemberFromGroup = vi.mocked(removeMemberFromGroup);
const mockDeleteGroup = vi.mocked(deleteGroup);
const mockGetGroupById = vi.mocked(getGroupById);
const mockRevalidatePath = vi.mocked(revalidatePath);

// ヘルパー関数
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

  const VALID_GROUP_ID = "00000000-0000-4000-8000-000000000001";
  const VALID_USER_ID = "00000000-0000-4000-8000-000000000002";
  const TARGET_USER_ID = "00000000-0000-4000-8000-000000000003";

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
      mockCreateClient.mockResolvedValue(
        makeAuthenticatedSupabase(VALID_USER_ID) as never,
      );
      const mockResultGroup = { id: VALID_GROUP_ID, name: "テストグループ" };
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
      const supabase = makeAuthenticatedSupabase(VALID_USER_ID);
      // @ts-ignore
      supabase.from().single.mockResolvedValue({
        data: null,
        error: new Error("Not found"),
      });
      mockCreateClient.mockResolvedValue(supabase as never);

      const result = await addMemberAction({
        groupId: VALID_GROUP_ID,
        input: { searchId: "unknown-id" },
      });
      expect(result.error).toBe(MESSAGES.ERROR.USER_NOT_FOUND);
    });

    it("正常な場合、メンバーを追加し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(
        makeAuthenticatedSupabase(VALID_USER_ID) as never,
      );
      mockAddMemberToGroup.mockResolvedValue(undefined);

      const result = await addMemberAction({
        groupId: VALID_GROUP_ID,
        input: { searchId: "user-id-to-add" },
      });

      expect(result.data?.success).toBe(true);
      expect(mockAddMemberToGroup).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/groups/${VALID_GROUP_ID}`,
      );
    });
  });

  describe("removeMemberAction", () => {
    it("正常にメンバーを削除し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(
        makeAuthenticatedSupabase(VALID_USER_ID) as never,
      );
      mockGetGroupById.mockResolvedValue({
        id: VALID_GROUP_ID,
        created_by: VALID_USER_ID,
      } as any);
      mockRemoveMemberFromGroup.mockResolvedValue(undefined);

      const result = await removeMemberAction({
        groupId: VALID_GROUP_ID,
        targetUserId: TARGET_USER_ID,
      });

      expect(result.data?.success).toBe(true);
      expect(mockRemoveMemberFromGroup).toHaveBeenCalledWith(
        VALID_GROUP_ID,
        TARGET_USER_ID,
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/groups/${VALID_GROUP_ID}`,
      );
    });
  });

  describe("deleteGroupAction", () => {
    it("正常にグループを削除し revalidatePath を呼ぶ", async () => {
      mockCreateClient.mockResolvedValue(
        makeAuthenticatedSupabase(VALID_USER_ID) as never,
      );
      mockGetGroupById.mockResolvedValue({
        id: VALID_GROUP_ID,
        created_by: VALID_USER_ID,
      } as any);
      mockDeleteGroup.mockResolvedValue(undefined);

      const result = await deleteGroupAction(VALID_GROUP_ID);

      expect(result.data?.success).toBe(true);
      expect(mockDeleteGroup).toHaveBeenCalledWith(VALID_GROUP_ID);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    });
  });
});
