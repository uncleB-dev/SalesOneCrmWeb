'use client'

import { JOB_TYPE_META, type JobType } from '@/lib/onboarding'

interface Props {
  selected: JobType | null
  onSelect: (jobType: JobType) => void
}

export default function JobTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.entries(JOB_TYPE_META) as [JobType, { label: string; icon: string }][]).map(([key, meta]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            selected === key
              ? 'border-[#38BDF8] bg-[#EFF6FF]'
              : 'border-[#E2E8F0] hover:border-[#94A3B8]'
          }`}
        >
          <span className="text-2xl">{meta.icon}</span>
          <span className={`text-sm font-medium ${selected === key ? 'text-[#0EA5E9]' : 'text-[#374151]'}`}>
            {meta.label}
          </span>
        </button>
      ))}
    </div>
  )
}
