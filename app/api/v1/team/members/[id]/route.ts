import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

// PATCH: Change member role (manager only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    if (targetUserId === userId) {
      return NextResponse.json({ error: '자신의 역할은 변경할 수 없습니다', success: false }, { status: 400 })
    }

    // Verify requester is team manager
    const { data: team } = await supabase
      .from('teams').select('id').eq('manager_id', userId).maybeSingle()
    if (!team) {
      return NextResponse.json({ error: '팀장 권한이 없습니다', success: false }, { status: 403 })
    }

    const { role } = await request.json()
    if (!['manager', 'member'].includes(role)) {
      return NextResponse.json({ error: '유효하지 않은 역할입니다', success: false }, { status: 400 })
    }

    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', team.id)
      .eq('user_id', targetUserId)
      .eq('status', 'active')

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

// DELETE: Remove member (manager) or self-leave
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const isSelf = targetUserId === userId

    if (isSelf) {
      // Self-leave
      const { data: member } = await supabase
        .from('team_members').select('id').eq('user_id', userId).eq('status', 'active').maybeSingle()
      if (!member) {
        return NextResponse.json({ error: '팀원 정보를 찾을 수 없습니다', success: false }, { status: 404 })
      }
      await supabase.from('team_members').delete().eq('id', member.id)
      return NextResponse.json({ success: true })
    }

    // Manager removing a member
    const { data: team } = await supabase
      .from('teams').select('id').eq('manager_id', userId).maybeSingle()
    if (!team) {
      return NextResponse.json({ error: '팀장 권한이 없습니다', success: false }, { status: 403 })
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', team.id)
      .eq('user_id', targetUserId)

    if (error) throw error

    // Notify removed member
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      from_user_id: userId,
      type: 'team_disconnected',
      team_id: team.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
