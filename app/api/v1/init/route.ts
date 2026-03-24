import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PIPELINE_DEFAULTS, ESCAPE_DEFAULTS } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

// 이메일 회원가입 직후 기본 파이프라인 단계 생성
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ success: false }, { status: 401 })

    const { count } = await supabase
      .from('pipeline_stages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if ((count ?? 0) === 0) {
      const stages = [
        ...PIPELINE_DEFAULTS.map(s => ({
          ...s,
          user_id: session.user.id,
          stage_type: 'pipeline' as const,
          is_default: true,
        })),
        ...ESCAPE_DEFAULTS.map(s => ({
          ...s,
          user_id: session.user.id,
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
