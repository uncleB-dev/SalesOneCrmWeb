import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const stageType = request.nextUrl.searchParams.get('stage_type') || 'all'

    let query = supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (stageType !== 'all') {
      query = query.eq('stage_type', stageType)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const body = await request.json()
    const { stages } = body

    if (!Array.isArray(stages)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다', success: false }, { status: 400 })
    }

    // pipeline type validation
    const pipelineStages = stages.filter((s: any) => s.stage_type === 'pipeline')
    const escapeStages = stages.filter((s: any) => s.stage_type === 'escape')
    if (pipelineStages.length < 1 || pipelineStages.length > 20) {
      return NextResponse.json({ error: '영업 파이프라인은 1~20개여야 합니다', success: false }, { status: 400 })
    }
    if (escapeStages.length < 1) {
      return NextResponse.json({ error: '이탈 관리는 최소 1개여야 합니다', success: false }, { status: 400 })
    }

    const stagesToUpsert = stages.map((s: any) => ({
      id: s.id && !s.id.startsWith('new-') ? s.id : undefined,
      user_id: userId,
      name: s.name,
      color: s.color,
      order_index: s.order_index,
      stage_type: s.stage_type,
      is_default: s.is_default || false,
    }))

    const { data, error } = await supabase
      .from('pipeline_stages')
      .upsert(stagesToUpsert, { onConflict: 'id' })
      .select()
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
