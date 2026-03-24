import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { normalizeKoreanPhone } from '@/lib/utils/phone'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const rowSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const { rows } = await request.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: '가져올 데이터가 없습니다', success: false }, { status: 400 })
    }
    if (rows.length > 1000) {
      return NextResponse.json({ error: '한 번에 최대 1,000건까지 가져올 수 있습니다', success: false }, { status: 400 })
    }

    // 첫 번째 파이프라인 단계 조회
    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('name')
      .eq('user_id', session.user.id)
      .eq('stage_type', 'pipeline')
      .order('order_index', { ascending: true })
      .limit(1)
    if (stagesError) throw stagesError
    const firstStage = stages?.[0]?.name
    if (!firstStage) {
      return NextResponse.json({ error: '파이프라인 단계가 없습니다', success: false }, { status: 400 })
    }

    const toInsert: any[] = []
    let skipped = 0

    for (const row of rows) {
      const parsed = rowSchema.safeParse(row)
      if (!parsed.success) { skipped++; continue }

      const phone = normalizeKoreanPhone(parsed.data.phone)
      if (!phone) { skipped++; continue }

      // 이메일 유효성 간단 체크 (형식 틀려도 null 처리)
      const email = parsed.data.email
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email) ? parsed.data.email : null
        : null

      toInsert.push({
        user_id: session.user.id,
        name: parsed.data.name.trim(),
        phone,
        email,
        company: parsed.data.company || null,
        job_title: parsed.data.job_title || null,
        address: parsed.data.address || null,
        memo: parsed.data.memo || null,
        stage: firstStage,
        source: '일반',
        tags: [],
        is_google_contact_synced: false,
      })
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, imported: 0, skipped })
    }

    // 100건 단위 배치 insert
    const BATCH = 100
    let imported = 0
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const batch = toInsert.slice(i, i + BATCH)
      const { error } = await supabase.from('customers').insert(batch)
      if (error) throw error
      imported += batch.length
    }

    return NextResponse.json({ success: true, imported, skipped })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
