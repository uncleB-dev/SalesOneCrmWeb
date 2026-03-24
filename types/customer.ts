export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string | null
  birth_date?: string | null
  gender?: '남' | '여' | null
  stage: string
  source?: string | null
  tags: string[]
  memo?: string | null
  company?: string | null
  job_title?: string | null
  address?: string | null
  google_contact_id?: string | null
  google_drive_folder_id?: string | null
  is_google_contact_synced: boolean
  order_index: number
  is_blacklist: boolean
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface CustomerWithDetails extends Customer {
  interactions: Interaction[]
  reminders: Reminder[]
}

export interface Interaction {
  id: string
  customer_id: string
  user_id: string
  type: '전화' | '문자' | '이메일' | '방문' | '화상' | '기타'
  content?: string | null
  duration?: number | null
  stage_changed_to?: string | null
  occurred_at: string
}

export interface Reminder {
  id: string
  customer_id: string
  user_id: string
  due_date: string
  start_time?: string | null
  memo?: string | null
  is_done: boolean
  google_event_id?: string | null
  created_at: string
}

export interface DriveFileRecord {
  id: string
  customer_id: string
  file_id: string
  file_name: string
  created_time: string | null
  modified_time: string | null
  last_seen_at: string
  is_deleted: boolean
}
