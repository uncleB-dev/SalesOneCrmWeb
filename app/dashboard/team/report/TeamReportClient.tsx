'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import PeriodFilter, { type Period } from '@/components/team/PeriodFilter'
import ReportTable from '@/components/team/ReportTable'
import { formatDate } from '@/lib/utils/format'
import type { MemberReport } from '@/types'

interface ReportData {
  period: string
  startDate: string
  endDate: string
  members: MemberReport[]
}

export default function TeamReportClient() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [noTeam, setNoTeam] = useState(false)

  const fetchReport = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/team/report?period=${p}`)
      const result = await res.json()
      if (!result.success) {
        if (res.status === 403) { setNoTeam(true); return }
        throw new Error(result.error)
      }
      setData(result.data)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReport(period) }, [period, fetchReport])

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    fetchReport(p)
  }

  if (noTeam) {
    return (
      <div className="p-4 md:p-6 text-center py-20">
        <BarChart3 size={32} className="text-[#E2E8F0] mx-auto mb-3" />
        <p className="text-sm text-[#94A3B8]">팀에 속해있지 않습니다</p>
        <a href="/dashboard/team" className="text-xs text-[#38BDF8] mt-1 hover:underline block">
          팀 만들기 또는 가입하기 →
        </a>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
          <BarChart3 size={18} className="text-[#6366F1]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">팀 활동 리포트</h1>
          {data && (
            <p className="text-xs text-[#94A3B8]">
              {formatDate(data.startDate.split('T')[0])} ~ {formatDate(data.endDate.split('T')[0])}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <PeriodFilter value={period} onChange={handlePeriodChange} />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-[#F8FAFC] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <ReportTable members={data?.members ?? []} />
        )}
      </div>
    </div>
  )
}
