export const DAILY_RATE = 50 // R$50 por dia fixo

export type WorkedDay = {
  id: string
  user_id: string
  date: string
  created_at: string
}

export type TransactionType = "income" | "expense" | "daily_work" | "payment_received" | "automatic_daily"

export type Transaction = {
  id: string
  user_id: string
  type: TransactionType
  description: string | null
  amount: number
  date: string
  created_at: string
}

export type ActionLog = {
  id: string
  user_id: string
  action_type: string
  description: string | null
  amount: number | null
  created_at: string
}

export type MonthData = {
  workedDays: WorkedDay[]
  transactions: Transaction[]
  allWorkedDays: WorkedDay[]
  allTransactions: Transaction[]
}
