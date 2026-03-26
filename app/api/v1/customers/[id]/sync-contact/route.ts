import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'
import { createGoogleContact } from '@/lib/google/contacts'
import { getGoogleAccessToken } from '@/lib/google/token'

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
    const providerToken = session?.provider_token ?? await getGoogleAccessToken(userId)

    if (!providerToken) {
      return NextResponse.json({ error: '구글 로그인이 필요합니다. 재로그인 후 시도해주세요.', success: false }, { status: 400 })
    }

    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()
    if (fetchError || !customer) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.', success: false }, { status: 404 })
    }

    const googleContactId = await createGoogleContact(providerToken, customer)

    const { data: updated, error: updateError } = await supabase
      .from('customers')
      .update({ google_contact_id: googleContactId, is_google_contact_synced: true })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw updateError

    await supabase.from('interactions').insert({
      customer_id: id,
      user_id: userId,
      type: '기타',
      content: '📇 구글 주소록에 등록되었습니다',
      occurred_at: new Date().toISOString(),
    })

    return NextResponse.json({ data: updated, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
