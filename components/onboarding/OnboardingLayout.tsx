interface Props {
  step: 1 | 2
  children: React.ReactNode
}

export default function OnboardingLayout({ step, children }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-start justify-center pt-10 pb-20 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
              <span className="text-[#38BDF8] font-bold text-lg">S1</span>
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">SalesONE</span>
          </div>
        </div>

        {/* 진행 인디케이터 */}
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-[#38BDF8]' : 'bg-[#E2E8F0]'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-[#38BDF8]' : 'bg-[#E2E8F0]'}`} />
        </div>
        <p className="text-xs text-center text-[#94A3B8] -mt-4">Step {step} / 2</p>

        {/* 컨텐츠 */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
