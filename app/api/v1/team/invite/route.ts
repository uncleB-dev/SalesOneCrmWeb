import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { data: team } = await supabase
      .from('teams').select('id').eq('manager_id', userId).maybeSingle()

    if (!team) {
      return NextResponse.json({ error: '팀이 없거나 권한이 없습니다', success: false }, { status: 403 })
    }

    const { data: code } = await supabase
      .from('team_invite_codes')
      .select('*')
      .eq('team_id', team.id)
      .eq('is_active', true)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ data: code, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const { data: team } = await supabase
      .from('teams').select('id').eq('manager_id', userId).maybeSingle()

    if (!team) {
      return NextResponse.json({ error: '팀이 없거나 권한이 없습니다', success: false }, { status: 403 })
    }

    // Deactivate existing codes
    await supabase
      .from('team_invite_codes')
      .update({ is_active: false })
      .eq('team_id', team.id)
      .eq('is_active', true)

    // Generate 8-char uppercase code
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const code = (part1 + part2).replace(/[^A-Z0-9]/g, '0').substring(0, 8)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: inviteCode, error } = await supabase
      .from('team_invite_codes')
      .insert({
        team_id: team.id,
        code,
        created_by: userId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data: inviteCode, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
