import { User } from './user'

export interface PaymentParticipant {
  id?: string
  payment_id: string
  user_id: string
  share_amount: number
  user?: User
}

export interface Payment {
  id: string
  group_id: string
  payer_id: string
  amount: number
  memo?: string
  created_at?: string
  payer?: User
  participants?: PaymentParticipant[]
}

export interface CreatePaymentInput {
  groupId: string
  payerId: string
  amount: number
  participants: { userId: string; share: number }[]
  memo?: string
}
