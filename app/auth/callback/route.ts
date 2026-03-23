import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PIPELINE_DEFAULTS, ESCAPE_DEFAULTS } from '@/lib/utils/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      // 첫 로그인 감지: pipeline_stages 레코드 수 확인
      const { count } = await supabase
        .from('pipeline_stages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      if (count === 0) {
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
    }
  }

  return NextResponse.redirect(new URL('/dashboard', origin))
}
