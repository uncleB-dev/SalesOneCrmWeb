import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const { data, error } = await supabase
      .from('customers')
      .select('stage')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) throw error

    const counts = (data ?? []).reduce((acc, c) => {
      acc[c.stage] = (acc[c.stage] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({ data: counts, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
