import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google/calendar'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  try {
    const { id, rid } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const body = await request.json()
    const { data, error } = await supabase
      .from('reminders')
      .update(body)
      .eq('id', rid)
      .eq('customer_id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error

    // Google Calendar 업데이트 (due_date 또는 memo 변경 시)
    let googleWarning: string | null = null
    if (data.google_event_id && session.provider_token && (body.due_date !== undefined || body.memo !== undefined || body.start_time !== undefined)) {
      try {
        await updateCalendarEvent(session.provider_token, data.google_event_id, {
          due_date: body.due_date ?? data.due_date,
          start_time: body.start_time ?? data.start_time,
          memo: body.memo,
        })
        await supabase.from('interactions').insert({
          customer_id: id,
          user_id: userId,
          type: '기타',
          content: '📅 구글 캘린더 일정 수정됨',
          occurred_at: new Date().toISOString(),
        })
      } catch (e: any) {
        googleWarning = e.message
      }
    }

    return NextResponse.json({ data, googleWarning, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  try {
    const { id, rid } = await params
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    // Fetch before delete to get google_event_id
    const { data: reminder } = await supabase
      .from('reminders').select('google_event_id').eq('id', rid).single()

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', rid)
      .eq('customer_id', id)
      .eq('user_id', userId)
    if (error) throw error

    // Google Calendar 이벤트 삭제 (fire-and-forget)
    if (reminder?.google_event_id && session.provider_token) {
      deleteCalendarEvent(session.provider_token, reminder.google_event_id).catch(() => {})
      supabase.from('interactions').insert({
        customer_id: id,
        user_id: userId,
        type: '기타',
        content: '📅 구글 캘린더 일정 삭제됨',
        occurred_at: new Date().toISOString(),
      }).then(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
