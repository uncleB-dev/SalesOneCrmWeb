import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const requesterId = userId

    // Find requester's team
    const { data: ownTeam } = await supabase
      .from('teams').select('id, manager_id').eq('manager_id', requesterId).maybeSingle()

    let teamId: string | null = ownTeam?.id ?? null

    if (!teamId) {
      const { data: membership } = await supabase
        .from('team_members').select('team_id')
        .eq('user_id', requesterId).eq('status', 'active').maybeSingle()
      teamId = membership?.team_id ?? null
    }

    if (!teamId) {
      return NextResponse.json({ error: '팀이 없습니다', success: false }, { status: 403 })
    }

    // Verify target is in the same team
    const { data: team } = await supabase
      .from('teams').select('manager_id').eq('id', teamId).single()

    const isTargetManager = team?.manager_id === targetUserId

    if (!isTargetManager) {
      const { count } = await supabase
        .from('team_members').select('*', { count: 'exact', head: true })
        .eq('team_id', teamId).eq('user_id', targetUserId).eq('status', 'active')

      if (!count || count === 0) {
        return NextResponse.json({ error: '같은 팀원이 아닙니다', success: false }, { status: 403 })
      }
    }

    // Fetch target member's pipeline data
    const [{ data: stages }, { data: customers }] = await Promise.all([
      supabase.from('pipeline_stages').select('*')
        .eq('user_id', targetUserId).order('order_index', { ascending: true }),
      supabase.from('customers').select('*')
        .eq('user_id', targetUserId).is('deleted_at', null).order('order_index', { ascending: true }),
    ])

    const pipelineStages = (stages ?? []).filter((s: any) => s.stage_type === 'pipeline')
    const escapeStages = (stages ?? []).filter((s: any) => s.stage_type === 'escape')

    const buildColumns = (stageList: typeof pipelineStages) =>
      stageList.map(stage => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        customers: (customers ?? []).filter((c: any) => c.stage === stage.name),
      }))

    return NextResponse.json({
      data: {
        pipeline: buildColumns(pipelineStages),
        escape: buildColumns(escapeStages),
      },
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
