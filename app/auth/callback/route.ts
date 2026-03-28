import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { saveGoogleRefreshToken } from '@/lib/google/token'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // 쿠키를 버퍼에 수집한 뒤 destination 확정 후 redirect에 적용
  const cookiesBuffer: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  let destination = '/onboarding'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(c => cookiesBuffer.push(c))
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      if (session.provider_refresh_token) {
        await saveGoogleRefreshToken(session.user.id, session.provider_refresh_token)
      }

      const adminSupabase = await createServerSupabaseClient()
      const { data: profile } = await adminSupabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      if (profile?.onboarding_completed) {
        destination = '/dashboard'
      }
    }
  }

  const redirectResponse = NextResponse.redirect(new URL(destination, origin))
  cookiesBuffer.forEach(({ name, value, options }) =>
    redirectResponse.cookies.set(name, value, options as Parameters<typeof redirectResponse.cookies.set>[2])
  )

  // 온보딩 완료 사용자는 쿠키로 미들웨어 DB 쿼리 스킵
  if (destination === '/dashboard') {
    redirectResponse.cookies.set('sb-onboarding-completed', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return redirectResponse
}
