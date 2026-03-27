'use client'

import { Draggable } from '@hello-pangea/dnd'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { formatRelative, formatDate } from '@/lib/utils/format'
import type { Customer } from '@/types'

interface Props {
  customer: Customer
  index: number
  isDraggable?: boolean
  nearestReminder?: string | null
}

export default function KanbanCard({ customer, index, isDraggable = true, nearestReminder }: Props) {
  const router = useRouter()

  return (
    <Draggable draggableId={customer.id} index={index} isDragDisabled={!isDraggable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
          className={`rounded-lg border p-3 cursor-pointer select-none transition-all ${
            snapshot.isDragging
              ? 'bg-white/95 backdrop-blur-sm shadow-lg border-[#0abfbc] rotate-1 scale-[1.02]'
              : 'bg-white/85 backdrop-blur-sm border-[#bbc9c8]/50 hover:bg-white hover:border-[#0abfbc]/40 hover:shadow-sm'
          }`}
        >
          <p className="font-semibold text-sm text-[#1a1c1e] truncate">{customer.name}</p>
          <p className="text-xs text-[#6c7a79] mt-0.5">{customer.phone}</p>
          {customer.company && (
            <p className="text-xs text-[#4e5e80] mt-0.5 truncate">{customer.company}</p>
          )}
          {nearestReminder && (
            <div className="flex items-center gap-1 mt-1.5">
              <Bell size={11} className="text-[#D97706]" />
              <span className="text-xs text-[#D97706]">{formatDate(nearestReminder)}</span>
            </div>
          )}
          {customer.memo && (
            <p className="text-xs text-[#6c7a79] mt-1.5 line-clamp-1">{customer.memo}</p>
          )}
          <p className="text-xs text-[#bbc9c8] mt-1">{formatRelative(customer.updated_at)}</p>
        </div>
      )}
    </Draggable>
  )
}
