import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { normalizeKoreanPhone } from '@/lib/utils/phone'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const { searchParams } = request.nextUrl
    const customerId = searchParams.get('customer_id')
    const isMatched = searchParams.get('is_matched')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('call_records')
      .select('*, customers(id, name, stage)', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (customerId) query = query.eq('customer_id', customerId)
    if (isMatched !== null) query = query.eq('is_matched', isMatched === 'true')

    const { data, error, count } = await query
    if (error) throw error

    const { count: unmatchedCount } = await supabase
      .from('call_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_matched', false)

    return NextResponse.json({
      success: true,
      data: data ?? [],
      total: count ?? 0,
      unmatched_count: unmatchedCount ?? 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const body = await request.json()
    const { file_name, phone_number, occurred_at, duration, summary, action_items, sentiment, raw_text } = body

    if (!file_name) {
      return NextResponse.json({ error: 'file_name is required', success: false }, { status: 400 })
    }

    // 전화번호로 고객 매칭 시도
    let customerId: string | null = null
    let isMatched = false

    if (phone_number) {
      const normalized = normalizeKoreanPhone(phone_number)
      const phoneToSearch = normalized ?? phone_number
      const { data: matchedCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('phone', phoneToSearch)
        .is('deleted_at', null)
        .single()

      if (matchedCustomer) {
        customerId = matchedCustomer.id
        isMatched = true
      }
    }

    const { data: record, error } = await supabase
      .from('call_records')
      .insert({
        user_id: session.user.id,
        customer_id: customerId,
        file_name,
        phone_number: phone_number ?? null,
        occurred_at: occurred_at ?? null,
        duration: duration ?? null,
        summary: summary ?? null,
        action_items: action_items ?? null,
        sentiment: sentiment ?? null,
        raw_text: raw_text ?? null,
        is_matched: isMatched,
      })
      .select()
      .single()
    if (error) throw error

    // 고객 매칭 성공 시 interactions에도 자동 기록
    if (customerId && isMatched) {
      const content = [
        summary ? summary.slice(0, 200) : null,
        action_items ? `액션: ${action_items}` : null,
        sentiment ? `분위기: ${sentiment}` : null,
      ].filter(Boolean).join('\n')

      await supabase.from('interactions').insert({
        user_id: session.user.id,
        customer_id: customerId,
        type: '전화',
        content: `🤖 AI 통화요약\n${content}`,
        duration: duration ?? null,
        occurred_at: occurred_at ?? new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, data: record }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
