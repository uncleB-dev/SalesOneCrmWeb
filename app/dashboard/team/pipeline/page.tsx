export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TeamPipelineClient from './TeamPipelineClient'

export default async function TeamPipelinePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  return <TeamPipelineClient currentUserId={session.user.id} />
}
