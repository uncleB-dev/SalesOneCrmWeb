import { NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { code } = await request.json()
    if (!code?.trim()) {
      return NextResponse.json({ error: '초대 코드를 입력해주세요', success: false }, { status: 400 })
    }

    // Find valid invite code
    const { data: inviteCode } = await supabase
      .from('team_invite_codes')
      .select('*, teams(*)')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!inviteCode) {
      return NextResponse.json({ error: '유효하지 않거나 만료된 초대 코드입니다', success: false }, { status: 400 })
    }

    // Check if user already manages a team
    const { count: ownCount } = await supabase
      .from('teams').select('*', { count: 'exact', head: true })
      .eq('manager_id', userId)
    if (ownCount && ownCount > 0) {
      return NextResponse.json({ error: '이미 팀장으로 있는 팀이 있습니다', success: false }, { status: 400 })
    }

    // Check if already an active member
    const { count: memberCount } = await supabase
      .from('team_members').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'active')
    if (memberCount && memberCount > 0) {
      return NextResponse.json({ error: '이미 팀에 속해있습니다', success: false }, { status: 400 })
    }

    // Join team
    const { error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: inviteCode.team_id,
        user_id: userId,
        role: 'member',
        status: 'active',
        invited_by: inviteCode.created_by,
        joined_at: new Date().toISOString(),
      })

    if (joinError) throw joinError

    // Mark code as used
    await supabase
      .from('team_invite_codes')
      .update({ used_at: new Date().toISOString(), used_by: userId, is_active: false })
      .eq('id', inviteCode.id)

    // Notify team manager
    const team = inviteCode.teams as any
    if (team?.manager_id) {
      await supabase.from('notifications').insert({
        user_id: team.manager_id,
        from_user_id: userId,
        type: 'team_accepted',
        team_id: inviteCode.team_id,
      })
    }

    return NextResponse.json({ data: { team_id: inviteCode.team_id }, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
