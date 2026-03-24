import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BottomTabBar from '@/components/layout/BottomTabBar'
import MainWrapper from '@/components/layout/MainWrapper'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Header />
      <MainWrapper>{children}</MainWrapper>
      <BottomTabBar />
    </div>
  )
}
