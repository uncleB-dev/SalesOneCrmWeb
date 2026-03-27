'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import KanbanCard from './KanbanCard'
import type { KanbanColumn, Customer } from '@/types'

interface Props {
  initialPipeline: KanbanColumn[]
  initialEscape: KanbanColumn[]
  isDraggable?: boolean
  reminders?: Record<string, string> // customerId -> nearest due_date
}

export default function KanbanBoard({
  initialPipeline,
  initialEscape,
  isDraggable = true,
  reminders = {},
}: Props) {
  const [isMounted, setIsMounted] = useState(false)
  const [pipelineCols, setPipelineCols] = useState(initialPipeline)
  const [escapeCols, setEscapeCols] = useState(initialEscape)

  useEffect(() => setIsMounted(true), [])

  const allCols = useCallback(() => [...pipelineCols, ...escapeCols], [pipelineCols, escapeCols])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcColId = source.droppableId
    const dstColId = destination.droppableId

    const prevPipeline = [...pipelineCols]
    const prevEscape = [...escapeCols]

    // Helper: find and update columns
    const updateCols = (cols: KanbanColumn[]): KanbanColumn[] => {
      const srcCol = cols.find(c => c.id === srcColId)
      const dstCol = cols.find(c => c.id === dstColId)

      if (srcColId === dstColId && srcCol) {
        // Same column reorder
        const items = [...srcCol.customers]
        const [moved] = items.splice(source.index, 1)
        items.splice(destination.index, 0, moved)
        return cols.map(c => c.id === srcColId ? { ...c, customers: items } : c)
      }

      if (srcCol && dstCol) {
        const srcItems = srcCol.customers.filter(c => c.id !== draggableId)
        const movedCustomer = srcCol.customers.find(c => c.id === draggableId)!
        const dstItems = [...dstCol.customers]
        dstItems.splice(destination.index, 0, { ...movedCustomer, stage: dstCol.name })
        return cols
          .map(c => c.id === srcColId ? { ...c, customers: srcItems } : c)
          .map(c => c.id === dstColId ? { ...c, customers: dstItems } : c)
      }
      return cols
    }

    // Cross-section move: find which section each col belongs to
    const srcInPipeline = pipelineCols.some(c => c.id === srcColId)
    const dstInPipeline = pipelineCols.some(c => c.id === dstColId)
    const srcInEscape = escapeCols.some(c => c.id === srcColId)
    const dstInEscape = escapeCols.some(c => c.id === dstColId)

    if (srcColId === dstColId) {
      // Same column reorder
      if (srcInPipeline) setPipelineCols(cols => updateCols(cols))
      else setEscapeCols(cols => updateCols(cols))
    } else if (srcInPipeline && dstInPipeline) {
      setPipelineCols(cols => updateCols(cols))
    } else if (srcInEscape && dstInEscape) {
      setEscapeCols(cols => updateCols(cols))
    } else {
      // Cross-section: move customer between pipeline and escape
      const movedCustomer = (srcInPipeline ? pipelineCols : escapeCols)
        .find(c => c.id === srcColId)
        ?.customers.find(c => c.id === draggableId)
      if (!movedCustomer) return

      const dstColName = (dstInPipeline ? pipelineCols : escapeCols)
        .find(c => c.id === dstColId)?.name ?? ''

      const updatedCustomer = { ...movedCustomer, stage: dstColName }

      if (srcInPipeline) {
        setPipelineCols(cols => cols.map(c =>
          c.id === srcColId ? { ...c, customers: c.customers.filter(cu => cu.id !== draggableId) } : c
        ))
        setEscapeCols(cols => cols.map(c => {
          if (c.id !== dstColId) return c
          const items = [...c.customers]
          items.splice(destination.index, 0, updatedCustomer)
          return { ...c, customers: items }
        }))
      } else {
        setEscapeCols(cols => cols.map(c =>
          c.id === srcColId ? { ...c, customers: c.customers.filter(cu => cu.id !== draggableId) } : c
        ))
        setPipelineCols(cols => cols.map(c => {
          if (c.id !== dstColId) return c
          const items = [...c.customers]
          items.splice(destination.index, 0, updatedCustomer)
          return { ...c, customers: items }
        }))
      }
    }

    // API call
    try {
      if (srcColId !== dstColId) {
        // Stage change
        const dstColName = allCols().find(c => c.id === dstColId)?.name
          ?? [...pipelineCols, ...escapeCols].find(c => c.id === dstColId)?.name ?? ''
        const res = await fetch(`/api/v1/customers/${draggableId}/stage`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: dstColName }),
        })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
      } else {
        // Reorder within same column
        const col = [...pipelineCols, ...escapeCols].find(c => c.id === srcColId)
        if (col) {
          const items = col.customers.map((c, i) => ({ id: c.id, order_index: i }))
          await fetch('/api/v1/customers/reorder', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          })
        }
      }
    } catch (e: any) {
      // Rollback
      setPipelineCols(prevPipeline)
      setEscapeCols(prevEscape)
      toast.error('이동에 실패했습니다: ' + e.message)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-5 flex-shrink-0 mb-2" />
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex flex-row gap-3 pb-2">
            {initialPipeline.map(col => (
              <div
                key={col.id}
                className="min-w-[180px] md:min-w-[210px] md:max-w-[210px] flex-shrink-0 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] h-full animate-pulse overflow-hidden"
                style={{ borderTop: `4px solid ${col.color}` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderColumn = (col: KanbanColumn) => (
    <div
      key={col.id}
      className="min-w-[180px] max-w-[180px] md:min-w-[210px] md:max-w-[210px] flex-shrink-0 flex flex-col rounded-xl overflow-hidden border border-[#E2E8F0] h-full"
      style={{ borderTop: `4px solid ${col.color}` }}
    >
      {/* 컬럼 헤더 */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ backgroundColor: `${col.color}33` }}
      >
        <span className="text-[13px] font-semibold truncate max-w-[110px]" style={{ color: col.color }}>
          {col.name}
        </span>
        <span
          className="text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0"
          style={{ backgroundColor: col.color }}
        >
          {col.customers.length}
        </span>
      </div>

      {/* Droppable 영역 */}
      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto min-h-0 p-2 space-y-1.5 transition-colors scrollbar-kanban ${
              snapshot.isDraggingOver ? 'bg-[#EFF6FF] border-2 border-dashed border-[#38BDF8]' : 'bg-[#F8FAFC]'
            }`}
          >
            {col.customers.map((customer, index) => (
              <KanbanCard
                key={customer.id}
                customer={customer}
                index={index}
                isDraggable={isDraggable}
                nearestReminder={reminders[customer.id] ?? null}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )

  return (
    <DragDropContext onDragEnd={isDraggable ? onDragEnd : () => {}}>
      <div className="flex flex-col h-full gap-4">
        {/* 영업 파이프라인 섹션 */}
        <div className="flex flex-col flex-1 min-h-0">
          <h2 className="text-sm font-semibold text-[#64748B] mb-2 px-1 flex-shrink-0">영업 파이프라인</h2>
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex flex-row gap-3 pb-2">
            {pipelineCols.map(renderColumn)}
          </div>
        </div>

        {/* 이탈 관리 섹션 */}
        {escapeCols.length > 0 && (
          <div className="flex-shrink-0">
            <div className="border-t-2 border-dashed border-red-200 pt-3">
              <h2 className="text-sm font-semibold text-red-400 mb-2 px-1">이탈 관리</h2>
              <div className="overflow-x-auto overflow-y-hidden flex flex-row gap-3 h-[160px]">
                {escapeCols.map(renderColumn)}
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}
