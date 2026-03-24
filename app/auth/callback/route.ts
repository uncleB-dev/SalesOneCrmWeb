import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PIPELINE_DEFAULTS, ESCAPE_DEFAULTS } from '@/lib/utils/constants'

async function ensureDefaultPipelineStages(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, userId: string) {
  const { count } = await supabase
    .from('pipeline_stages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (count === 0) {
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
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      await ensureDefaultPipelineStages(supabase, session.user.id)
    }
  }

  return NextResponse.redirect(new URL('/dashboard', origin))
}

// 이메일 회원가입 직후 파이프라인 단계 생성을 위한 POST 핸들러
export async function POST(request: Request) {
  const { origin } = new URL(request.url)
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      await ensureDefaultPipelineStages(supabase, session.user.id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
