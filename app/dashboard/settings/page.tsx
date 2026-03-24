export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // user_profiles에서 이름 조회 (이메일 가입 사용자 포함)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()

  const name = profile?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
  const email = user.email ?? ''
  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null
  const isGoogleConnected = user.identities?.some(i => i.provider === 'google') ?? false
  const googleEmail = isGoogleConnected
    ? user.identities?.find(i => i.provider === 'google')?.identity_data?.email ?? null
    : null

  return (
    <SettingsClient
      userId={user.id}
      initialName={name}
      email={email}
      avatarUrl={avatarUrl}
      isGoogleConnected={isGoogleConnected}
      googleEmail={googleEmail}
    />
  )
}
