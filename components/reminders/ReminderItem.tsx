'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/format'
import type { Reminder } from '@/types'

interface ReminderListProps {
  customerId: string
  reminders: Reminder[]
  onChange: (reminders: Reminder[]) => void
}

export default function ReminderList({ customerId, reminders, onChange }: ReminderListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { due_date: '', memo: '' },
  })

  const today = new Date().toISOString().split('T')[0]
  const pending = reminders.filter(r => !r.is_done).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const done = reminders.filter(r => r.is_done)

  const handleToggle = async (reminder: Reminder) => {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_done: !reminder.is_done }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange(reminders.map(r => r.id === reminder.id ? result.data : r))
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/reminders/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange(reminders.filter(r => r.id !== id))
      toast.success('삭제되었습니다')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date: data.due_date, memo: data.memo || null }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange([...reminders, result.data])
      reset()
      setIsAdding(false)
      toast.success('리마인더가 추가되었습니다')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const ReminderRow = ({ reminder }: { reminder: Reminder }) => {
    const isOverdue = !reminder.is_done && reminder.due_date < today
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
        reminder.is_done ? 'bg-[#F8FAFC] border-[#F1F5F9] opacity-60' : 'bg-white border-[#E2E8F0]'
      )}>
        <button
          onClick={() => handleToggle(reminder)}
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            reminder.is_done
              ? 'bg-[#10B981] border-[#10B981] text-white'
              : 'border-[#D1D5DB] hover:border-[#10B981]'
          )}
        >
          {reminder.is_done && <Check size={11} strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            isOverdue ? 'text-red-500' : reminder.is_done ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'
          )}>
            {formatDate(reminder.due_date)}
            {isOverdue && <span className="ml-2 text-xs">⚠ 기한 지남</span>}
          </p>
          {reminder.memo && (
            <p className="text-xs text-[#64748B] truncate">{reminder.memo}</p>
          )}
        </div>
        <button
          onClick={() => handleDelete(reminder.id)}
          className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:border-[#38BDF8] hover:text-[#38BDF8] w-full justify-center transition-colors"
        >
          <Plus size={16} /> 리마인더 추가
        </button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#F8FAFC] rounded-xl p-4 space-y-3 border border-[#E2E8F0]">
          <div className="flex gap-3">
            <input
              {...register('due_date', { required: true })}
              type="date"
              min={today}
              className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
            <input
              {...register('memo')}
              placeholder="메모 (선택)"
              className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setIsAdding(false); reset() }} className="px-3 py-1.5 text-sm text-[#64748B]">취소</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#0F172A] text-white rounded-lg text-sm disabled:opacity-50">
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      )}

      {/* 미완료 */}
      <div className="space-y-2">
        {pending.map(r => <ReminderRow key={r.id} reminder={r} />)}
      </div>

      {/* 완료 */}
      {done.length > 0 && (
        <div>
          <p className="text-xs text-[#94A3B8] font-medium mb-2">완료됨 ({done.length})</p>
          <div className="space-y-2">
            {done.map(r => <ReminderRow key={r.id} reminder={r} />)}
          </div>
        </div>
      )}

      {reminders.length === 0 && !isAdding && (
        <p className="text-sm text-[#94A3B8] text-center py-8">리마인더가 없습니다</p>
      )}
    </div>
  )
}
