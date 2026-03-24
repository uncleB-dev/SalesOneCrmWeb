'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Phone, Search, ChevronDown, Loader2, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils/format'
import type { CallRecord } from '@/types'

interface Props {
  initialRecords: CallRecord[]
  initialUnmatchedCount: number
}

type FilterType = 'all' | 'matched' | 'unmatched'

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null
  const emoji =
    sentiment.includes('긍정') ? '😊' :
    sentiment.includes('부정') ? '😞' :
    sentiment.includes('중립') ? '😐' : '💬'
  return (
    <span className="text-xs text-[#64748B]">{emoji} {sentiment}</span>
  )
}

// 고객 검색 드롭다운
function CustomerMatchDropdown({
  recordId,
  onMatched,
}: {
  recordId: string
  onMatched: (customerId: string, customerName: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<{ id: string; name: string; phone: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [matching, setMatching] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchCustomers = async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/customers?search=${encodeURIComponent(q)}&limit=10`)
      const result = await res.json()
      if (result.success) setCustomers(result.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchCustomers(search)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => fetchCustomers(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleMatch = async (customer: { id: string; name: string }) => {
    setMatching(true)
    try {
      const res = await fetch(`/api/v1/records/${recordId}/match`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customer.id }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      toast.success(`${customer.name} 고객과 연결되었습니다`)
      onMatched(customer.id, customer.name)
      setOpen(false)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setMatching(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={matching}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#F1F5F9] text-[#64748B] rounded-lg hover:bg-[#E2E8F0] disabled:opacity-50 whitespace-nowrap"
      >
        {matching ? <Loader2 size={12} className="animate-spin" /> : null}
        고객 연결하기 <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50">
          <div className="p-2 border-b border-[#F1F5F9]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="고객 검색..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-[#94A3B8]" />
              </div>
            ) : customers.length === 0 ? (
              <p className="text-xs text-[#94A3B8] text-center py-4">고객이 없습니다</p>
            ) : (
              customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleMatch(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#F8FAFC] transition-colors"
                >
                  <p className="text-sm font-medium text-[#1E293B]">{c.name}</p>
                  <p className="text-xs text-[#94A3B8]">{c.phone}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 기록 카드
function RecordCard({
  record,
  onDelete,
  onMatched,
}: {
  record: CallRecord
  onDelete: (id: string) => void
  onMatched: (id: string, customerId: string, customerName: string) => void
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/records/${record.id}`, { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      onDelete(record.id)
    } catch (e: any) {
      toast.error(e.message)
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2.5">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Phone size={14} className="text-[#94A3B8] flex-shrink-0 mt-0.5" />
          <span className="font-semibold text-[#1E293B] text-sm">
            {record.is_matched && record.customers
              ? record.customers.name
              : `미매칭`}
          </span>
          {record.phone_number && (
            <span className="text-xs text-[#94A3B8]">{record.phone_number}</span>
          )}
          {record.duration !== null && (
            <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
              {formatDuration(record.duration)}
            </span>
          )}
          {!record.is_matched && (
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">미매칭</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {record.occurred_at && (
            <span className="text-xs text-[#94A3B8]">{formatDateTime(record.occurred_at)}</span>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1 text-[#CBD5E1] hover:text-red-400 transition-colors"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      </div>

      {/* 요약 */}
      {record.summary && (
        <p className="text-sm text-[#374151] leading-relaxed line-clamp-2">{record.summary}</p>
      )}

      {/* Action Items */}
      {record.action_items && (
        <div className="bg-[#F0F9FF] rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-[#0284C7] mb-0.5">액션 아이템</p>
          <p className="text-xs text-[#0369A1]">{record.action_items}</p>
        </div>
      )}

      {/* 분위기 + 고객 연결 버튼 */}
      <div className="flex items-center justify-between">
        <SentimentBadge sentiment={record.sentiment} />
        <div className="flex items-center gap-2">
          {record.is_matched && record.customers && (
            <button
              onClick={() => router.push(`/dashboard/customers/${record.customers!.id}`)}
              className="text-xs text-[#38BDF8] hover:text-[#0EA5E9] font-medium"
            >
              고객 보기 →
            </button>
          )}
          {!record.is_matched && (
            <CustomerMatchDropdown
              recordId={record.id}
              onMatched={(customerId, customerName) =>
                onMatched(record.id, customerId, customerName)
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecordsClient({ initialRecords, initialUnmatchedCount }: Props) {
  const [records, setRecords] = useState<CallRecord[]>(initialRecords)
  const [unmatchedCount, setUnmatchedCount] = useState(initialUnmatchedCount)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialRecords.length === 20)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = records
    if (filter === 'matched') list = list.filter(r => r.is_matched)
    if (filter === 'unmatched') list = list.filter(r => !r.is_matched)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        (r.customers?.name ?? '').toLowerCase().includes(q) ||
        (r.phone_number ?? '').includes(q) ||
        (r.summary ?? '').toLowerCase().includes(q) ||
        (r.action_items ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [records, filter, search])

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id))
    const deleted = records.find(r => r.id === id)
    if (deleted && !deleted.is_matched) setUnmatchedCount(c => Math.max(0, c - 1))
  }

  const handleMatched = (id: string, customerId: string, customerName: string) => {
    setRecords(prev => prev.map(r =>
      r.id === id
        ? { ...r, is_matched: true, customer_id: customerId, customers: { id: customerId, name: customerName, stage: '' } }
        : r
    ))
    setUnmatchedCount(c => Math.max(0, c - 1))
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const filterParam = filter !== 'all' ? `&is_matched=${filter === 'matched'}` : ''
      const res = await fetch(`/api/v1/records?page=${nextPage}&limit=20${filterParam}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setRecords(prev => [...prev, ...result.data])
      setPage(nextPage)
      setHasMore(result.data.length === 20)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#0F172A]/5 flex items-center justify-center">
          <FileText size={18} className="text-[#0F172A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">기록</h1>
          <p className="text-xs text-[#94A3B8]">통화 AI 요약이 자동으로 쌓입니다</p>
        </div>
        {unmatchedCount > 0 && (
          <span className="ml-auto px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            미매칭 {unmatchedCount}건
          </span>
        )}
      </div>

      {/* 필터 + 검색 */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl">
          {(['all', 'matched', 'unmatched'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                filter === f
                  ? 'bg-white text-[#1E293B] shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              )}
            >
              {f === 'all' ? '전체' : f === 'matched' ? '매칭됨' : '미매칭'}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="고객명, 전화번호, 내용 검색..."
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 기록 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
            <FileText size={28} className="text-[#CBD5E1]" />
          </div>
          <p className="text-[#64748B] font-medium">기록이 없습니다</p>
          <p className="text-sm text-[#94A3B8] mt-1">
            {search || filter !== 'all'
              ? '검색 조건에 맞는 기록이 없습니다'
              : 'SalesONE 앱에서 통화하면 AI 요약이 자동으로 기록됩니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(record => (
            <RecordCard
              key={record.id}
              record={record}
              onDelete={handleDelete}
              onMatched={handleMatched}
            />
          ))}

          {hasMore && !search && filter === 'all' && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                더 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
