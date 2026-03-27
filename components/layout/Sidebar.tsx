'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Columns3,
  Bell,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/store/useSidebarStore'

const menuItems = [
  { label: '대시보드', icon: LayoutDashboard, href: '/dashboard' },
  { label: '고객 관리', icon: Users, href: '/dashboard/customers' },
  { label: '파이프라인', icon: Columns3, href: '/dashboard/pipeline' },
  { label: '일정', icon: Bell, href: '/dashboard/reminders' },
  { label: '기록', icon: FileText, href: '/dashboard/records' },
  { label: '설정', icon: Settings, href: '/dashboard/settings' },
]

interface UserInfo {
  name: string
  email: string
  avatarUrl: string | null
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggle } = useSidebarStore()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      // user_profiles에서 이름 조회
      supabase
        .from('user_profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data: profile }) => {
          setUserInfo({
            name: profile?.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
            email: user.email ?? '',
            avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
          })
        })
    })
  }, [])

  const handleNav = (href: string) => {
    router.push(href)
    router.refresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const initials = userInfo?.name?.charAt(0)?.toUpperCase() || userInfo?.email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen z-40 flex-col bg-[#0F172A] transition-all duration-300',
        isCollapsed ? 'w-14' : 'w-52'
      )}
    >
      {/* 로고 */}
      <div className="h-16 flex items-center px-3 border-b border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 flex-shrink-0 bg-[#0abfbc] rounded-lg flex items-center justify-center">
            <span className="text-[#0F172A] font-bold text-sm">S1</span>
          </div>
          <span
            className={cn(
              'text-white font-bold text-lg whitespace-nowrap transition-all duration-300 overflow-hidden',
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            )}
          >
            SalesONE
          </span>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <div key={item.href} className="relative group">
              <button
                onClick={() => handleNav(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-[#0abfbc]/15 text-[#45dbd7]'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                )}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span
                  className={cn(
                    'whitespace-nowrap transition-all duration-300 overflow-hidden',
                    isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </button>

              {/* 툴팁 (접힘 상태) */}
              {isCollapsed && (
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#1E293B] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-white/10">
                  {item.label}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      {/* 하단: 사용자 정보 + 로그아웃 + 접기 */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1 overflow-hidden">
        {/* 사용자 정보 */}
        {userInfo && (
          <div className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg overflow-hidden',
            isCollapsed ? 'justify-center' : ''
          )}>
            {userInfo.avatarUrl ? (
              <img
                src={userInfo.avatarUrl}
                alt="avatar"
                className="w-7 h-7 rounded-full flex-shrink-0 border border-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#0abfbc]/25 flex items-center justify-center flex-shrink-0">
                <span className="text-[#45dbd7] font-semibold text-xs">{initials}</span>
              </div>
            )}
            <div
              className={cn(
                'min-w-0 transition-all duration-300 overflow-hidden',
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100 flex-1'
              )}
            >
              <p className="text-white/80 text-xs font-medium truncate">{userInfo.name || userInfo.email}</p>
              <p className="text-white/30 text-xs truncate">{userInfo.email}</p>
            </div>
          </div>
        )}

        {/* 로그아웃 */}
        <div className="relative group">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span
              className={cn(
                'whitespace-nowrap transition-all duration-300 overflow-hidden',
                isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
              )}
            >
              로그아웃
            </span>
          </button>
          {isCollapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#1E293B] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-white/10">
              로그아웃
            </span>
          )}
        </div>

        {/* 접기/펼치기 버튼 */}
        <button
          onClick={toggle}
          className={cn(
            'w-full flex items-center px-2 py-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors text-sm',
            isCollapsed ? 'justify-center' : 'justify-end gap-1'
          )}
          title={isCollapsed ? '펼치기' : '접기'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : (
            <>
              <span className="text-xs">접기</span>
              <ChevronLeft size={15} />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
