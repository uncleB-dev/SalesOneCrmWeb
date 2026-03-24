'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, ExternalLink, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils/format'
import { INTERACTION_ICONS } from '@/lib/utils/constants'
import type { Interaction, DriveFileRecord } from '@/types'

interface Props {
  customerId: string
  interactions: Interaction[]
  driveFiles: DriveFileRecord[]
  onChange: (interactions: Interaction[]) => void
}

type TimelineItem =
  | { kind: 'interaction'; data: Interaction; date: string }
  | { kind: 'drive_file'; data: DriveFileRecord; date: string }

const AUTO_PREFIXES = ['단계 변경:', '📇', '📅', '📁']

function isEditable(item: Interaction): boolean {
  if (item.stage_changed_to) return false
  const c = item.content ?? ''
  return !AUTO_PREFIXES.some(p => c.startsWith(p))
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── 인라인 편집 폼 ───────────────────────────────────────────────────────────
interface EditFormProps {
  customerId: string
  item: Interaction
  onSave: (updated: Interaction) => void
  onCancel: () => void
}

function InteractionEditForm({ customerId, item, onSave, onCancel }: EditFormProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      type: item.type,
      content: item.content ?? '',
      duration: item.duration ? String(item.duration) : '',
      occurred_at: toDatetimeLocal(item.occurred_at),
    },
  })

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/interactions/${item.id}`, {
        method: 'PATCH',
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
      onSave(result.data)
      toast.success('수정되었습니다')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 pb-3 space-y-2">
      <div className="flex gap-2">
        <select
          {...register('type')}
          className="px-2 py-1.5 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
        >
          {['전화', '문자', '이메일', '방문', '화상', '기타'].map(t => (
            <option key={t} value={t}>{INTERACTION_ICONS[t]} {t}</option>
          ))}
        </select>
        <input
          {...register('occurred_at')}
          type="datetime-local"
          className="flex-1 px-2 py-1.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
        />
      </div>
      <textarea
        {...register('content')}
        rows={2}
        placeholder="상담 내용 (선택)"
        className="w-full px-2 py-1.5 border border-[#E2E8F0] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#94A3B8]">소요시간</span>
        <input
          {...register('duration')}
          type="number"
          placeholder="분"
          className="w-16 px-2 py-1.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
        />
        <span className="text-xs text-[#94A3B8]">분</span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-[#64748B] hover:text-[#1E293B]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-sm hover:bg-[#1e293b] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
            저장
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function InteractionTimeline({ customerId, interactions, driveFiles, onChange }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const handleSaveEdit = (updated: Interaction) => {
    onChange(interactions.map(i => i.id === updated.id ? updated : i))
    setEditingId(null)
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
      {(() => {
        const merged: TimelineItem[] = [
          ...interactions.map(i => ({ kind: 'interaction' as const, data: i, date: i.occurred_at })),
          ...driveFiles.map(f => ({ kind: 'drive_file' as const, data: f, date: f.modified_time ?? f.last_seen_at ?? '' })),
        ].sort((a, b) => b.date.localeCompare(a.date))

        if (merged.length === 0) {
          return <p className="text-sm text-[#94A3B8] text-center py-8">상담이력이 없습니다</p>
        }

        return (
          <div className="space-y-3">
            {merged.map((item, idx) => (
              <div key={item.kind === 'interaction' ? item.data.id : item.data.file_id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-base flex-shrink-0">
                    {item.kind === 'drive_file' ? '📁' : (INTERACTION_ICONS[item.data.type] ?? '📝')}
                  </div>
                  {idx < merged.length - 1 && (
                    <div className="w-px flex-1 bg-[#E2E8F0] mt-1" />
                  )}
                </div>

                {item.kind === 'drive_file' ? (
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://drive.google.com/file/d/${item.data.file_id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#3B82F6] hover:underline flex items-center gap-1"
                        >
                          {item.data.file_name}
                          <ExternalLink size={11} />
                        </a>
                        {item.data.is_deleted && (
                          <span className="text-xs text-[#94A3B8] line-through">삭제됨</span>
                        )}
                      </div>
                      <span className="text-xs text-[#94A3B8]">
                        {item.data.modified_time ? formatDateTime(item.data.modified_time) : ''}
                      </span>
                    </div>
                  </div>
                ) : editingId === item.data.id ? (
                  <InteractionEditForm
                    customerId={customerId}
                    item={item.data}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1E293B]">{item.data.type}</span>
                        {item.data.duration && (
                          <span className="text-xs text-[#94A3B8]">{item.data.duration}분</span>
                        )}
                        {item.data.stage_changed_to && (
                          <span className="text-xs bg-[#38BDF8]/10 text-[#0EA5E9] px-2 py-0.5 rounded-full">
                            → {item.data.stage_changed_to}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#94A3B8] mr-1">{formatDateTime(item.data.occurred_at)}</span>
                        {isEditable(item.data) && (
                          <button
                            onClick={() => setEditingId(item.data.id)}
                            className="p-1 text-[#94A3B8] hover:text-[#38BDF8] transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.data.id)}
                          className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {item.data.content && (
                      <p className="text-sm text-[#64748B] mt-1 whitespace-pre-wrap">{item.data.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}
