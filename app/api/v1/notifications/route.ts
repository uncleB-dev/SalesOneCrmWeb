import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

// GET: 알림 목록 (팀 알림 + 오늘/기한 초과 리마인더)
export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const todayStr = new Date().toISOString().split('T')[0]

    const [teamNotifResult, reminderResult] = await Promise.all([
      // 팀 알림
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),

      // 오늘 및 기한 초과 미완료 리마인더
      supabase
        .from('reminders')
        .select('*, customers(id, name)')
        .eq('user_id', userId)
        .eq('is_done', false)
        .lte('due_date', todayStr)
        .order('due_date', { ascending: true })
        .limit(20),
    ])

    const teamNotifications = (teamNotifResult.data ?? []).map(n => ({
      ...n,
      source: 'team' as const,
    }))

    const reminderNotifications = (reminderResult.data ?? []).map(r => ({
      id: `reminder-${r.id}`,
      user_id: userId,
      type: 'reminder' as const,
      is_read: false,
      created_at: r.created_at,
      source: 'reminder' as const,
      reminder: {
        id: r.id,
        customer_id: r.customer_id,
        customer_name: r.customers?.name ?? '알 수 없음',
        due_date: r.due_date,
        memo: r.memo,
        is_overdue: r.due_date < todayStr,
      },
    }))

    const unreadCount = teamNotifications.filter(n => !n.is_read).length + reminderNotifications.length

    return NextResponse.json({
      data: { teamNotifications, reminderNotifications, unreadCount },
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

// PATCH: 팀 알림 전체 읽음 처리
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
