import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { z } from 'zod'

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

    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('customer_id', id)
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

const interactionSchema = z.object({
  type: z.enum(['전화', '문자', '이메일', '방문', '화상', '기타']),
  content: z.string().optional().nullable(),
  duration: z.number().min(0).optional().nullable(),
  occurred_at: z.string().optional(),
  stage_changed_to: z.string().optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
    const { supabase, userId } = auth

    const body = await request.json()
    const parsed = interactionSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten(), success: false }, { status: 400 })

    const { data, error } = await supabase
      .from('interactions')
      .insert({ ...parsed.data, customer_id: id, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
