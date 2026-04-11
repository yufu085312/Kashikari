export const runtime = "edge";
import { createClient } from "@/utils/supabase/server";
import { getGroupById } from "@/lib/repositories/groupRepository";
import { getBalances } from "@/lib/usecases/getBalances";
import { getPaymentsByGroupId } from "@/lib/repositories/paymentRepository";
import { GroupDetailClient } from "@/components/groups/group-detail-client";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Balance } from "@/types/balance";
import { Payment } from "@/types/payment";
import { Settlement } from "@/types/balance";

export default async function GroupDetailPage(props: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const group = await getGroupById(groupId);
  const isMember = group.members.some((m) => m.id === user.id);

  if (!isMember) {
    redirect(`/groups/${groupId}/invite`);
  }

  // データ取得を開始（await しないことでストリーミングを可能にする）
  const balancesPromise = getBalances(groupId);
  const paymentsPromise = getPaymentsByGroupId(groupId);
  const { getSettlementsByGroupId } =
    await import("@/lib/repositories/settlementRepository");
  const settlementsPromise = getSettlementsByGroupId(groupId);

  return (
    <Suspense fallback={<GroupDetailSkeleton name={group.name} />}>
      <GroupDetailClientWrapper
        groupId={groupId}
        userId={user.id}
        group={group}
        balancesPromise={balancesPromise}
        paymentsPromise={paymentsPromise}
        settlementsPromise={settlementsPromise}
      />
    </Suspense>
  );
}

// データ取得が完了するまで表示するスケルトン
function GroupDetailSkeleton({ name }: { name: string }) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-white/5 rounded-lg" />
      <h1 className="text-2xl font-black text-white">{name}</h1>
      <div className="h-12 w-full bg-white/5 rounded-2xl" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// データを await して Client Component に渡す中間サーバーコンポーネント
interface GroupDetailClientWrapperProps {
  groupId: string;
  userId: string;
  group: Group & { members: User[] };
  balancesPromise: Promise<Balance[]>;
  paymentsPromise: Promise<Payment[]>;
  settlementsPromise: Promise<Settlement[]>;
}
async function GroupDetailClientWrapper({
  groupId,
  userId,
  group,
  balancesPromise,
  paymentsPromise,
  settlementsPromise,
}: GroupDetailClientWrapperProps) {
  const [balances, payments, settlements] = await Promise.all([
    balancesPromise,
    paymentsPromise,
    settlementsPromise,
  ]);

  return (
    <GroupDetailClient
      groupId={groupId}
      userId={userId}
      initialGroupName={group.name}
      initialMembers={group.members}
      initialCreatedBy={group.created_by}
      initialBalances={balances}
      initialPayments={payments}
      initialSettlements={settlements}
    />
  );
}
