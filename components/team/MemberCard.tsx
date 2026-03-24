'use client'

import { useState } from 'react'
import { ChevronDown, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { EnrichedMember } from '@/types'

interface Props {
  member: EnrichedMember
  isManager: boolean
  currentUserId: string
  teamManagerId: string
  onUpdated: () => void
}

const ROLE_LABELS: Record<string, string> = {
  manager: '매니저',
  member: '멤버',
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.length >= 2 ? trimmed.slice(0, 2) : trimmed
}

export default function MemberCard({ member, isManager, currentUserId, teamManagerId, onUpdated }: Props) {
  const [removing, setRemoving] = useState(false)

  const isSelf = member.user_id === currentUserId
  const isTeamOwner = member.user_id === teamManagerId

  const handleRoleChange = async (newRole: 'manager' | 'member') => {
    if (newRole === member.role) return
    try {
      const res = await fetch(`/api/v1/team/members/${member.user_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('역할이 변경되었습니다')
      onUpdated()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleRemove = async () => {
    const msg = isSelf ? '팀에서 탈퇴하시겠습니까?' : `"${member.name}"을(를) 팀에서 제거하시겠습니까?`
    if (!confirm(msg)) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/v1/team/members/${member.user_id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success(isSelf ? '팀에서 탈퇴했습니다' : '팀원이 제거되었습니다')
      onUpdated()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
          isTeamOwner ? 'bg-[#0F172A]' : 'bg-[#38BDF8]'
        )}>
          {getInitials(member.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-[#1E293B] truncate">{member.name}</span>
            {isSelf && <span className="text-xs text-[#94A3B8] flex-shrink-0">(나)</span>}
          </div>
          <p className="text-xs text-[#94A3B8] truncate">{member.email}</p>
        </div>

        {/* Role badge + actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Role */}
          {isManager && !isSelf && !isTeamOwner ? (
            <div className="relative group">
              <button className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors">
                {ROLE_LABELS[member.role]}
                <ChevronDown size={11} />
              </button>
              <div className="absolute right-0 top-7 w-24 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 hidden group-hover:block z-10">
                {(['manager', 'member'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-xs hover:bg-[#F8FAFC] transition-colors',
                      member.role === r ? 'text-[#38BDF8] font-medium' : 'text-[#1E293B]'
                    )}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <span className={cn(
              'text-xs px-2 py-1 rounded-lg',
              isTeamOwner
                ? 'bg-[#0F172A]/10 text-[#0F172A] font-medium'
                : 'bg-[#F1F5F9] text-[#64748B]'
            )}>
              {isTeamOwner ? '팀장' : ROLE_LABELS[member.role]}
            </span>
          )}

          {/* Remove / Leave button */}
          {(!isTeamOwner && (isManager || isSelf)) && (
            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-1.5 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title={isSelf ? '팀 탈퇴' : '팀원 제거'}
            >
              <UserMinus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#F1F5F9]">
        <div className="text-center">
          <p className="text-lg font-bold text-[#1E293B]">{member.stats.totalCustomers}</p>
          <p className="text-[10px] text-[#94A3B8]">전체 고객</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#10B981]">{member.stats.newThisMonth}</p>
          <p className="text-[10px] text-[#94A3B8]">이번달 신규</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#60A5FA]">{member.stats.interactions}</p>
          <p className="text-[10px] text-[#94A3B8]">이번달 상담</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#A78BFA]">{member.stats.contracts}</p>
          <p className="text-[10px] text-[#94A3B8]">계약 완료</p>
        </div>
      </div>
    </div>
  )
}
