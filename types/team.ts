export interface Team {
  id: string
  name: string
  manager_id: string
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'manager' | 'member'
  status: 'pending' | 'active' | 'rejected'
  invited_by?: string | null
  joined_at?: string | null
  created_at: string
}

export interface MemberStats {
  member: TeamMember & { email: string; name: string }
  stats: {
    totalCustomers: number
    newThisMonth: number
    interactions: number
    contracts: number
    conversionRate: number
    lastActivity?: string | null
  }
}
