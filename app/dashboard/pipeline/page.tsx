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

  // 칸반 컬럼 구성
  const pipelineStages = (stages ?? []).filter(s => s.stage_type === 'pipeline')
  const escapeStages = (stages ?? []).filter(s => s.stage_type === 'escape')

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
