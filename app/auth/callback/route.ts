import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PIPELINE_DEFAULTS, ESCAPE_DEFAULTS } from '@/lib/utils/constants'
import { saveGoogleRefreshToken } from '@/lib/google/token'

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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // redirect response 먼저 생성 — 세션 쿠키를 이 객체에 직접 설정
  const redirectResponse = NextResponse.redirect(new URL('/dashboard', origin))

  if (code) {
    // anon key 사용 + 쿠키를 redirectResponse에 직접 주입
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      // pipeline_stages 초기 생성은 service role client로 처리
      const adminSupabase = await createServerSupabaseClient()
      await ensureDefaultPipelineStages(adminSupabase, session.user.id)
      if (session.provider_refresh_token) {
        await saveGoogleRefreshToken(session.user.id, session.provider_refresh_token)
      }
    }
  }

  return redirectResponse
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
