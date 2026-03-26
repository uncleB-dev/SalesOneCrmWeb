'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, Edit, Trash2, ExternalLink, FolderPlus, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate, calcAge } from '@/lib/utils/format'
import StageBadge from '@/components/customers/StageBadge'
import CustomerForm from '@/components/customers/CustomerForm'
import InteractionTimeline from '@/components/customers/InteractionTimeline'
import ReminderList from '@/components/reminders/ReminderItem'
import { createClient } from '@/lib/supabase'
import type { Customer, PipelineStage, Interaction, Reminder, DriveFileRecord } from '@/types'

interface Props {
  customer: Customer
  stages: PipelineStage[]
  initialInteractions: Interaction[]
  initialReminders: Reminder[]
  initialTab?: string
}

type Tab = 'interactions' | 'reminders'

export default function CustomerDetailClient({ customer: initialCustomer, stages, initialInteractions, initialReminders, initialTab }: Props) {
  const router = useRouter()
  const [customer, setCustomer] = useState(initialCustomer)
  const [interactions, setInteractions] = useState(initialInteractions)
  const [reminders, setReminders] = useState(initialReminders)
  const [activeTab, setActiveTab] = useState<Tab>(initialTab === 'reminders' ? 'reminders' : 'interactions')
  const [isEditing, setIsEditing] = useState(false)
  const [stageChanging, setStageChanging] = useState(false)

  const stageColorMap = Object.fromEntries(stages.map(s => [s.name, s.color]))
  const age = calcAge(customer.birth_date)
  const pendingReminders = reminders.filter(r => !r.is_done).length
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [syncingContact, setSyncingContact] = useState(false)
  const [driveFiles, setDriveFiles] = useState<DriveFileRecord[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const loadDriveFiles = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const providerToken = session?.provider_token ?? ''
        const res = await fetch(`/api/v1/customers/${customer.id}/drive-files`, {
          headers: providerToken ? { 'X-Provider-Token': providerToken } : {},
        })
        const r = await res.json()
        if (r.success) setDriveFiles(r.data)
      } catch {}
    }
    loadDriveFiles()
  }, [customer.id])

  const fetchInteractions = async () => {
    const res = await fetch(`/api/v1/customers/${customer.id}/interactions`)
    const result = await res.json()
    if (result.success) setInteractions(result.data)
  }

  const fetchDriveFiles = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token ?? ''
    const res = await fetch(`/api/v1/customers/${customer.id}/drive-files`, {
      headers: providerToken ? { 'X-Provider-Token': providerToken } : {},
    })
    const result = await res.json()
    if (result.success) setDriveFiles(result.data)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchInteractions(), fetchDriveFiles()])
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateDriveFolder = async () => {
    setCreatingFolder(true)
    try {
      const res = await fetch(`/api/v1/customers/${customer.id}/drive-folder`, { method: 'POST' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setCustomer(result.data)
      toast.success('구글 드라이브 폴더가 생성되었습니다')
    } catch (e: any) {
      toast.error(e.message || '폴더 생성에 실패했습니다')
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleSyncContact = async () => {
    setSyncingContact(true)
    try {
      const res = await fetch(`/api/v1/customers/${customer.id}/sync-contact`, { method: 'POST' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setCustomer(result.data)
      toast.success('구글 주소록에 등록되었습니다')
      fetchInteractions()
    } catch (e: any) {
      toast.error(e.message || '주소록 연동에 실패했습니다')
    } finally {
      setSyncingContact(false)
    }
  }

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
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 min-h-[44px] border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <Edit size={14} /> 수정
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] border border-red-100 rounded-lg text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* 구글 연동 상태 바 */}
            <div className="flex flex-wrap gap-2">
                {customer.google_contact_id && customer.is_google_contact_synced ? (
                  <a
                    href={`https://contacts.google.com/person/${customer.google_contact_id.replace('people/', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EFF6FF] text-[#3B82F6] rounded-lg text-xs font-medium hover:bg-[#DBEAFE] transition-colors"
                  >
                    📇 주소록 연동중 <ExternalLink size={11} />
                  </a>
                ) : (
                  <button
                    onClick={handleSyncContact}
                    disabled={syncingContact}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] text-[#64748B] border border-dashed border-[#CBD5E1] rounded-lg text-xs font-medium hover:bg-[#EFF6FF] hover:text-[#3B82F6] hover:border-[#93C5FD] disabled:opacity-50 transition-colors"
                  >
                    📇 {syncingContact ? '연동 중...' : '주소록 연동하기'}
                  </button>
                )}
                {customer.google_drive_folder_id ? (
                  <a
                    href={`https://drive.google.com/drive/folders/${customer.google_drive_folder_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F0FDF4] text-[#16A34A] rounded-lg text-xs font-medium hover:bg-[#DCFCE7] transition-colors"
                  >
                    📁 드라이브 폴더 <ExternalLink size={11} />
                  </a>
                ) : (
                  <button
                    onClick={handleCreateDriveFolder}
                    disabled={creatingFolder}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] text-[#64748B] border border-dashed border-[#CBD5E1] rounded-lg text-xs font-medium hover:bg-[#F1F5F9] disabled:opacity-50 transition-colors"
                  >
                    <FolderPlus size={12} /> {creatingFolder ? '생성 중...' : '폴더 만들기'}
                  </button>
                )}
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
              {customer.source && <InfoRow label="관계" value={customer.source} />}
              {customer.address && <InfoRow label="주소" value={customer.address} />}
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
            <div className="flex items-center border-b border-[#E2E8F0]">
              <TabBtn active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')}>
                상담이력 ({interactions.length})
              </TabBtn>
              <TabBtn active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')}>
                일정 {pendingReminders > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#EF4444] text-white text-xs rounded-full">{pendingReminders}</span>}
              </TabBtn>
              <div className="ml-auto pr-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#64748B] disabled:opacity-50 transition-colors"
                  title="새로고침"
                >
                  {isRefreshing
                    ? <Loader2 size={16} className="animate-spin" />
                    : <RefreshCw size={16} />
                  }
                </button>
              </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-5">
              {activeTab === 'interactions' && (
                <InteractionTimeline
                  customerId={customer.id}
                  interactions={interactions}
                  driveFiles={driveFiles}
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
