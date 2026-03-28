import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-6 px-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto text-center space-y-2">
        <p className="text-xs text-[#94A3B8]">
          SalesONE | 사업자등록번호: 000-00-00000
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/terms" className="text-xs text-[#94A3B8] hover:text-[#64748B] underline">
            서비스 이용약관
          </Link>
          <span className="text-[#CBD5E1]">|</span>
          <Link href="/privacy" className="text-xs text-[#94A3B8] hover:text-[#64748B] underline font-semibold">
            개인정보 처리방침
          </Link>
        </div>
      </div>
    </footer>
  )
}
