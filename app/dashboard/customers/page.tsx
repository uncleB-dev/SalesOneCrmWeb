export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const [{ data: customers }, { data: stages }] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('order_index', { ascending: true }),
  ])

  return <CustomersClient initialCustomers={customers ?? []} stages={stages ?? []} />
}
