import { User } from './user'
import { CreatePaymentSchemaInput } from '@/lib/schemas/payment'

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

export type CreatePaymentInput = CreatePaymentSchemaInput;
