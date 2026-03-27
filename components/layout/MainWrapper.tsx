'use client'

import { useSidebarStore } from '@/store/useSidebarStore'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSidebarStore(s => s.isCollapsed)

  return (
    <main
      className={`${isCollapsed ? 'md:ml-14' : 'md:ml-52'} pt-12 pb-16 md:pb-0 min-h-screen transition-all duration-300`}
    >
      {children}
    </main>
  )
}
