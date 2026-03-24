'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  onJoined: () => void
}

export default function JoinTeamForm({ onJoined }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    if (!code.trim()) { toast.error('초대 코드를 입력해주세요'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/v1/team/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success('팀에 가입했습니다')
      onJoined()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
          <LogIn size={20} className="text-[#10B981]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1E293B]">초대 코드로 가입</h3>
          <p className="text-xs text-[#94A3B8]">팀장에게 받은 코드를 입력하세요</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="초대 코드 8자리"
          maxLength={8}
          className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg outline-none focus:border-[#10B981] font-mono tracking-widest transition-colors"
        />
        <button
          onClick={handleJoin}
          disabled={loading || code.length < 6}
          className="px-4 py-2 bg-[#10B981] text-white text-sm font-medium rounded-lg hover:bg-[#059669] disabled:opacity-50 transition-colors"
        >
          {loading ? '가입 중...' : '가입'}
        </button>
      </div>
    </div>
  )
}
