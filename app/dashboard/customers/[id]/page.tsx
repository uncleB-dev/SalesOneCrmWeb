export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import CustomerDetailClient from './CustomerDetailClient'

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const [{ data: customer }, { data: stages }] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('order_index', { ascending: true }),
  ])

  if (!customer) notFound()

  const [{ data: interactions }, { data: reminders }] = await Promise.all([
    supabase
      .from('interactions')
      .select('*')
      .eq('customer_id', id)
      .order('occurred_at', { ascending: false }),
    supabase
      .from('reminders')
      .select('*')
      .eq('customer_id', id)
      .order('due_date', { ascending: true }),
  ])

  return (
    <CustomerDetailClient
      customer={customer}
      stages={stages ?? []}
      initialInteractions={interactions ?? []}
      initialReminders={reminders ?? []}
      initialTab={tab === 'reminders' ? 'reminders' : undefined}
    />
  )
}
