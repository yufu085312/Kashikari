import { User } from './user'
import { CreateSettlementSchemaInput } from '@/lib/schemas/settlement'

export interface Balance {
  fromUserId: string
  toUserId: string
  amount: number
  fromUserName?: string
  toUserName?: string
}

export interface Settlement {
  id: string
  group_id: string
  from_user_id: string
  to_user_id: string
  amount: number
  created_at: string
  from_user?: User
  to_user?: User
}

export type CreateSettlementInput = CreateSettlementSchemaInput;
