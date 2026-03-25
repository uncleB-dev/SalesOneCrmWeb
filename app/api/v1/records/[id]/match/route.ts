import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { customer_id } = await request.json()
    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id is required', success: false }, { status: 400 })
    }

    // 기록 조회 (소유자 확인)
    const { data: record, error: fetchError } = await supabase
      .from('call_records')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (fetchError || !record) {
      return NextResponse.json({ error: '기록을 찾을 수 없습니다', success: false }, { status: 404 })
    }

    // 고객 존재 확인
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()
    if (custError || !customer) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다', success: false }, { status: 404 })
    }

    // 기록 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('call_records')
      .update({ customer_id, is_matched: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (updateError) throw updateError

    // interactions에 자동 기록
    const content = [
      record.summary ? record.summary.slice(0, 200) : null,
      record.action_items ? `액션: ${record.action_items}` : null,
      record.sentiment ? `분위기: ${record.sentiment}` : null,
    ].filter(Boolean).join('\n')

    await supabase.from('interactions').insert({
      user_id: userId,
      customer_id,
      type: '전화',
      content: `🤖 AI 통화요약\n${content}`,
      duration: record.duration ?? null,
      occurred_at: record.occurred_at ?? new Date().toISOString(),
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
