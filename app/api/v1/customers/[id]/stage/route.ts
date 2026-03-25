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

    const { stage } = await request.json()
    if (!stage) return NextResponse.json({ error: '단계를 입력하세요', success: false }, { status: 400 })

    // verify stage exists in user's pipeline_stages
    const { data: stageRecord } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('user_id', userId)
      .eq('name', stage)
      .single()
    if (!stageRecord) return NextResponse.json({ error: '존재하지 않는 단계입니다', success: false }, { status: 400 })

    const { data, error } = await supabase
      .from('customers')
      .update({ stage })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error

    // auto create interaction record
    await supabase.from('interactions').insert({
      customer_id: id,
      user_id: userId,
      type: '기타',
      content: `단계 변경: ${data.stage} → ${stage}`,
      stage_changed_to: stage,
    })

    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
