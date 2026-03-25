import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { PIPELINE_DEFAULTS, ESCAPE_DEFAULTS } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

// 이메일 회원가입 직후 기본 파이프라인 단계 생성
export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ success: false }, { status: 401 })
    const { supabase, userId } = auth

    const { count } = await supabase
      .from('pipeline_stages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) === 0) {
      const stages = [
        ...PIPELINE_DEFAULTS.map(s => ({
          ...s,
          user_id: userId,
          stage_type: 'pipeline' as const,
          is_default: true,
        })),
        ...ESCAPE_DEFAULTS.map(s => ({
          ...s,
          user_id: userId,
          stage_type: 'escape' as const,
          is_default: true,
        })),
      ]
      await supabase.from('pipeline_stages').insert(stages)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
