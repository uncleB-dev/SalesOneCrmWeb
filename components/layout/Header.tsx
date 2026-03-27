'use client'

import { usePathname } from 'next/navigation'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'
import { useSidebarStore } from '@/store/useSidebarStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/dashboard/customers': '고객 관리',
  '/dashboard/pipeline': '파이프라인',
  '/dashboard/reminders': '일정',
  '/dashboard/records': '기록',
  '/dashboard/team': '팀 관리',
  '/dashboard/team/pipeline': '팀 파이프라인',
  '/dashboard/team/report': '팀 리포트',
  '/dashboard/settings': '설정',
}

export default function Header() {
  const pathname = usePathname()
  const isCollapsed = useSidebarStore(s => s.isCollapsed)

  const title =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ?? '대시보드'

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-12 bg-white/90 backdrop-blur-sm border-b border-[#bbc9c8]/60 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${
        isCollapsed ? 'left-0 md:left-14' : 'left-0 md:left-52'
      }`}
    >
      <h1 className="text-[15px] font-semibold text-[#1a1c1e]">{title}</h1>

      <div className="flex items-center gap-3">
        <NotificationDropdown />
      </div>
    </header>
  )
}
