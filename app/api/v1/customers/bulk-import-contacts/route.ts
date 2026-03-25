import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { normalizeKoreanPhone } from '@/lib/utils/phone'

export const dynamic = 'force-dynamic'

interface ContactImportRow {
  google_contact_id: string
  name: string
  phone: string
  email?: string | null
  company?: string | null
  job_title?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { contacts } = await request.json()
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: '가져올 연락처가 없습니다', success: false }, { status: 400 })
    }
    if (contacts.length > 500) {
      return NextResponse.json({ error: '한 번에 최대 500건까지 가져올 수 있습니다', success: false }, { status: 400 })
    }

    const { data: stages, error: stagesError } = await supabase
      .from('pipeline_stages')
      .select('name')
      .eq('user_id', userId)
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

    for (const contact of contacts as ContactImportRow[]) {
      if (!contact.name || !contact.google_contact_id) { skipped++; continue }
      const phone = normalizeKoreanPhone(contact.phone)
      if (!phone) { skipped++; continue }

      const email = contact.email
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ? contact.email : null
        : null

      toInsert.push({
        user_id: userId,
        name: contact.name.trim(),
        phone,
        email,
        company: contact.company || null,
        job_title: contact.job_title || null,
        stage: firstStage,
        source: '일반',
        tags: [],
        google_contact_id: contact.google_contact_id,
        is_google_contact_synced: true,
      })
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, imported: 0, skipped })
    }

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
