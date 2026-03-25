import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { items } = await request.json()
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다', success: false }, { status: 400 })
    }

    const updates = items.map((item: { id: string; order_index: number }) =>
      supabase
        .from('customers')
        .update({ order_index: item.order_index })
        .eq('id', item.id)
        .eq('user_id', userId)
    )
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
