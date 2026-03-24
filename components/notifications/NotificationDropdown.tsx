'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReminderNotification {
  id: string
  customer_id: string
  customer_name: string
  due_date: string
  memo: string | null
  is_overdue: boolean
}

interface TeamNotification {
  id: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationData {
  teamNotifications: TeamNotification[]
  reminderNotifications: Array<{ id: string; reminder: ReminderNotification; is_read: boolean }>
  unreadCount: number
}

export default function NotificationDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<NotificationData>({ teamNotifications: [], reminderNotifications: [], unreadCount: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/v1/notifications')
      const result = await res.json()
      if (result.success) setData(result.data)
    } catch {
      // 조용히 실패
    }
  }

  // 마운트 시 즉시 + 30초마다 폴링
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [])

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = async () => {
    setOpen(prev => !prev)
    if (!open && data.teamNotifications.some(n => !n.is_read)) {
      await fetch('/api/v1/notifications', { method: 'PATCH' })
      setData(prev => ({
        ...prev,
        teamNotifications: prev.teamNotifications.map(n => ({ ...n, is_read: true })),
        unreadCount: prev.reminderNotifications.length,
      }))
    }
  }

  const handleReminderClick = (customerId: string) => {
    setOpen(false)
    router.push(`/dashboard/customers/${customerId}`)
  }

  const isEmpty = data.teamNotifications.length === 0 && data.reminderNotifications.length === 0

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
        aria-label="알림"
      >
        <Bell size={20} className="text-[#64748B]" />
        {data.unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {data.unreadCount > 9 ? '9+' : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1E293B]">알림</span>
            {data.unreadCount > 0 && (
              <span className="text-xs text-[#94A3B8]">{data.unreadCount}개 미확인</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isEmpty ? (
              <div className="py-10 text-center">
                <Check size={24} className="text-[#E2E8F0] mx-auto mb-2" />
                <p className="text-sm text-[#94A3B8]">새 알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F8FAFC]">
                {/* 리마인더 알림 */}
                {data.reminderNotifications.map(({ id, reminder }) => (
                  <button
                    key={id}
                    onClick={() => handleReminderClick(reminder.customer_id)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors text-left"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                      reminder.is_overdue ? 'bg-red-100' : 'bg-amber-100'
                    )}>
                      {reminder.is_overdue
                        ? <AlertCircle size={15} className="text-red-500" />
                        : <Clock size={15} className="text-amber-500" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1E293B] truncate">
                        {reminder.customer_name}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {reminder.is_overdue ? '⚠ 기한 초과 · ' : '📅 오늘 · '}
                        {reminder.due_date}
                      </p>
                      {reminder.memo && (
                        <p className="text-xs text-[#94A3B8] truncate mt-0.5">{reminder.memo}</p>
                      )}
                    </div>
                  </button>
                ))}

                {/* 팀 알림 */}
                {data.teamNotifications.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'px-4 py-3 flex items-start gap-3',
                      !n.is_read && 'bg-[#F0F9FF]'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bell size={15} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1E293B]">팀 알림</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{n.type}</p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[#38BDF8] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.reminderNotifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[#F1F5F9]">
              <button
                onClick={() => { setOpen(false); router.push('/dashboard/reminders') }}
                className="text-xs text-[#38BDF8] hover:underline"
              >
                리마인더 전체 보기 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
