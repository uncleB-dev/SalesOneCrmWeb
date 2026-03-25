import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') ?? 'all'

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekEndStr = weekEnd.toISOString().split('T')[0]

    let query = supabase
      .from('reminders')
      .select('*, customers(id, name, stage)')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (filter === 'today') {
      query = query.eq('due_date', todayStr)
    } else if (filter === 'week') {
      query = query.gte('due_date', todayStr).lte('due_date', weekEndStr)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
