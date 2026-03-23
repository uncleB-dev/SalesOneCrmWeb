export interface Notification {
  id: string
  user_id: string
  from_user_id?: string | null
  type:
    | 'team_join_request'
    | 'team_invite'
    | 'team_accepted'
    | 'team_rejected'
    | 'team_disconnected'
  team_id?: string | null
  is_read: boolean
  created_at: string
  from_user?: { name: string; email: string } | null
  team?: { name: string } | null
}
