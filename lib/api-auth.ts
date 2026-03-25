import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from './supabase-server'

/**
 * 웹(쿠키)과 모바일(Bearer 토큰) 인증을 모두 지원하는 통합 인증 헬퍼
 */
export async function getApiAuth(request: NextRequest) {
  // 1. Bearer 토큰 (Android 앱)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) return { supabase, userId: user.id }
  }

  // 2. 쿠키 세션 (웹)
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return { supabase, userId: session.user.id }

  return null
}
