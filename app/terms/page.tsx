import { TERMS_SERVICE } from '@/lib/terms-content'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#94A3B8] hover:text-[#64748B]">← 홈으로</Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
          <h1 className="text-xl font-bold text-[#1E293B] mb-6">서비스 이용약관</h1>
          <pre className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed font-sans">
            {TERMS_SERVICE}
          </pre>
        </div>
      </div>
    </div>
  )
}
