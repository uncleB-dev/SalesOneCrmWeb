import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getDriveFolderFiles } from '@/lib/google/drive'

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

    const { data: customer } = await supabase
      .from('customers').select('google_drive_folder_id').eq('id', id).eq('user_id', session.user.id).single()

    if (!customer?.google_drive_folder_id) {
      return NextResponse.json({ data: [], success: true })
    }

    if (!session.provider_token) {
      // Return only snapshot from DB if no token
      const { data: snapshot } = await supabase
        .from('customer_drive_files')
        .select('*').eq('customer_id', id).order('modified_time', { ascending: false })
      return NextResponse.json({ data: snapshot ?? [], success: true })
    }

    // Fetch current files from Drive
    const driveFiles = await getDriveFolderFiles(session.provider_token, customer.google_drive_folder_id)
    const now = new Date().toISOString()
    const driveFileIds = new Set(driveFiles.map(f => f.id))

    // Get existing snapshot
    const { data: existing } = await supabase
      .from('customer_drive_files').select('*').eq('customer_id', id)

    // Mark deleted files
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

    // Upsert current files
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

    // Return merged snapshot
    const { data: merged } = await supabase
      .from('customer_drive_files').select('*').eq('customer_id', id)
      .order('modified_time', { ascending: false, nullsFirst: false })

    return NextResponse.json({ data: merged ?? [], success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
