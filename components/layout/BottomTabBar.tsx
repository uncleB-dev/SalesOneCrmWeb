'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Columns3, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { label: '홈', icon: LayoutDashboard, href: '/dashboard' },
  { label: '고객', icon: Users, href: '/dashboard/customers' },
  { label: '파이프라인', icon: Columns3, href: '/dashboard/pipeline' },
  { label: '리마인더', icon: Bell, href: '/dashboard/reminders' },
  { label: '설정', icon: Settings, href: '/dashboard/settings' },
]

export default function BottomTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNav = (href: string) => {
    router.push(href)
    router.refresh()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#E2E8F0]">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(tab.href)
          return (
            <button
              key={tab.href}
              onClick={() => handleNav(tab.href)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-[#38BDF8]' : 'text-[#94A3B8]'
              )}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
