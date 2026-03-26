import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * 저장된 Google refresh token으로 새 access token을 발급합니다.
 * 웹/앱 모두 로그인 상태라면 항상 유효한 token을 반환합니다.
 */
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  // 1. DB에서 refresh token 조회
  const { data, error } = await supabaseAdmin
    .from('user_google_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single()

  if (error || !data?.refresh_token) {
    console.warn('[google/token] No stored refresh token for user:', userId)
    return null
  }

  // 2. Google OAuth2 token endpoint에 refresh_token 교환 요청
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[google/token] Token refresh failed:', err)
    return null
  }

  const tokens = await res.json()
  return tokens.access_token ?? null
}

/**
 * 사용자의 Google refresh token을 DB에 저장합니다.
 * 웹 OAuth 콜백 또는 Android 앱 로그인 후 호출됩니다.
 */
export async function saveGoogleRefreshToken(userId: string, refreshToken: string): Promise<void> {
  await supabaseAdmin
    .from('user_google_tokens')
    .upsert({
      user_id: userId,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
}
