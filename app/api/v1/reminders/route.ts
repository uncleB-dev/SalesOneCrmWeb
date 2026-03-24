import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

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
      .eq('user_id', session.user.id)
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
