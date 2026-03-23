import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const sp = request.nextUrl.searchParams
    const search = sp.get('search') || ''
    const stage = sp.get('stage') || ''
    const sortField = sp.get('sort_field') || 'created_at'
    const sortOrder = sp.get('sort_order') || 'desc'
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '50')
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .is('deleted_at', null)

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (stage && stage !== '전체') {
      query = query.eq('stage', stage)
    }

    const allowedSorts = ['name', 'stage', 'created_at', 'updated_at']
    const safeSort = allowedSorts.includes(sortField) ? sortField : 'created_at'
    query = query
      .order(safeSort, { ascending: sortOrder === 'asc' })
      .range(from, to)

    const { data, count, error } = await query
    if (error) throw error
    return NextResponse.json({ data, total: count ?? 0, page, limit, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.enum(['남', '여']).optional().nullable(),
  stage: z.string().min(1),
  source: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({ ...parsed.data, user_id: session.user.id })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
