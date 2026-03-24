'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/format'
import type { Reminder } from '@/types'

interface ReminderWithCustomer extends Reminder {
  customers: { id: string; name: string; stage: string } | null
}

type FilterType = 'today' | 'week' | 'all'

interface Props {
  initialReminders: ReminderWithCustomer[]
  initialFilter: FilterType
}

const FILTER_LABELS: Record<FilterType, string> = {
  today: '오늘',
  week: '이번 주',
  all: '전체',
}

export default function RemindersClient({ initialReminders, initialFilter }: Props) {
  const router = useRouter()
  const [reminders, setReminders] = useState(initialReminders)
  const [filter, setFilter] = useState<FilterType>(initialFilter)
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const pending = reminders.filter(r => !r.is_done).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const done = reminders.filter(r => r.is_done).sort((a, b) => b.due_date.localeCompare(a.due_date))

  const fetchReminders = async (f: FilterType) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/reminders?filter=${f}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setReminders(result.data)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = async (f: FilterType) => {
    setFilter(f)
    await fetchReminders(f)
  }

  const handleToggle = async (reminder: ReminderWithCustomer) => {
    const prev = [...reminders]
    setReminders(rs => rs.map(r => r.id === reminder.id ? { ...r, is_done: !r.is_done } : r))
    try {
      const res = await fetch(`/api/v1/customers/${reminder.customer_id}/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_done: !reminder.is_done }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      router.refresh()
    } catch (e: any) {
      setReminders(prev)
      toast.error(e.message)
    }
  }

  const ReminderRow = ({ reminder }: { reminder: ReminderWithCustomer }) => {
    const isOverdue = !reminder.is_done && reminder.due_date < today
    const isToday = reminder.due_date === today

    return (
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-all',
        reminder.is_done
          ? 'bg-[#F8FAFC] border-[#F1F5F9] opacity-60'
          : isOverdue
          ? 'bg-red-50/50 border-red-100'
          : isToday
          ? 'bg-amber-50/50 border-amber-100'
          : 'bg-white border-[#E2E8F0]'
      )}>
        <button
          onClick={() => handleToggle(reminder)}
          className="w-11 h-11 flex items-center justify-center flex-shrink-0 -ml-3"
        >
          <span className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
            reminder.is_done
              ? 'bg-[#10B981] border-[#10B981] text-white'
              : 'border-[#D1D5DB] hover:border-[#10B981]'
          )}>
            {reminder.is_done && <Check size={11} strokeWidth={3} />}
          </span>
        </button>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => reminder.customers && router.push(`/dashboard/customers/${reminder.customers.id}?tab=reminders`)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-sm font-semibold',
              isOverdue ? 'text-red-500' : reminder.is_done ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'
            )}>
              {formatDate(reminder.due_date)}
              {reminder.start_time && (
                <span className="ml-1 font-normal text-[#64748B]">{reminder.start_time.slice(0, 5)}</span>
              )}
            </span>
            {isOverdue && <span className="text-xs text-red-400 font-medium">기한 지남</span>}
            {isToday && !reminder.is_done && <span className="text-xs text-amber-500 font-medium">오늘</span>}
          </div>
          {reminder.memo && (
            <p className="text-xs text-[#64748B] mt-0.5 truncate">{reminder.memo}</p>
          )}
          {reminder.customers && (
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {reminder.customers.name}
              <span className="ml-1 text-[#CBD5E1]">·</span>
              <span className="ml-1">{reminder.customers.stage}</span>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
          <Bell size={18} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">일정</h1>
          <p className="text-xs text-[#94A3B8]">고객별 후속 연락 일정</p>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl mb-6">
        {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={cn(
              'flex-1 py-1.5 text-sm font-medium rounded-lg transition-all',
              filter === f
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            )}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[#F8FAFC] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* 미완료 */}
          <div className="space-y-3">
            {pending.length > 0 ? (
              pending.map(r => <ReminderRow key={r.id} reminder={r} />)
            ) : (
              <div className="text-center py-10">
                <CheckCheck size={32} className="text-[#E2E8F0] mx-auto mb-2" />
                <p className="text-sm text-[#94A3B8]">
                  {filter === 'today' ? '오늘 예정된 일정이 없습니다' :
                   filter === 'week' ? '이번 주 예정된 일정이 없습니다' :
                   '미완료 일정이 없습니다'}
                </p>
              </div>
            )}
          </div>

          {/* 완료 */}
          {done.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#94A3B8] mb-3 flex items-center gap-1">
                <CheckCheck size={13} /> 완료됨 ({done.length})
              </p>
              <div className="space-y-2">
                {done.map(r => <ReminderRow key={r.id} reminder={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
