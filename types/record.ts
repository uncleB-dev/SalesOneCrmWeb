export interface CallRecord {
  id: string
  user_id: string
  customer_id: string | null
  file_name: string
  phone_number: string | null
  occurred_at: string | null
  duration: number | null
  summary: string | null
  action_items: string | null
  sentiment: string | null
  raw_text: string | null
  is_matched: boolean
  created_at: string
  // joined
  customers?: { id: string; name: string; stage: string } | null
}
