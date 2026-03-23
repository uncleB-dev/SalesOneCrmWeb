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
          className={`bg-white rounded-lg border p-3 cursor-pointer select-none transition-shadow ${
            snapshot.isDragging
              ? 'shadow-lg border-[#38BDF8] rotate-1'
              : 'border-[#E2E8F0] hover:shadow-sm hover:border-[#CBD5E1]'
          }`}
        >
          <p className="font-semibold text-sm text-[#1E293B] truncate">{customer.name}</p>
          <p className="text-xs text-[#94A3B8] mt-0.5">{customer.phone}</p>
          {customer.company && (
            <p className="text-xs text-[#64748B] mt-0.5 truncate">{customer.company}</p>
          )}
          {nearestReminder && (
            <div className="flex items-center gap-1 mt-1.5">
              <Bell size={11} className="text-[#F59E0B]" />
              <span className="text-xs text-[#F59E0B]">{formatDate(nearestReminder)}</span>
            </div>
          )}
          {customer.memo && (
            <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-1">{customer.memo}</p>
          )}
          <p className="text-xs text-[#CBD5E1] mt-1">{formatRelative(customer.updated_at)}</p>
        </div>
      )}
    </Draggable>
  )
}
