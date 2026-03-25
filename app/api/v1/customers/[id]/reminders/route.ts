import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { z } from 'zod'
import { createCalendarEvent } from '@/lib/google/calendar'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('customer_id', id)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

const reminderSchema = z.object({
  due_date: z.string().min(1),
  start_time: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const body = await request.json()
    const parsed = reminderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({ ...parsed.data, customer_id: id, user_id: userId })
      .select()
      .single()
    if (error) throw error

    // Google Calendar 이벤트 생성
    let googleWarning: string | null = null
    if (session.provider_token) {
      try {
        const { data: customer } = await supabase
          .from('customers').select('name').eq('id', id).single()
        const eventId = await createCalendarEvent(session.provider_token, reminder, customer?.name ?? '고객')
        await supabase.from('reminders').update({ google_event_id: eventId }).eq('id', reminder.id)
        reminder.google_event_id = eventId
        await supabase.from('interactions').insert({
          customer_id: id,
          user_id: userId,
          type: '기타',
          content: '📅 구글 캘린더 일정 생성됨',
          occurred_at: new Date().toISOString(),
        })
      } catch (e: any) {
        googleWarning = e.message
      }
    }

    return NextResponse.json({ data: reminder, googleWarning, success: true }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
