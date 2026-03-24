'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Check, ExternalLink, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/format'
import type { Reminder } from '@/types'

interface ReminderListProps {
  customerId: string
  reminders: Reminder[]
  onChange: (reminders: Reminder[]) => void
}

function getRoundedTime(): string {
  const now = new Date()
  const m = now.getMinutes()
  const h = m < 30 ? now.getHours() : (now.getHours() + 1) % 24
  const rm = m < 30 ? 30 : 0
  return `${String(h).padStart(2, '0')}:${String(rm).padStart(2, '0')}`
}

function formatDateTime(dueDate: string, startTime?: string | null): string {
  const datePart = formatDate(dueDate)
  if (!startTime) return datePart
  return `${datePart} ${startTime.slice(0, 5)}`
}

interface ReminderModalProps {
  reminder: Reminder
  customerId: string
  onClose: () => void
  onChange: (updated: Reminder) => void
  onDelete: (id: string) => void
}

function ReminderModal({ reminder, customerId, onClose, onChange, onDelete }: ReminderModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      due_date: reminder.due_date,
      start_time: reminder.start_time ?? '',
      memo: reminder.memo ?? '',
    },
  })

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/reminders/${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_date: data.due_date,
          start_time: data.start_time || null,
          memo: data.memo || null,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange(result.data)
      toast.success('수정되었습니다')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/reminders/${reminder.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onDelete(reminder.id)
      toast.success('삭제되었습니다')
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#1E293B]">
            {formatDateTime(reminder.due_date, reminder.start_time)}
          </p>
          <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-[#1E293B]">
            <X size={16} />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(handleSave)} className="space-y-3">
            <div className="flex gap-2">
              <input
                {...register('due_date', { required: true })}
                type="date"
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
              />
              <input
                {...register('start_time')}
                type="time"
                className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
              />
            </div>
            <textarea
              {...register('memo')}
              placeholder="메모 (선택)"
              rows={4}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setIsEditing(false); reset() }}
                className="px-3 py-1.5 text-sm text-[#64748B]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-[#0F172A] text-white rounded-lg text-sm disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="text-sm text-[#1E293B] whitespace-pre-wrap min-h-[60px] mb-4">
              {reminder.memo || <span className="text-[#94A3B8]">메모 없음</span>}
            </div>
            <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-3 py-1.5 text-sm text-[#64748B]">닫기</button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 bg-[#0F172A] text-white rounded-lg text-sm"
                >
                  수정
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ReminderList({ customerId, reminders, onChange }: ReminderListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { due_date: today, start_time: getRoundedTime(), memo: '' },
  })

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
        body: JSON.stringify({
          due_date: data.due_date,
          start_time: data.start_time || null,
          memo: data.memo || null,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange([...reminders, result.data])
      reset({ due_date: today, start_time: getRoundedTime(), memo: '' })
      setIsAdding(false)
      toast.success('일정이 추가되었습니다')
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
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setSelectedReminder(reminder)}
        >
          <p className={cn(
            'text-sm font-medium',
            isOverdue ? 'text-red-500' : reminder.is_done ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'
          )}>
            {formatDateTime(reminder.due_date, reminder.start_time)}
            {isOverdue && <span className="ml-2 text-xs">⚠ 기한 지남</span>}
          </p>
          {reminder.memo && (
            <p className="text-xs text-[#64748B] truncate">{reminder.memo}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {reminder.google_event_id && (
            <a
              href={`https://calendar.google.com/calendar/event?eid=${reminder.google_event_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
              title="📅 캘린더에서 보기"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={() => handleDelete(reminder.id)}
            className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedReminder && (
        <ReminderModal
          reminder={selectedReminder}
          customerId={customerId}
          onClose={() => setSelectedReminder(null)}
          onChange={(updated) => {
            onChange(reminders.map(r => r.id === updated.id ? updated : r))
            setSelectedReminder(null)
          }}
          onDelete={(id) => {
            onChange(reminders.filter(r => r.id !== id))
            setSelectedReminder(null)
          }}
        />
      )}

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:border-[#38BDF8] hover:text-[#38BDF8] w-full justify-center transition-colors"
        >
          <Plus size={16} /> 일정 추가
        </button>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#F8FAFC] rounded-xl p-4 space-y-3 border border-[#E2E8F0]">
          <div className="flex gap-2">
            <input
              {...register('due_date', { required: true })}
              type="date"
              min={today}
              className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
            <input
              {...register('start_time')}
              type="time"
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
          </div>
          <input
            {...register('memo')}
            placeholder="메모 (선택)"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
          />
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
        <p className="text-sm text-[#94A3B8] text-center py-8">일정이 없습니다</p>
      )}
    </div>
  )
}
