export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const [{ data: customers, count: total }, { data: allStages }, { data: stages }] = await Promise.all([
    supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(0, 49),
    supabase
      .from('customers')
      .select('stage')
      .eq('user_id', session.user.id)
      .is('deleted_at', null),
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('order_index', { ascending: true }),
  ])

  const stageCounts = (allStages ?? []).reduce((acc, c) => {
    acc[c.stage] = (acc[c.stage] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <CustomersClient
      initialCustomers={customers ?? []}
      initialTotal={total ?? 0}
      initialStageCounts={stageCounts}
      stages={stages ?? []}
    />
  )
}
