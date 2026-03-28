'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import JobTypeSelector from './JobTypeSelector'
import { formatKoreanPhone, isValidKoreanPhone, type JobType } from '@/lib/onboarding'

interface Props {
  initialName?: string
  onComplete: (data: { name: string; phone_number: string; job_type: JobType }) => Promise<void>
}

export default function ProfileStep({ initialName = '', onComplete }: Props) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState('')
  const [jobType, setJobType] = useState<JobType | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = '이름을 입력해주세요'
    if (!isValidKoreanPhone(phone)) errs.phone = '올바른 휴대폰 번호를 입력해주세요 (예: 010-1234-5678)'
    if (!jobType) errs.jobType = '직종을 선택해주세요'
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      await onComplete({ name: name.trim(), phone_number: phone, job_type: jobType! })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1E293B]">프로필 설정</h2>
        <p className="text-sm text-[#64748B] mt-1">서비스 이용에 필요한 정보를 입력해주세요</p>
      </div>

      <div className="space-y-4">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })) }}
            placeholder="홍길동"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* 휴대폰 번호 */}
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">휴대폰 번호</label>
          <input
            type="tel"
            value={phone}
            onChange={e => {
              setPhone(formatKoreanPhone(e.target.value))
              setErrors(prev => ({ ...prev, phone: '' }))
            }}
            placeholder="010-1234-5678"
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* 직종 */}
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">직종 선택</label>
          <JobTypeSelector selected={jobType} onSelect={(t) => { setJobType(t); setErrors(prev => ({ ...prev, jobType: '' })) }} />
          {errors.jobType && <p className="text-xs text-red-500 mt-1">{errors.jobType}</p>}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-[#1e293b] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? '설정 중...' : '시작하기'}
      </button>
    </div>
  )
}
