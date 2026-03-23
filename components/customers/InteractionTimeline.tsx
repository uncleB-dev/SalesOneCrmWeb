'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils/format'
import { INTERACTION_ICONS } from '@/lib/utils/constants'
import type { Interaction } from '@/types'

interface Props {
  customerId: string
  interactions: Interaction[]
  onChange: (interactions: Interaction[]) => void
}

export default function InteractionTimeline({ customerId, interactions, onChange }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { type: '전화', content: '', duration: '', occurred_at: '' },
  })

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: data.type,
          content: data.content || null,
          duration: data.duration ? parseInt(data.duration) : null,
          occurred_at: data.occurred_at || undefined,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange([result.data, ...interactions])
      reset()
      setIsAdding(false)
      toast.success('상담이력이 추가되었습니다')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/interactions/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onChange(interactions.filter(i => i.id !== id))
      toast.success('삭제되었습니다')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* 추가 버튼 */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:border-[#38BDF8] hover:text-[#38BDF8] w-full justify-center transition-colors"
        >
          <Plus size={16} /> 상담이력 추가
        </button>
      )}

      {/* 추가 폼 */}
      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#F8FAFC] rounded-xl p-4 space-y-3 border border-[#E2E8F0]">
          <div className="flex gap-3">
            <select
              {...register('type')}
              className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            >
              {['전화', '문자', '이메일', '방문', '화상', '기타'].map(t => (
                <option key={t} value={t}>{INTERACTION_ICONS[t]} {t}</option>
              ))}
            </select>
            <input
              {...register('duration')}
              type="number"
              placeholder="시간(분)"
              className="w-24 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
            <input
              {...register('occurred_at')}
              type="datetime-local"
              className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
            />
          </div>
          <textarea
            {...register('content')}
            rows={2}
            placeholder="상담 내용 (선택)"
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setIsAdding(false); reset() }}
              className="px-3 py-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[#0F172A] text-white rounded-lg text-sm hover:bg-[#1e293b] disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      )}

      {/* 타임라인 */}
      {interactions.length === 0 ? (
        <p className="text-sm text-[#94A3B8] text-center py-8">상담이력이 없습니다</p>
      ) : (
        <div className="space-y-3">
          {interactions.map((item, idx) => (
            <div key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">
                  {INTERACTION_ICONS[item.type] ?? '📝'}
                </div>
                {idx < interactions.length - 1 && (
                  <div className="w-px flex-1 bg-[#E2E8F0] mt-1" />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1E293B]">{item.type}</span>
                    {item.duration && (
                      <span className="text-xs text-[#94A3B8]">{item.duration}분</span>
                    )}
                    {item.stage_changed_to && (
                      <span className="text-xs bg-[#38BDF8]/10 text-[#0EA5E9] px-2 py-0.5 rounded-full">
                        → {item.stage_changed_to}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8]">{formatDateTime(item.occurred_at)}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {item.content && (
                  <p className="text-sm text-[#64748B] mt-1 whitespace-pre-wrap">{item.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
