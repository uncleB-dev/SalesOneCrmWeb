'use client'

import { Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useNotificationStore } from '@/store/useNotificationStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/dashboard/customers': '고객 관리',
  '/dashboard/pipeline': '파이프라인',
  '/dashboard/reminders': '리마인더',
  '/dashboard/team': '팀 관리',
  '/dashboard/team/pipeline': '팀 파이프라인',
  '/dashboard/team/report': '팀 리포트',
  '/dashboard/settings': '설정',
}

export default function Header() {
  const pathname = usePathname()
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const title =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ?? '대시보드'

  return (
    <header className="fixed top-0 left-0 right-0 md:left-52 z-30 h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-6">
      <h1 className="text-lg font-semibold text-[#1E293B]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* 알림 벨 */}
        <button className="relative p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
          <Bell size={20} className="text-[#64748B]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
