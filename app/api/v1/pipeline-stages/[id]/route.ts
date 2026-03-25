import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

// 단계 이름 수정 — customers.stage도 함께 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { name, color } = await request.json()

    const { data: stage } = await supabase
      .from('pipeline_stages')
      .select('name, user_id')
      .eq('id', id)
      .single()

    if (!stage) return NextResponse.json({ error: '단계를 찾을 수 없습니다', success: false }, { status: 404 })
    if (stage.user_id !== userId) return NextResponse.json({ error: 'Forbidden', success: false }, { status: 403 })

    const updates: Record<string, string> = {}
    if (name && name !== stage.name) updates.name = name
    if (color) updates.color = color

    const { data, error } = await supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    // 이름 변경 시 해당 단계의 모든 고객 stage 필드 동기화
    if (name && name !== stage.name) {
      await supabase
        .from('customers')
        .update({ stage: name })
        .eq('user_id', userId)
        .eq('stage', stage.name)
    }

    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    // get stage name
    const { data: stage } = await supabase
      .from('pipeline_stages')
      .select('name, user_id')
      .eq('id', id)
      .single()

    if (!stage) return NextResponse.json({ error: '단계를 찾을 수 없습니다', success: false }, { status: 404 })
    if (stage.user_id !== userId) return NextResponse.json({ error: 'Forbidden', success: false }, { status: 403 })

    // check customers
    const { count } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('stage', stage.name)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (count && count > 0) {
      return NextResponse.json({ error: '이 단계에 고객이 있어 삭제할 수 없습니다', success: false }, { status: 400 })
    }

    const { error } = await supabase.from('pipeline_stages').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
