export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PipelinePageClient from './PipelinePageClient'

export default async function PipelinePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const [{ data: stages }, { data: customers }, { data: reminders }] = await Promise.all([
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('customers')
      .select('*')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('order_index', { ascending: true }),
    supabase
      .from('reminders')
      .select('customer_id, due_date')
      .eq('user_id', session.user.id)
      .eq('is_done', false)
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true }),
  ])

  // 고객별 가장 가까운 리마인더 매핑
  const reminderMap: Record<string, string> = {}
  ;(reminders ?? []).forEach(r => {
    if (!reminderMap[r.customer_id]) {
      reminderMap[r.customer_id] = r.due_date
    }
  })

  // 단계별 고객 수 (단계 관리용)
  const customerCountByStage: Record<string, number> = {}
  ;(customers ?? []).forEach(c => {
    customerCountByStage[c.stage] = (customerCountByStage[c.stage] ?? 0) + 1
  })

  // 중복 방어 (name+stage_type 기준 첫 번째만 유지)
  const dedup = (list: NonNullable<typeof stages>) =>
    list.filter((s, i, arr) =>
      i === arr.findIndex(x => x.name === s.name && x.stage_type === s.stage_type)
    )

  const pipelineStages = dedup((stages ?? []).filter(s => s.stage_type === 'pipeline'))
  const escapeStages = dedup((stages ?? []).filter(s => s.stage_type === 'escape'))

  const buildColumns = (stageList: typeof pipelineStages) =>
    stageList.map(stage => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      customers: (customers ?? []).filter(c => c.stage === stage.name),
    }))

  return (
    <PipelinePageClient
      initialPipeline={buildColumns(pipelineStages)}
      initialEscape={buildColumns(escapeStages)}
      allStages={stages ?? []}
      customerCountByStage={customerCountByStage}
      reminderMap={reminderMap}
    />
  )
}
