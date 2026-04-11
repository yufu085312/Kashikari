import { UserEntity } from "./user";

/**
 * グループ情報のドメインモデル
 */
export interface GroupEntity {
  id: string;
  name: string;
  createdBy: string;
  members?: UserEntity[];
  createdAt: string;
}

/**
 * 支払い（貸し借り）のドメインモデル
 */
export interface PaymentEntity {
  id: string;
  groupId: string;
  payerId: string;
  amount: number;
  memo?: string;
  participants: PaymentParticipant[];
  createdAt: string;
}

export interface PaymentParticipant {
  userId: string;
  share: number;
}
