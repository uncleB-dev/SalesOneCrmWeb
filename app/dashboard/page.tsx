export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['전체 고객', '이번달 신규', '이번달 계약', '오늘 리마인더'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <p className="text-sm text-[#64748B]">{label}</p>
            <p className="text-2xl font-bold text-[#1E293B] mt-1">-</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-[#94A3B8] text-center mt-12">
        데이터베이스 연결 후 대시보드가 표시됩니다
      </p>
    </div>
  )
}
