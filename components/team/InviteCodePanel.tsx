'use client'

import { useState, useEffect } from 'react'
import { Copy, RefreshCw, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { InviteCode } from '@/types'

export default function InviteCodePanel() {
  const [code, setCode] = useState<InviteCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchCode = async () => {
    try {
      const res = await fetch('/api/v1/team/invite')
      const result = await res.json()
      if (result.success) setCode(result.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCode() }, [])

  const generateCode = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/v1/team/invite', { method: 'POST' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setCode(result.data)
      toast.success('새 초대 코드가 생성되었습니다')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('클립보드에 복사되었습니다')
  }

  const daysLeft = code
    ? Math.ceil((new Date(code.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-[#94A3B8]">팀 초대 코드</p>
          {code && <p className="text-xs text-[#64748B] mt-0.5">{daysLeft}일 후 만료</p>}
        </div>
        <button
          onClick={generateCode}
          disabled={generating}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          title="새 코드 생성"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
      ) : code ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono font-bold tracking-[0.3em] flex-1">
            {code.code}
          </span>
          <button
            onClick={copyCode}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {copied ? <Check size={16} className="text-[#10B981]" /> : <Copy size={16} />}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#64748B]">초대 코드가 없습니다</span>
          <button
            onClick={generateCode}
            disabled={generating}
            className="text-xs text-[#38BDF8] hover:underline disabled:opacity-50"
          >
            생성하기
          </button>
        </div>
      )}
    </div>
  )
}
