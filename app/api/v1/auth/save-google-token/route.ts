import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { saveGoogleRefreshToken } from '@/lib/google/token'

export const dynamic = 'force-dynamic'

// Android 앱이 Google 로그인 후 refresh token을 서버에 저장하는 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { userId } = auth

    const { refreshToken } = await request.json()
    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json({ error: 'refreshToken is required', success: false }, { status: 400 })
    }

    await saveGoogleRefreshToken(userId, refreshToken)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
