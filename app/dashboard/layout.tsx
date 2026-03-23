import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BottomTabBar from '@/components/layout/BottomTabBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Header />
      <main className="md:ml-52 pt-16 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
