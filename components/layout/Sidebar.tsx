'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Columns3,
  Bell,
  UsersRound,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const menuItems = [
  { label: '대시보드', icon: LayoutDashboard, href: '/dashboard' },
  { label: '고객 관리', icon: Users, href: '/dashboard/customers' },
  { label: '파이프라인', icon: Columns3, href: '/dashboard/pipeline' },
  { label: '리마인더', icon: Bell, href: '/dashboard/reminders' },
  { label: '팀 관리', icon: UsersRound, href: '/dashboard/team' },
  { label: '설정', icon: Settings, href: '/dashboard/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleNav = (href: string) => {
    router.push(href)
    router.refresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-52 z-40 flex-col bg-[#0F172A]">
      {/* 로고 */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#38BDF8] rounded-lg flex items-center justify-center">
            <span className="text-[#0F172A] font-bold text-sm">S1</span>
          </div>
          <span className="text-white font-bold text-lg">SalesONE</span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                isActive
                  ? 'bg-[#38BDF8]/15 text-[#38BDF8]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* 하단: 로그아웃 */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
