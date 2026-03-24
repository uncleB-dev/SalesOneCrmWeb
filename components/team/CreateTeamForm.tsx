'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  onCreated: () => void
}

export default function CreateTeamForm({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('팀 이름을 입력해주세요'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/v1/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('팀이 생성되었습니다')
      onCreated()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center">
          <Users size={20} className="text-[#38BDF8]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1E293B]">팀 만들기</h3>
          <p className="text-xs text-[#94A3B8]">팀을 생성하고 팀원을 초대하세요</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          placeholder="팀 이름 (예: 드림 영업팀)"
          className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-[#38BDF8] transition-colors"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="px-4 py-2 bg-[#38BDF8] text-white text-sm font-medium rounded-lg hover:bg-[#0EA5E9] disabled:opacity-50 transition-colors"
        >
          {loading ? '생성 중...' : '생성'}
        </button>
      </div>
    </div>
  )
}
