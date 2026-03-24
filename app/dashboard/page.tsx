export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Users, UserPlus, FileCheck, Bell } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const todayStr = now.toISOString().split('T')[0]

  // 1. 전체 고객 수
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null)

  // 2. 이번 달 신규 고객
  const { count: newThisMonth } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .gte('created_at', startOfMonth)

  // 3. 이번 달 계약 완료 (stage 이름에 '계약' 포함)
  const { count: contractsThisMonth } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .ilike('stage', '%계약%')
    .gte('updated_at', startOfMonth)

  // 4. 오늘 리마인더 (미완료)
  const { count: todayReminders } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('due_date', todayStr)
    .eq('is_done', false)

  const kpis = [
    {
      label: '전체 고객',
      value: totalCustomers ?? 0,
      icon: Users,
      color: '#60A5FA',
      bg: '#60A5FA1A',
    },
    {
      label: '이번달 신규',
      value: newThisMonth ?? 0,
      icon: UserPlus,
      color: '#10B981',
      bg: '#10B9811A',
    },
    {
      label: '이번달 계약',
      value: contractsThisMonth ?? 0,
      icon: FileCheck,
      color: '#A78BFA',
      bg: '#A78BFA1A',
    },
    {
      label: '오늘 일정',
      value: todayReminders ?? 0,
      icon: Bell,
      color: '#F97316',
      bg: '#F973161A',
    },
  ]

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1E293B]">대시보드</h1>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          {now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start gap-3"
          >
            <div className="rounded-lg p-2 flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#94A3B8] truncate">{label}</p>
              <p className="text-2xl font-bold text-[#1E293B] mt-0.5 leading-none">{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
