'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { formatPhone } from '@/lib/utils/format'
import type { Customer, PipelineStage } from '@/types'

const schema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력하세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional().or(z.literal('')),
  birth_year: z.string().optional(),
  birth_month: z.string().optional(),
  birth_day: z.string().optional(),
  gender: z.enum(['남', '여', '']).optional(),
  stage: z.string().min(1, '단계를 선택하세요'),
  source: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  memo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CustomerFormProps {
  customer?: Customer | null
  stages: PipelineStage[]
  onClose: () => void
  onSuccess: (customer: Customer) => void
}

export default function CustomerForm({ customer, stages, onClose, onSuccess }: CustomerFormProps) {
  const isEdit = !!customer
  const pipelineStages = stages.filter(s => s.stage_type === 'pipeline')

  const birthParts = customer?.birth_date?.split('-') ?? []

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      birth_year: birthParts[0] ?? '',
      birth_month: birthParts[1] ?? '',
      birth_day: birthParts[2] ?? '',
      gender: (customer?.gender as any) ?? '',
      stage: customer?.stage ?? pipelineStages[0]?.name ?? '',
      source: customer?.source ?? '',
      company: customer?.company ?? '',
      job_title: customer?.job_title ?? '',
      memo: customer?.memo ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      let birth_date: string | null = null
      if (data.birth_year && data.birth_month && data.birth_day) {
        birth_date = `${data.birth_year}-${data.birth_month.padStart(2, '0')}-${data.birth_day.padStart(2, '0')}`
      }

      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        birth_date,
        gender: data.gender || null,
        stage: data.stage,
        source: data.source || null,
        company: data.company || null,
        job_title: data.job_title || null,
        memo: data.memo || null,
      }

      const url = isEdit ? `/api/v1/customers/${customer.id}` : '/api/v1/customers'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      toast.success(isEdit ? '고객 정보가 수정되었습니다' : '고객이 등록되었습니다')
      onSuccess(result.data)
    } catch (e: any) {
      toast.error(e.message || '저장에 실패했습니다')
    }
  }

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-40 bg-black/30 md:bg-transparent" onClick={onClose} />

      {/* 패널: PC는 우측 슬라이드, 모바일는 풀스크린 */}
      <div className="fixed inset-0 z-50 md:inset-auto md:right-0 md:top-0 md:h-screen md:w-96 bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#1E293B]">
            {isEdit ? '고객 정보 수정' : '고객 추가'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F8FAFC]">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              placeholder="홍길동"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('phone')}
              onChange={e => setValue('phone', formatPhone(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              placeholder="010-0000-0000"
              maxLength={13}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* 단계 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              단계 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('stage')}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
            >
              {pipelineStages.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.stage && <p className="text-xs text-red-500 mt-1">{errors.stage.message}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">이메일</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              placeholder="example@email.com"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">생년월일</label>
            <div className="flex gap-2">
              <input
                {...register('birth_year')}
                className="w-24 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
                placeholder="1990"
                maxLength={4}
              />
              <select
                {...register('birth_month')}
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              >
                <option value="">월</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={String(m)}>{m}월</option>
                ))}
              </select>
              <select
                {...register('birth_day')}
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              >
                <option value="">일</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={String(d)}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">성별</label>
            <div className="flex gap-3">
              {['남', '여'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('gender')} value={g} className="accent-[#38BDF8]" />
                  <span className="text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 유입경로 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">유입경로</label>
            <select
              {...register('source')}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
            >
              <option value="">선택 안함</option>
              {['지인소개', 'SNS', '블로그', '콜드콜', '기존고객', '전시회', '기타'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 회사 / 직책 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">회사명</label>
              <input
                {...register('company')}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">직책</label>
              <input
                {...register('job_title')}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">메모</label>
            <textarea
              {...register('memo')}
              rows={3}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8] resize-none"
            />
          </div>
        </form>

        {/* 하단 버튼 */}
        <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-[#0F172A] rounded-lg text-sm font-medium text-white hover:bg-[#1e293b] disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : isEdit ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </>
  )
}
