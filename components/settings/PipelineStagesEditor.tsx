'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, Trash2, GripVertical, Check, X, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { PipelineStage } from '@/types'

const COLOR_PALETTE = [
  '#94A3B8', '#60A5FA', '#A78BFA', '#C084FC',
  '#FBBF24', '#F97316', '#10B981', '#14B8A6',
  '#6366F1', '#EF4444',
]

const PIPELINE_MIN = 1
const PIPELINE_MAX = 20
const ESCAPE_MAX = 5

interface Props {
  initialStages: PipelineStage[]
  customerCountByStage: Record<string, number>
  onSaved?: (stages: PipelineStage[]) => void
}

export default function PipelineStagesEditor({ initialStages, customerCountByStage, onSaved }: Props) {
  const [isMounted, setIsMounted] = useState(false)
  const [pipeline, setPipeline] = useState<PipelineStage[]>(
    initialStages.filter(s => s.stage_type === 'pipeline')
  )
  const [escape, setEscape] = useState<PipelineStage[]>(
    initialStages.filter(s => s.stage_type === 'escape')
  )
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Start edit
  const startEdit = (stage: PipelineStage) => {
    setEditingId(stage.id)
    setEditingName(stage.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const confirmEdit = async (stage: PipelineStage, setter: React.Dispatch<React.SetStateAction<PipelineStage[]>>) => {
    const newName = editingName.trim()
    if (!newName || newName === stage.name) { cancelEdit(); return }

    // If stage has customers and is already saved (has real UUID), update via API
    if (!stage.id.startsWith('new-')) {
      try {
        const res = await fetch(`/api/v1/pipeline-stages/${stage.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
        setter(prev => prev.map(s => s.id === stage.id ? { ...s, name: newName } : s))
        toast.success('단계명이 수정되었습니다')
      } catch (e: any) {
        toast.error(e.message)
      }
    } else {
      // New unsaved stage — just update local state
      setter(prev => prev.map(s => s.id === stage.id ? { ...s, name: newName } : s))
    }
    cancelEdit()
  }

  const updateColor = (id: string, color: string, setter: React.Dispatch<React.SetStateAction<PipelineStage[]>>) => {
    setter(prev => prev.map(s => s.id === id ? { ...s, color } : s))
  }

  const addStage = (type: 'pipeline' | 'escape') => {
    const setter = type === 'pipeline' ? setPipeline : setEscape
    const current = type === 'pipeline' ? pipeline : escape
    if (type === 'pipeline' && current.length >= PIPELINE_MAX) {
      toast.error(`최대 ${PIPELINE_MAX}개까지 추가할 수 있습니다`)
      return
    }
    if (type === 'escape' && current.length >= ESCAPE_MAX) {
      toast.error(`이탈 관리는 최대 ${ESCAPE_MAX}개까지 추가할 수 있습니다`)
      return
    }
    const newStage: PipelineStage = {
      id: `new-${Date.now()}`,
      user_id: '',
      name: '새 단계',
      color: '#94A3B8',
      order_index: current.length,
      stage_type: type,
      is_default: false,
      created_at: new Date().toISOString(),
    }
    setter(prev => [...prev, newStage])
    // Auto-start editing the new stage
    setTimeout(() => {
      setEditingId(newStage.id)
      setEditingName('새 단계')
    }, 50)
  }

  const deleteStage = async (stage: PipelineStage, setter: React.Dispatch<React.SetStateAction<PipelineStage[]>>, type: 'pipeline' | 'escape') => {
    const current = type === 'pipeline' ? pipeline : escape
    if (type === 'pipeline' && current.length <= PIPELINE_MIN) {
      toast.error(`최소 ${PIPELINE_MIN}개는 있어야 합니다`)
      return
    }
    if (type === 'escape' && current.length <= 1) {
      toast.error('이탈 관리는 최소 1개는 있어야 합니다')
      return
    }

    const count = customerCountByStage[stage.name] ?? 0
    if (count > 0) {
      toast.error(`"${stage.name}"에 고객 ${count}명이 있어 삭제할 수 없습니다`)
      return
    }

    // If real stage, delete via API
    if (!stage.id.startsWith('new-')) {
      try {
        const res = await fetch(`/api/v1/pipeline-stages/${stage.id}`, { method: 'DELETE' })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
      } catch (e: any) {
        toast.error(e.message)
        return
      }
    }

    setter(prev => prev.filter(s => s.id !== stage.id))
    toast.success('단계가 삭제되었습니다')
  }

  const onDragEnd = (result: DropResult, setter: React.Dispatch<React.SetStateAction<PipelineStage[]>>) => {
    if (!result.destination) return
    setter(prev => {
      const items = [...prev]
      const [moved] = items.splice(result.source.index, 1)
      items.splice(result.destination!.index, 0, moved)
      return items.map((s, i) => ({ ...s, order_index: i }))
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const allStages = [
        ...pipeline.map((s, i) => ({ ...s, order_index: i, stage_type: 'pipeline' as const })),
        ...escape.map((s, i) => ({ ...s, order_index: i, stage_type: 'escape' as const })),
      ]
      const res = await fetch('/api/v1/pipeline-stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: allStages }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(JSON.stringify(result.error))
      toast.success('파이프라인 설정이 저장되었습니다')
      onSaved?.(result.data)
    } catch (e: any) {
      toast.error(e.message || '저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const renderStageList = (
    stages: PipelineStage[],
    setter: React.Dispatch<React.SetStateAction<PipelineStage[]>>,
    type: 'pipeline' | 'escape',
    droppableId: string
  ) => (
    <DragDropContext onDragEnd={r => onDragEnd(r, setter)}>
      <Droppable droppableId={droppableId}>
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {stages.map((stage, index) => {
              const count = customerCountByStage[stage.name] ?? 0
              const isDeletable = count === 0
              const isEditing = editingId === stage.id

              return (
                <Draggable key={stage.id} draggableId={stage.id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className={cn(
                        'flex items-center gap-3 bg-white rounded-xl border p-3 transition-shadow',
                        snap.isDragging ? 'shadow-lg border-[#38BDF8]' : 'border-[#E2E8F0]'
                      )}
                    >
                      {/* 드래그 핸들 */}
                      <div {...prov.dragHandleProps} className="text-[#CBD5E1] cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} />
                      </div>

                      {/* 색상 선택 */}
                      <div className="relative group">
                        <div
                          className="w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-1 ring-transparent group-hover:ring-[#38BDF8] transition-all"
                          style={{ backgroundColor: stage.color }}
                        />
                        <div className="absolute left-0 top-8 z-10 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-2 hidden group-hover:grid grid-cols-5 gap-1.5 w-36">
                          {COLOR_PALETTE.map(c => (
                            <button
                              key={c}
                              onClick={() => updateColor(stage.id, c, setter)}
                              className={cn(
                                'w-5 h-5 rounded-full transition-transform hover:scale-110',
                                stage.color === c && 'ring-2 ring-offset-1 ring-[#38BDF8]'
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 이름 (편집 or 표시) */}
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmEdit(stage, setter)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-[#38BDF8] rounded-lg outline-none"
                        />
                      ) : (
                        <span className="flex-1 text-sm font-medium text-[#1E293B]">{stage.name}</span>
                      )}

                      {/* 고객 수 배지 */}
                      {count > 0 && (
                        <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">
                          {count}명
                        </span>
                      )}

                      {/* 액션 버튼 */}
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button onClick={() => confirmEdit(stage, setter)} className="p-1.5 text-[#10B981] hover:bg-green-50 rounded-lg">
                            <Check size={15} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-[#94A3B8] hover:bg-[#F8FAFC] rounded-lg">
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(stage)}
                            className="p-1.5 text-[#94A3B8] hover:text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteStage(stage, setter, type)}
                            disabled={!isDeletable}
                            className={cn(
                              'p-1.5 rounded-lg transition-colors',
                              isDeletable
                                ? 'text-[#94A3B8] hover:text-red-500 hover:bg-red-50'
                                : 'text-[#E2E8F0] cursor-not-allowed'
                            )}
                            title={!isDeletable ? `고객 ${count}명이 있어 삭제 불가` : '삭제'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )

  return (
    <div className="space-y-8">
      {/* 영업 파이프라인 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1E293B]">영업 파이프라인</h3>
            <p className="text-sm text-[#94A3B8]">
              {pipeline.length}/{PIPELINE_MAX}개 · 최소 {PIPELINE_MIN}개
            </p>
          </div>
          {pipeline.length < PIPELINE_MAX && (
            <button
              onClick={() => addStage('pipeline')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#38BDF8] border border-[#38BDF8]/30 rounded-lg hover:bg-[#38BDF8]/5 transition-colors"
            >
              <Plus size={15} /> 단계 추가
            </button>
          )}
        </div>
        {renderStageList(pipeline, setPipeline, 'pipeline', 'pipeline-droppable')}
      </div>

      {/* 이탈 관리 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#EF4444]">이탈 관리</h3>
            <p className="text-sm text-[#94A3B8]">
              {escape.length}/{ESCAPE_MAX}개 · 최소 1개
            </p>
          </div>
          {escape.length < ESCAPE_MAX && (
            <button
              onClick={() => addStage('escape')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Plus size={15} /> 단계 추가
            </button>
          )}
        </div>
        <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
          {renderStageList(escape, setEscape, 'escape', 'escape-droppable')}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </div>
  )
}
