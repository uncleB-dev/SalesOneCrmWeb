import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { JOB_STAGE_DEFAULTS, STAGE_COLORS, ESCAPE_DEFAULTS, type JobType } from '@/lib/onboarding'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const body = await request.json()
    const {
      name,
      phone_number,
      job_type,
      agreed_terms,
      agreed_privacy,
      agreed_consignment,
      agreed_marketing,
    } = body

    if (!name || !phone_number || !job_type) {
      return NextResponse.json({ error: '필수 정보를 모두 입력해주세요', success: false }, { status: 400 })
    }
    if (!agreed_terms || !agreed_privacy || !agreed_consignment) {
      return NextResponse.json({ error: '필수 약관에 동의해주세요', success: false }, { status: 400 })
    }
    if (!(job_type in JOB_STAGE_DEFAULTS)) {
      return NextResponse.json({ error: '유효하지 않은 직종입니다', success: false }, { status: 400 })
    }

    // 1. user_profiles 업데이트
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        name,
        phone_number,
        job_type,
        agreed_terms,
        agreed_privacy,
        agreed_consignment,
        agreed_marketing: agreed_marketing ?? false,
        agreed_at: new Date().toISOString(),
        terms_version: 'v1.0',
        onboarding_completed: true,
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // 2. 직종별 파이프라인 단계 생성
    const stageNames = JOB_STAGE_DEFAULTS[job_type as JobType]
    const pipelineStages = stageNames.map((stageName, i) => ({
      user_id: userId,
      name: stageName,
      color: STAGE_COLORS[i] ?? STAGE_COLORS[0],
      order_index: i,
      stage_type: 'pipeline' as const,
      is_default: true,
    }))
    const escapeStages = ESCAPE_DEFAULTS.map(s => ({
      ...s,
      user_id: userId,
      stage_type: 'escape' as const,
      is_default: true,
    }))

    const { error: stagesError } = await supabase
      .from('pipeline_stages')
      .insert([...pipelineStages, ...escapeStages])

    if (stagesError) throw stagesError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
