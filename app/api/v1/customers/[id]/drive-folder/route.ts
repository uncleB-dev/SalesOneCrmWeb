import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { createDriveFolder } from '@/lib/google/drive'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token ?? null

    if (!providerToken) {
      return NextResponse.json({ error: 'Google 인증이 필요합니다. 재로그인해주세요.', success: false }, { status: 401 })
    }

    const { data: customer, error: fetchError } = await supabase
      .from('customers').select('name, google_drive_folder_id').eq('id', id).eq('user_id', userId).single()
    if (fetchError || !customer) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다', success: false }, { status: 404 })
    }

    if (customer.google_drive_folder_id) {
      return NextResponse.json({ error: '이미 드라이브 폴더가 연결되어 있습니다', success: false }, { status: 400 })
    }

    const folderId = await createDriveFolder(providerToken, customer.name)

    const { data: updated, error } = await supabase
      .from('customers')
      .update({ google_drive_folder_id: folderId })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error

    await supabase.from('interactions').insert({
      customer_id: id,
      user_id: userId,
      type: '기타',
      content: '📁 구글 드라이브 폴더 생성됨',
      occurred_at: new Date().toISOString(),
    })

    return NextResponse.json({ data: updated, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
