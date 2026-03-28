import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 보호된 경로 처리
  if (pathname.startsWith('/dashboard') || pathname === '/onboarding') {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // 온보딩 완료 여부 확인 (쿠키 우선, 없으면 DB 쿼리)
    const doneCookie = request.cookies.get('sb-onboarding-completed')?.value
    let isCompleted = doneCookie === '1'

    if (!isCompleted) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()
      isCompleted = profile?.onboarding_completed === true
    }

    if (pathname.startsWith('/dashboard') && !isCompleted) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    if (pathname === '/onboarding' && isCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 이미 로그인한 사용자가 /auth 접근 시 /dashboard로 리다이렉트
  if (pathname === '/auth') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/auth'],
}
