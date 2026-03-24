'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, ChevronDown } from 'lucide-react'
import KanbanBoard from '@/components/pipeline/KanbanBoard'
import type { TeamData, KanbanColumn } from '@/types'

interface Props {
  currentUserId: string
}

export default function TeamPipelineClient({ currentUserId }: Props) {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [pipelineData, setPipelineData] = useState<{ pipeline: KanbanColumn[]; escape: KanbanColumn[] } | null>(null)
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [loadingPipeline, setLoadingPipeline] = useState(false)

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/team')
      const result = await res.json()
      if (result.success && result.data) {
        setTeamData(result.data)
      }
    } finally {
      setLoadingTeam(false)
    }
  }, [])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const fetchPipeline = useCallback(async (userId: string) => {
    setLoadingPipeline(true)
    setPipelineData(null)
    try {
      const res = await fetch(`/api/v1/team/members/${userId}/pipeline`)
      const result = await res.json()
      if (result.success) setPipelineData(result.data)
    } finally {
      setLoadingPipeline(false)
    }
  }, [])

  const handleSelectMember = (userId: string) => {
    setSelectedUserId(userId)
    fetchPipeline(userId)
  }

  const selectedMember = teamData?.members.find(m => m.user_id === selectedUserId)

  if (loadingTeam) {
    return (
      <div className="p-4 md:p-6">
        <div className="h-10 w-56 bg-[#F1F5F9] rounded-xl animate-pulse mb-6" />
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[200px] h-48 bg-[#F1F5F9] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="p-4 md:p-6 text-center py-20">
        <Users size={32} className="text-[#E2E8F0] mx-auto mb-3" />
        <p className="text-sm text-[#94A3B8]">팀에 속해있지 않습니다</p>
        <a href="/dashboard/team" className="text-xs text-[#38BDF8] mt-1 hover:underline block">
          팀 만들기 또는 가입하기 →
        </a>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* 팀원 선택 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <select
            value={selectedUserId ?? ''}
            onChange={e => e.target.value && handleSelectMember(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white text-[#1E293B] outline-none focus:border-[#38BDF8] transition-colors cursor-pointer"
          >
            <option value="">팀원 선택...</option>
            {teamData.members.map(m => (
              <option key={m.user_id} value={m.user_id}>
                {m.name} {m.user_id === currentUserId ? '(나)' : ''}
                {m.user_id === teamData.team.manager_id ? ' 👑' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
        </div>

        {selectedMember && (
          <span className="text-sm text-[#64748B]">
            {selectedMember.name}의 파이프라인
            <span className="ml-1 text-xs text-[#94A3B8]">(읽기 전용)</span>
          </span>
        )}
      </div>

      {/* 파이프라인 */}
      {!selectedUserId ? (
        <div className="text-center py-16">
          <Users size={32} className="text-[#E2E8F0] mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">위에서 팀원을 선택하세요</p>
        </div>
      ) : loadingPipeline ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[200px] h-48 bg-[#F1F5F9] rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      ) : pipelineData ? (
        <KanbanBoard
          initialPipeline={pipelineData.pipeline}
          initialEscape={pipelineData.escape}
          isDraggable={false}
        />
      ) : null}
    </div>
  )
}
