export const dynamic = 'force-dynamic'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RecordsClient from './RecordsClient'
import type { CallRecord } from '@/types'

export default async function RecordsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data } = await supabase
    .from('call_records')
    .select('*, customers(id, name, stage)')
    .eq('user_id', session.user.id)
    .order('occurred_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(20)

  const { count: unmatchedCount } = await supabase
    .from('call_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('is_matched', false)

  return (
    <RecordsClient
      initialRecords={(data ?? []) as CallRecord[]}
      initialUnmatchedCount={unmatchedCount ?? 0}
    />
  )
}
