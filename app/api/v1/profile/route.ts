import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    // user_profiles 조회 (없으면 자동 생성)
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const { data: created } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        })
        .select()
        .single()
      profile = created
    }

    const isGoogleConnected = user.identities?.some(i => i.provider === 'google') ?? false

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        email: user.email,
        is_google_connected: isGoogleConnected,
        google_email: isGoogleConnected
          ? user.identities?.find(i => i.provider === 'google')?.identity_data?.email ?? null
          : null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })

    const body = await request.json()
    const { name, phone } = body

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single()
    if (error) throw error

    // auth.users metadata도 동기화
    if (name !== undefined) {
      await supabase.auth.updateUser({ data: { full_name: name, name } })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
