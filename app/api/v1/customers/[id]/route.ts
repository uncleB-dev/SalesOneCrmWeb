import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { z } from 'zod'
import { updateGoogleContact, deleteGoogleContact } from '@/lib/google/contacts'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
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
  address: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  is_blacklist: z.boolean().optional(),
  is_google_contact_synced: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })

    const { data, error } = await supabase
      .from('customers')
      .update(parsed.data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error

    // Google Contacts 업데이트
    let googleWarning: string | null = null
    if (data.google_contact_id && data.is_google_contact_synced && session.provider_token) {
      try {
        await updateGoogleContact(session.provider_token, data.google_contact_id, data)
        await supabase.from('interactions').insert({
          customer_id: id,
          user_id: userId,
          type: '기타',
          content: '📇 구글 주소록 업데이트됨',
          occurred_at: new Date().toISOString(),
        })
      } catch (e: any) {
        googleWarning = e.message
      }
    }

    return NextResponse.json({ data, googleWarning, success: true })
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
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    // Fetch before deleting to get google_contact_id
    const { data: customer } = await supabase
      .from('customers').select('google_contact_id').eq('id', id).eq('user_id', userId).single()

    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error

    // Google Contacts 삭제 (fire-and-forget)
    if (customer?.google_contact_id && session.provider_token) {
      deleteGoogleContact(session.provider_token, customer.google_contact_id).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
