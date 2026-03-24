'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus2 } from 'lucide-react'
import CreateTeamForm from '@/components/team/CreateTeamForm'
import JoinTeamForm from '@/components/team/JoinTeamForm'
import InviteCodePanel from '@/components/team/InviteCodePanel'
import MemberCard from '@/components/team/MemberCard'
import type { TeamData } from '@/types'

interface Props {
  currentUserId: string
}

export default function TeamPageClient({ currentUserId }: Props) {
  const [teamData, setTeamData] = useState<TeamData | null | 'loading'>('loading')

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/team')
      const result = await res.json()
      if (result.success) {
        setTeamData(result.data)
      }
    } catch {
      setTeamData(null)
    }
  }, [])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  if (teamData === 'loading') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-8 w-40 bg-[#F1F5F9] rounded-lg animate-pulse" />
        <div className="h-24 bg-[#F1F5F9] rounded-2xl animate-pulse" />
        <div className="h-24 bg-[#F1F5F9] rounded-2xl animate-pulse" />
      </div>
    )
  }

  // No team: show create / join
  if (!teamData) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A]/5 flex items-center justify-center">
            <Users size={20} className="text-[#0F172A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">팀 관리</h1>
            <p className="text-xs text-[#94A3B8]">팀을 만들거나 초대 코드로 가입하세요</p>
          </div>
        </div>

        <div className="space-y-4">
          <CreateTeamForm onCreated={fetchTeam} />
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">또는</span>
            <div className="flex-1 border-t border-[#E2E8F0]" />
          </div>
          <JoinTeamForm onJoined={fetchTeam} />
        </div>
      </div>
    )
  }

  const { team, members, isManager } = teamData

  return (
    <div className="p-4 md:p-6">
      {/* 팀 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E293B]">{team.name}</h1>
            <p className="text-xs text-[#94A3B8]">팀원 {members.length}명</p>
          </div>
        </div>
        <UserPlus2 size={18} className="text-[#94A3B8]" />
      </div>

      {/* 초대 코드 (팀장만) */}
      {isManager && (
        <div className="mb-6">
          <InviteCodePanel />
        </div>
      )}

      {/* 팀원 목록 */}
      <div>
        <h2 className="text-sm font-semibold text-[#64748B] mb-3">팀원</h2>
        <div className="space-y-3">
          {members.map(member => (
            <MemberCard
              key={member.user_id}
              member={member}
              isManager={isManager}
              currentUserId={currentUserId}
              teamManagerId={team.manager_id}
              onUpdated={fetchTeam}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
