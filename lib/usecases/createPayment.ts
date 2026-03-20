import { insertPayment } from '@/lib/repositories/paymentRepository'
import { CreatePaymentInput, Payment } from '@/types/payment'

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const { amount, participants } = input

  // バリデーション
  if (amount <= 0) throw new Error('金額は0より大きい値を入力してください')

  const totalShare = participants.reduce((sum, p) => sum + p.share, 0)
  if (totalShare !== amount) {
    throw new Error(`参加者の負担合計(${totalShare})が支払い金額(${amount})と一致しません`)
  }

  return await insertPayment(input)
}
