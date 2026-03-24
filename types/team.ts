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

export interface EnrichedMember {
  id: string
  team_id: string
  user_id: string
  role: 'manager' | 'member'
  status: 'active'
  email: string
  name: string
  joined_at: string | null
  stats: {
    totalCustomers: number
    newThisMonth: number
    interactions: number
    contracts: number
    conversionRate: number
  }
}

export interface TeamData {
  team: Team
  members: EnrichedMember[]
  isManager: boolean
}

export interface InviteCode {
  id: string
  team_id: string
  code: string
  created_by: string
  expires_at: string
  used_at: string | null
  used_by: string | null
  is_active: boolean
  created_at: string
}

export interface MemberReport {
  userId: string
  name: string
  email: string
  newCustomers: number
  interactions: number
  remindersCompleted: number
  remindersTotal: number
  contracts: number
}
