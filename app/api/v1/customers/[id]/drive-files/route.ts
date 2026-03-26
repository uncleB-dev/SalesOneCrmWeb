import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { getDriveFolderFiles } from '@/lib/google/drive'
import { getGoogleAccessToken } from '@/lib/google/token'

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

    const { data: customer } = await supabase
      .from('customers').select('google_drive_folder_id').eq('id', id).eq('user_id', userId).single()

    if (!customer?.google_drive_folder_id) {
      return NextResponse.json({ data: [], success: true })
    }

    // 서버가 직접 Google access token 발급 (클라이언트 토큰 불필요)
    const providerToken = await getGoogleAccessToken(userId)

    if (!providerToken) {
      // 토큰 없으면 DB 스냅샷 반환 (최초 로그인 전 또는 토큰 만료)
      const { data: snapshot } = await supabase
        .from('customer_drive_files')
        .select('*').eq('customer_id', id).order('modified_time', { ascending: false })
      return NextResponse.json({ data: snapshot ?? [], success: true })
    }

    // Drive API 호출 (실패 시 DB 스냅샷으로 폴백)
    let driveFiles = null
    let driveError = null
    try {
      driveFiles = await getDriveFolderFiles(providerToken, customer.google_drive_folder_id)
    } catch (e: any) {
      driveError = e.message
      console.warn('[drive-files] Drive API failed, falling back to snapshot:', e.message)
    }

    if (!driveFiles) {
      const { data: snapshot } = await supabase
        .from('customer_drive_files')
        .select('*').eq('customer_id', id).order('modified_time', { ascending: false })
      return NextResponse.json({ data: snapshot ?? [], success: true, warning: driveError })
    }

    const now = new Date().toISOString()
    const driveFileIds = new Set(driveFiles.map(f => f.id))

    const { data: existing } = await supabase
      .from('customer_drive_files').select('*').eq('customer_id', id)

    const deletedIds = (existing ?? [])
      .filter(e => !e.is_deleted && !driveFileIds.has(e.file_id))
      .map(e => e.file_id)

    if (deletedIds.length > 0) {
      await supabase
        .from('customer_drive_files')
        .update({ is_deleted: true, last_seen_at: now })
        .eq('customer_id', id)
        .in('file_id', deletedIds)
    }

    if (driveFiles.length > 0) {
      await supabase.from('customer_drive_files').upsert(
        driveFiles.map(f => ({
          customer_id: id,
          file_id: f.id,
          file_name: f.name,
          created_time: f.createdTime,
          modified_time: f.modifiedTime,
          last_seen_at: now,
          is_deleted: false,
        })),
        { onConflict: 'customer_id,file_id' }
      )
    }

    const { data: merged } = await supabase
      .from('customer_drive_files').select('*').eq('customer_id', id)
      .order('modified_time', { ascending: false, nullsFirst: false })

    return NextResponse.json({ data: merged ?? [], success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
