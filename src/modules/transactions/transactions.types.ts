export interface Transaction {
  id: string
  user_id: string
  category_id: string
  type: 'income' | 'expense'
  amount_in_cents: number
  description?: string
  created_at: Date
}
