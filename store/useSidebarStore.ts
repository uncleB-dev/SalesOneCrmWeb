import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarStore {
  isCollapsed: boolean
  toggle: () => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggle: () => set(s => ({ isCollapsed: !s.isCollapsed })),
    }),
    { name: 'salesone_sidebar_collapsed' }
  )
)
