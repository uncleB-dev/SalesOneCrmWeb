import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('customer_id', id)
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true })
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

const reminderSchema = z.object({
  due_date: z.string().min(1),
  memo: z.string().optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const body = await request.json()
    const parsed = reminderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })

    const { data, error } = await supabase
      .from('reminders')
      .insert({ ...parsed.data, customer_id: id, user_id: session.user.id })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
