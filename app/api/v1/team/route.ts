import { NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const userId = userId

    // Check if user is a team manager
    const { data: ownTeam } = await supabase
      .from('teams')
      .select('*')
      .eq('manager_id', userId)
      .maybeSingle()

    let team: any = ownTeam
    let isManager = !!ownTeam

    if (!team) {
      const { data: membership } = await supabase
        .from('team_members')
        .select('*, teams(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (membership?.teams) {
        team = membership.teams
      }
    }

    if (!team) {
      return NextResponse.json({ data: null, success: true })
    }

    // Get all active members
    const { data: members } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team.id)
      .eq('status', 'active')

    // Collect all user IDs (manager + members, deduped)
    const memberUserIds: string[] = Array.from(new Set([
      team.manager_id,
      ...(members ?? []).map((m: any) => m.user_id),
    ]))

    // Get profiles via RPC
    const { data: profiles } = await supabase
      .rpc('get_team_member_profiles', { member_ids: memberUserIds })

    const profileMap = Object.fromEntries(
      (profiles ?? []).map((p: any) => [p.user_id, p])
    )

    // Get stats for each member
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const memberStats = await Promise.all(
      memberUserIds.map(async (uid) => {
        const [totalRes, newRes, contractRes, interactionRes] = await Promise.all([
          supabase.from('customers').select('*', { count: 'exact', head: true })
            .eq('user_id', uid).is('deleted_at', null),
          supabase.from('customers').select('*', { count: 'exact', head: true })
            .eq('user_id', uid).is('deleted_at', null).gte('created_at', startOfMonth),
          supabase.from('customers').select('*', { count: 'exact', head: true })
            .eq('user_id', uid).is('deleted_at', null).ilike('stage', '%계약%'),
          supabase.from('interactions').select('*', { count: 'exact', head: true })
            .eq('user_id', uid).gte('occurred_at', startOfMonth),
        ])
        const total = totalRes.count ?? 0
        const contracts = contractRes.count ?? 0
        return {
          userId: uid,
          stats: {
            totalCustomers: total,
            newThisMonth: newRes.count ?? 0,
            interactions: interactionRes.count ?? 0,
            contracts,
            conversionRate: total > 0 ? Math.round((contracts / total) * 100) : 0,
          },
        }
      })
    )

    const statsMap = Object.fromEntries(memberStats.map(s => [s.userId, s.stats]))

    // Build enriched member list (manager first)
    const enrichedMembers = memberUserIds.map(uid => {
      const member = (members ?? []).find((m: any) => m.user_id === uid)
      const profile = (profileMap[uid] ?? {}) as any
      const isManagerUser = uid === team.manager_id
      return {
        id: member?.id ?? `mgr-${uid}`,
        team_id: team.id,
        user_id: uid,
        role: isManagerUser ? 'manager' : (member?.role ?? 'member'),
        status: 'active' as const,
        email: profile.email ?? '',
        name: profile.full_name ?? profile.email?.split('@')[0] ?? '알 수 없음',
        joined_at: member?.joined_at ?? team.created_at,
        stats: statsMap[uid],
      }
    })

    return NextResponse.json({
      data: { team, members: enrichedMembers, isManager },
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: '팀 이름을 입력해주세요', success: false }, { status: 400 })
    }

    // Check if user already manages a team
    const { count: ownCount } = await supabase
      .from('teams').select('*', { count: 'exact', head: true })
      .eq('manager_id', userId)
    if (ownCount && ownCount > 0) {
      return NextResponse.json({ error: '이미 팀이 있습니다', success: false }, { status: 400 })
    }

    // Check if user is already a member
    const { count: memberCount } = await supabase
      .from('team_members').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active')
    if (memberCount && memberCount > 0) {
      return NextResponse.json({ error: '이미 팀에 속해있습니다', success: false }, { status: 400 })
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({ name: name.trim(), manager_id: userId })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data: team, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
