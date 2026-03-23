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

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .single()
    if (error || !customer) return NextResponse.json({ error: '고객을 찾을 수 없습니다', success: false }, { status: 404 })

    const [{ data: interactions }, { data: reminders }] = await Promise.all([
      supabase
        .from('interactions')
        .select('*')
        .eq('customer_id', id)
        .order('occurred_at', { ascending: false }),
      supabase
        .from('reminders')
        .select('*')
        .eq('customer_id', id)
        .order('due_date', { ascending: true }),
    ])

    return NextResponse.json({ data: { ...customer, interactions: interactions ?? [], reminders: reminders ?? [] }, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/).optional(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.enum(['남', '여']).optional().nullable(),
  stage: z.string().optional(),
  source: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  is_blacklist: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })

    const { data, error } = await supabase
      .from('customers')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', session.user.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
