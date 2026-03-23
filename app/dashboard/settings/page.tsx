export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PipelineStagesEditor from '@/components/settings/PipelineStagesEditor'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const [{ data: stages }, { data: customers }] = await Promise.all([
    supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', session.user.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('customers')
      .select('stage')
      .eq('user_id', session.user.id)
      .is('deleted_at', null),
  ])

  const customerCountByStage: Record<string, number> = {}
  ;(customers ?? []).forEach(c => {
    customerCountByStage[c.stage] = (customerCountByStage[c.stage] ?? 0) + 1
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1E293B]">설정</h1>
        <p className="text-sm text-[#94A3B8] mt-1">파이프라인 단계를 직접 커스터마이징하세요</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <PipelineStagesEditor
          initialStages={stages ?? []}
          customerCountByStage={customerCountByStage}
        />
      </div>
    </div>
  )
}
