import { getGroupsByUserId } from "@/lib/repositories/groupRepository";
import { fetchGroupBalances } from "@/lib/usecases/getBalances";
import { Balance } from "@/lib/domain/models/balance";

/**
 * グループ名付きの未精算バランス
 */
export interface UnsettledBalance extends Balance {
  groupId: string;
  groupName: string;
}

/**
 * ログインユーザーが所属する全グループの未精算バランスのうち、
 * 自分が支払う側 or 受け取る側のものだけをフィルタリングして返す。
 */
export async function fetchUnsettledBalances(
  userId: string,
): Promise<UnsettledBalance[]> {
  const groups = await getGroupsByUserId(userId);

  if (groups.length === 0) return [];

  // 全グループのバランスを並列で取得
  const groupBalancesResults = await Promise.all(
    groups.map(async (group) => {
      try {
        const balances = await fetchGroupBalances(group.id);
        return { group, balances };
      } catch {
        // 個別グループのエラーは握りつぶして他のグループは表示する
        return { group, balances: [] as Balance[] };
      }
    }),
  );

  // 自分が関係する未精算のみフィルタリング
  const unsettled: UnsettledBalance[] = [];

  for (const { group, balances } of groupBalancesResults) {
    for (const balance of balances) {
      if (balance.fromUserId === userId || balance.toUserId === userId) {
        unsettled.push({
          ...balance,
          groupId: group.id,
          groupName: group.name,
        });
      }
    }
  }

  return unsettled;
}
