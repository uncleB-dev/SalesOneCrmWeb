export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import RemindersClient from './RemindersClient'

type FilterType = 'today' | 'week' | 'all'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function RemindersPage({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams
  const filter: FilterType = (['today', 'week', 'all'].includes(rawFilter ?? '') ? rawFilter : 'all') as FilterType

  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  let query = supabase
    .from('reminders')
    .select('*, customers(id, name, stage)')
    .eq('user_id', session.user.id)
    .order('due_date', { ascending: true })

  if (filter === 'today') {
    query = query.eq('due_date', todayStr)
  } else if (filter === 'week') {
    query = query.gte('due_date', todayStr).lte('due_date', weekEndStr)
  }

  const { data: reminders } = await query

  return (
    <RemindersClient
      initialReminders={reminders ?? []}
      initialFilter={filter}
    />
  )
}
