import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

function getPeriodDates(period: string): { startDate: string; endDate: string } {
  const now = new Date()

  if (period === 'week') {
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0
    const start = new Date(now)
    start.setDate(now.getDate() - dayOfWeek)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { startDate: start.toISOString(), endDate: end.toISOString() }
  }

  if (period === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    return { startDate: start.toISOString(), endDate: end.toISOString() }
  }

  // Default: this month
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') ?? 'month'
    const { startDate, endDate } = getPeriodDates(period)

    // Find user's team
    const { data: ownTeam } = await supabase
      .from('teams').select('id, manager_id').eq('manager_id', session.user.id).maybeSingle()

    let team: any = ownTeam
    if (!team) {
      const { data: membership } = await supabase
        .from('team_members').select('*, teams(*)')
        .eq('user_id', session.user.id).eq('status', 'active').maybeSingle()
      team = (membership?.teams as any) ?? null
    }

    if (!team) {
      return NextResponse.json({ error: '팀이 없습니다', success: false }, { status: 403 })
    }

    // Get all active members
    const { data: members } = await supabase
      .from('team_members').select('user_id').eq('team_id', team.id).eq('status', 'active')

    const memberUserIds: string[] = Array.from(new Set([
      team.manager_id,
      ...(members ?? []).map((m: any) => m.user_id),
    ]))

    // Get profiles
    const { data: profiles } = await supabase
      .rpc('get_team_member_profiles', { member_ids: memberUserIds })

    const profileMap = Object.fromEntries(
      (profiles ?? []).map((p: any) => [p.user_id, p])
    )

    const startDateOnly = startDate.split('T')[0]
    const endDateOnly = endDate.split('T')[0]

    // Get report data per member
    const reportData = await Promise.all(
      memberUserIds.map(async (uid) => {
        const [newCustomersRes, interactionsRes, remindersRes, contractsRes] = await Promise.all([
          supabase.from('customers').select('*', { count: 'exact', head: true })
            .eq('user_id', uid).is('deleted_at', null)
            .gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('interactions').select('*', { count: 'exact', head: true })
            .eq('user_id', uid)
            .gte('occurred_at', startDate).lte('occurred_at', endDate),
          supabase.from('reminders').select('id, is_done')
            .eq('user_id', uid)
            .gte('due_date', startDateOnly).lte('due_date', endDateOnly),
          supabase.from('customers').select('*', { count: 'exact', head: true })
            .eq('user_id', uid).is('deleted_at', null).ilike('stage', '%계약%')
            .gte('updated_at', startDate).lte('updated_at', endDate),
        ])

        const reminderRows = remindersRes.data ?? []
        const profile = (profileMap[uid] ?? {}) as any

        return {
          userId: uid,
          name: profile.full_name ?? profile.email?.split('@')[0] ?? '알 수 없음',
          email: profile.email ?? '',
          newCustomers: newCustomersRes.count ?? 0,
          interactions: interactionsRes.count ?? 0,
          remindersCompleted: reminderRows.filter((r: any) => r.is_done).length,
          remindersTotal: reminderRows.length,
          contracts: contractsRes.count ?? 0,
        }
      })
    )

    return NextResponse.json({
      data: { period, startDate, endDate, members: reportData },
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
