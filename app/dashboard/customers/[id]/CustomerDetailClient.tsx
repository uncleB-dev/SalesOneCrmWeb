'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate, calcAge } from '@/lib/utils/format'
import StageBadge from '@/components/customers/StageBadge'
import CustomerForm from '@/components/customers/CustomerForm'
import InteractionTimeline from '@/components/customers/InteractionTimeline'
import ReminderList from '@/components/reminders/ReminderItem'
import type { Customer, PipelineStage, Interaction, Reminder } from '@/types'

interface Props {
  customer: Customer
  stages: PipelineStage[]
  initialInteractions: Interaction[]
  initialReminders: Reminder[]
}

type Tab = 'interactions' | 'reminders'

export default function CustomerDetailClient({ customer: initialCustomer, stages, initialInteractions, initialReminders }: Props) {
  const router = useRouter()
  const [customer, setCustomer] = useState(initialCustomer)
  const [interactions, setInteractions] = useState(initialInteractions)
  const [reminders, setReminders] = useState(initialReminders)
  const [activeTab, setActiveTab] = useState<Tab>('interactions')
  const [isEditing, setIsEditing] = useState(false)
  const [stageChanging, setStageChanging] = useState(false)

  const stageColorMap = Object.fromEntries(stages.map(s => [s.name, s.color]))
  const age = calcAge(customer.birth_date)
  const pendingReminders = reminders.filter(r => !r.is_done).length

  const handleStageChange = async (newStage: string) => {
    if (newStage === customer.stage) return
    setStageChanging(true)
    const prev = { ...customer }
    setCustomer(c => ({ ...c, stage: newStage }))
    try {
      const res = await fetch(`/api/v1/customers/${customer.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setCustomer(result.data)
      // refresh interactions to show auto-created record
      const iRes = await fetch(`/api/v1/customers/${customer.id}/interactions`)
      const iResult = await iRes.json()
      if (iResult.success) setInteractions(iResult.data)
      toast.success(`단계가 "${newStage}"으로 변경되었습니다`)
    } catch (e: any) {
      setCustomer(prev)
      toast.error(e.message)
    } finally {
      setStageChanging(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 고객을 삭제하시겠습니까? 삭제된 고객은 복구할 수 없습니다.')) return
    try {
      const res = await fetch(`/api/v1/customers/${customer.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('고객이 삭제되었습니다')
      router.push('/dashboard/customers')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#64748B]" />
        </button>
        <h1 className="text-xl font-bold text-[#1E293B]">{customer.name}</h1>
        <StageBadge name={customer.stage} color={stageColorMap[customer.stage] ?? '#94A3B8'} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 좌: 기본정보 카드 */}
        <div className="md:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4">
            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <Edit size={14} /> 수정
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-red-100 rounded-lg text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* 단계 변경 */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">단계</label>
              <select
                value={customer.stage}
                onChange={e => handleStageChange(e.target.value)}
                disabled={stageChanging}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 disabled:opacity-50"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* 연락처 */}
            <div className="space-y-2">
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-2 text-sm text-[#1E293B] hover:text-[#38BDF8] transition-colors"
              >
                <Phone size={14} className="text-[#94A3B8]" />
                {customer.phone}
              </a>
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center gap-2 text-sm text-[#1E293B] hover:text-[#38BDF8] transition-colors"
                >
                  <Mail size={14} className="text-[#94A3B8]" />
                  {customer.email}
                </a>
              )}
            </div>

            {/* 기본정보 */}
            <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
              {customer.birth_date && (
                <InfoRow label="생년월일" value={`${formatDate(customer.birth_date)}${age ? ` (${age}세)` : ''}`} />
              )}
              {customer.gender && <InfoRow label="성별" value={customer.gender} />}
              {customer.company && <InfoRow label="회사" value={customer.company} />}
              {customer.job_title && <InfoRow label="직책" value={customer.job_title} />}
              {customer.source && <InfoRow label="유입경로" value={customer.source} />}
              <InfoRow label="등록일" value={formatDate(customer.created_at)} />
            </div>

            {/* 메모 */}
            {customer.memo && (
              <div className="pt-2 border-t border-[#F1F5F9]">
                <p className="text-xs font-medium text-[#94A3B8] mb-1">메모</p>
                <p className="text-sm text-[#64748B] whitespace-pre-wrap">{customer.memo}</p>
              </div>
            )}
          </div>
        </div>

        {/* 우: 탭 영역 */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            {/* 탭 헤더 */}
            <div className="flex border-b border-[#E2E8F0]">
              <TabBtn active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')}>
                상담이력 ({interactions.length})
              </TabBtn>
              <TabBtn active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')}>
                리마인더 {pendingReminders > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#EF4444] text-white text-xs rounded-full">{pendingReminders}</span>}
              </TabBtn>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-5">
              {activeTab === 'interactions' && (
                <InteractionTimeline
                  customerId={customer.id}
                  interactions={interactions}
                  onChange={setInteractions}
                />
              )}
              {activeTab === 'reminders' && (
                <ReminderList
                  customerId={customer.id}
                  reminders={reminders}
                  onChange={setReminders}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 수정 폼 */}
      {isEditing && (
        <CustomerForm
          customer={customer}
          stages={stages}
          onClose={() => setIsEditing(false)}
          onSuccess={updated => { setCustomer(updated); setIsEditing(false) }}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#94A3B8]">{label}</span>
      <span className="text-[#1E293B] font-medium text-right">{value}</span>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
        active
          ? 'border-[#38BDF8] text-[#0F172A]'
          : 'border-transparent text-[#94A3B8] hover:text-[#64748B]'
      )}
    >
      {children}
    </button>
  )
}
