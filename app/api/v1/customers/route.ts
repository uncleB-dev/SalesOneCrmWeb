import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { z } from 'zod'
import { createGoogleContact } from '@/lib/google/contacts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

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
      .eq('user_id', userId)
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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return phone
}

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^010-?\d{4}-?\d{4}$/).transform(normalizePhone),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  birth_date: z.string().optional().nullable(),
  gender: z.enum(['남', '여']).optional().nullable(),
  stage: z.string().min(1),
  source: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  is_google_contact_synced: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })
    }

    const { is_google_contact_synced, ...customerFields } = parsed.data

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({ ...customerFields, is_google_contact_synced, user_id: userId })
      .select()
      .single()
    if (error) throw error

    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token ?? null

    // Google Contacts 연동
    let googleWarning: string | null = null
    if (is_google_contact_synced && providerToken) {
      try {
        const contactId = await createGoogleContact(providerToken, customer)
        await supabase.from('customers').update({ google_contact_id: contactId }).eq('id', customer.id)
        customer.google_contact_id = contactId
        await supabase.from('interactions').insert({
          customer_id: customer.id,
          user_id: userId,
          type: '기타',
          content: '📇 구글 주소록 등록됨',
          occurred_at: new Date().toISOString(),
        })
      } catch (e: any) {
        googleWarning = e.message
      }
    }

    return NextResponse.json({ data: customer, googleWarning, success: true }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
