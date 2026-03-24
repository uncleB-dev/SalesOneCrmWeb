'use client'

import { cn } from '@/lib/utils'

export type Period = 'week' | 'month' | 'last_month'

const PERIOD_LABELS: Record<Period, string> = {
  week: '이번 주',
  month: '이번 달',
  last_month: '지난 달',
}

interface Props {
  value: Period
  onChange: (period: Period) => void
}

export default function PeriodFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl">
      {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'flex-1 py-1.5 text-sm font-medium rounded-lg transition-all',
            value === p
              ? 'bg-white text-[#1E293B] shadow-sm'
              : 'text-[#64748B] hover:text-[#1E293B]'
          )}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}
