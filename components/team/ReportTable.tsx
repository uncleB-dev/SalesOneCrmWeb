'use client'

import { TrendingUp, MessageSquare, Bell, UserPlus } from 'lucide-react'
import type { MemberReport } from '@/types'

interface Props {
  members: MemberReport[]
}

export default function ReportTable({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-[#94A3B8]">
        표시할 데이터가 없습니다
      </div>
    )
  }

  const sorted = [...members].sort((a, b) => b.contracts - a.contracts)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#F1F5F9]">
            <th className="text-left py-3 px-4 text-xs font-medium text-[#94A3B8]">팀원</th>
            <th className="hidden sm:table-cell text-center py-3 px-3 text-xs font-medium text-[#94A3B8]">
              <span className="flex items-center justify-center gap-1">
                <UserPlus size={11} /> 신규
              </span>
            </th>
            <th className="hidden sm:table-cell text-center py-3 px-3 text-xs font-medium text-[#94A3B8]">
              <span className="flex items-center justify-center gap-1">
                <MessageSquare size={11} /> 상담
              </span>
            </th>
            <th className="hidden sm:table-cell text-center py-3 px-3 text-xs font-medium text-[#94A3B8]">
              <span className="flex items-center justify-center gap-1">
                <Bell size={11} /> 리마인더
              </span>
            </th>
            <th className="text-center py-3 px-3 text-xs font-medium text-[#94A3B8]">
              <span className="flex items-center justify-center gap-1">
                <TrendingUp size={11} /> 계약
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((member, i) => {
            const reminderRate = member.remindersTotal > 0
              ? Math.round((member.remindersCompleted / member.remindersTotal) * 100)
              : null

            return (
              <tr key={member.userId} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-[#F97316]' : 'bg-[#E2E8F0]'}`} />
                    <div className="min-w-0">
                      <p className="font-medium text-[#1E293B] truncate">{member.name}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden sm:table-cell py-3 px-3 text-center font-semibold text-[#1E293B]">{member.newCustomers}</td>
                <td className="hidden sm:table-cell py-3 px-3 text-center font-semibold text-[#60A5FA]">{member.interactions}</td>
                <td className="hidden sm:table-cell py-3 px-3 text-center">
                  <span className="font-semibold text-[#1E293B]">{member.remindersCompleted}</span>
                  <span className="text-xs text-[#94A3B8]">/{member.remindersTotal}</span>
                  {reminderRate !== null && (
                    <span className="ml-1 text-xs text-[#10B981]">{reminderRate}%</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#A78BFA]">{member.contracts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
