export const runtime = "edge";
import { createClient } from "@/utils/supabase/server";
import { getGroupById } from "@/lib/repositories/groupRepository";
import { fetchGroupBalances } from "@/lib/usecases/getBalances";
import { getPaymentsByGroupId } from "@/lib/repositories/paymentRepository";
import { GroupDetailClient } from "@/components/groups/group-detail-client";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Group } from "@/lib/domain/models/group";
import { User } from "@/lib/domain/models/user";
import { Balance } from "@/lib/domain/models/balance";
import { Payment } from "@/lib/domain/models/payment";
import { Settlement } from "@/lib/domain/models/settlement";
import { getSettlementsByGroupId } from "@/lib/repositories/settlementRepository";

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
  const balancesPromise = fetchGroupBalances(groupId);
  const paymentsPromise = getPaymentsByGroupId(groupId);
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
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <h1 className="text-2xl font-black text-slate-900">{name}</h1>
      <div className="h-12 w-full bg-slate-100 shadow-sm border border-slate-200 rounded-2xl" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 w-full bg-slate-100 shadow-sm border border-slate-200 rounded-2xl"
          />
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
