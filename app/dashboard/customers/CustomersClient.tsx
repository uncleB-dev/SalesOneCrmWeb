'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ChevronUp, ChevronDown, Phone, Upload, BookUser, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import StageBadge from '@/components/customers/StageBadge'
import CustomerForm from '@/components/customers/CustomerForm'
import CsvImportModal from '@/components/customers/CsvImportModal'
import GoogleContactsImportModal from '@/components/customers/GoogleContactsImportModal'
import type { Customer, PipelineStage } from '@/types'

const LIMIT = 50

interface Props {
  initialCustomers: Customer[]
  initialTotal: number
  initialStageCounts: Record<string, number>
  stages: PipelineStage[]
}

type SortField = 'name' | 'stage' | 'created_at' | 'updated_at'

export default function CustomersClient({ initialCustomers, initialTotal, initialStageCounts, stages }: Props) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [total, setTotal] = useState(initialTotal)
  const [stageCounts, setStageCounts] = useState(initialStageCounts)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('전체')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [isGoogleContactsModalOpen, setIsGoogleContactsModalOpen] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pipelineStages = stages.filter(s => s.stage_type === 'pipeline')
  const escapeStages = stages.filter(s => s.stage_type === 'escape')

  const stageColorMap = useMemo(() =>
    Object.fromEntries(stages.map(s => [s.name, s.color])),
    [stages]
  )

  const totalPages = Math.ceil(total / LIMIT)

  const doFetch = useCallback(async (
    pg: number,
    srch: string,
    stg: string,
    sf: SortField,
    so: 'asc' | 'desc',
  ) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pg),
        limit: String(LIMIT),
        sort_field: sf,
        sort_order: so,
      })
      if (srch) params.set('search', srch)
      if (stg !== '전체') params.set('stage', stg)

      const res = await fetch(`/api/v1/customers?${params}`)
      const result = await res.json()
      if (result.success) {
        setCustomers(result.data)
        setTotal(result.total)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshStageCounts = useCallback(async () => {
    const res = await fetch('/api/v1/customers/stage-counts')
    const result = await res.json()
    if (result.success) setStageCounts(result.data)
  }, [])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      doFetch(1, value, stageFilter, sortField, sortOrder)
    }, 300)
  }

  const handleStageFilter = (stage: string) => {
    setStageFilter(stage)
    setPage(1)
    doFetch(1, search, stage, sortField, sortOrder)
  }

  const handleSort = (field: SortField) => {
    const newOrder: 'asc' | 'desc' = sortField === field
      ? (sortOrder === 'asc' ? 'desc' : 'asc')
      : 'asc'
    setSortField(field)
    setSortOrder(newOrder)
    setPage(1)
    doFetch(1, search, stageFilter, field, newOrder)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    doFetch(newPage, search, stageFilter, sortField, sortOrder)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormSuccess = useCallback((customer: Customer) => {
    setIsFormOpen(false)
    setEditingCustomer(null)
    setPage(1)
    doFetch(1, search, stageFilter, sortField, sortOrder)
    refreshStageCounts()
  }, [search, stageFilter, sortField, sortOrder, doFetch, refreshStageCounts])

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleBulkImportSuccess = useCallback(() => {
    setPage(1)
    doFetch(1, search, stageFilter, sortField, sortOrder)
    refreshStageCounts()
  }, [search, stageFilter, sortField, sortOrder, doFetch, refreshStageCounts])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={14} className="opacity-20" />
    return sortOrder === 'asc'
      ? <ChevronUp size={14} className="text-[#38BDF8]" />
      : <ChevronDown size={14} className="text-[#38BDF8]" />
  }

  return (
    <div className="p-4 md:p-6">
      {/* 툴바 */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="이름 또는 전화번호 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] bg-white text-[#374151] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] whitespace-nowrap flex-shrink-0 min-h-[44px]"
          >
            <Upload size={15} />
            CSV 가져오기
          </button>

          <button
            onClick={() => setIsGoogleContactsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] bg-white text-[#374151] rounded-lg text-sm font-medium hover:bg-[#F8FAFC] whitespace-nowrap flex-shrink-0 min-h-[44px]"
          >
            <BookUser size={15} />
            주소록 가져오기
          </button>

          <button
            onClick={() => { setEditingCustomer(null); setIsFormOpen(true) }}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] whitespace-nowrap flex-shrink-0"
          >
            <Plus size={16} />
            고객 추가
          </button>
        </div>
      </div>

      {/* 단계 필터 버튼 */}
      <div className="flex overflow-x-auto gap-1.5 mb-4 pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => handleStageFilter('전체')}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors border flex-shrink-0 min-h-[32px]"
          style={stageFilter === '전체'
            ? { backgroundColor: '#38BDF8', color: '#fff', borderColor: '#38BDF8' }
            : { backgroundColor: '#fff', color: '#64748B', borderColor: '#E2E8F0' }
          }
        >
          전체 {initialTotal}
        </button>
        {pipelineStages.map(s => (
          <button
            key={s.id}
            onClick={() => handleStageFilter(s.name)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors border flex-shrink-0 whitespace-nowrap min-h-[32px]"
            style={stageFilter === s.name
              ? { backgroundColor: s.color, color: '#fff', borderColor: s.color }
              : { backgroundColor: '#fff', color: '#64748B', borderColor: '#E2E8F0' }
            }
          >
            {s.name} {stageCounts[s.name] ?? 0}
          </button>
        ))}
        {escapeStages.length > 0 && (
          <>
            <span className="text-[#E2E8F0] self-center flex-shrink-0">|</span>
            {escapeStages.map(s => (
              <button
                key={s.id}
                onClick={() => handleStageFilter(s.name)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors border flex-shrink-0 whitespace-nowrap min-h-[32px]"
                style={stageFilter === s.name
                  ? { backgroundColor: s.color, color: '#fff', borderColor: s.color }
                  : { backgroundColor: '#fff', color: '#64748B', borderColor: '#E2E8F0' }
                }
              >
                {s.name} {stageCounts[s.name] ?? 0}
              </button>
            ))}
          </>
        )}
      </div>

      <p className="text-sm text-[#64748B] mb-3">
        총 <span className="font-semibold text-[#1E293B]">{total}</span>명
        {totalPages > 1 && (
          <span className="ml-2 text-[#94A3B8]">({page} / {totalPages} 페이지)</span>
        )}
      </p>

      {/* PC 테이블 */}
      <div className={`hidden md:block bg-white rounded-xl border border-[#E2E8F0] overflow-hidden transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {[
                { label: '이름', field: 'name' as SortField },
                { label: '전화번호', field: null },
                { label: '회사', field: null },
                { label: '단계', field: 'stage' as SortField },
                { label: '등록일', field: 'created_at' as SortField },
                { label: '메모', field: null },
              ].map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && handleSort(field)}
                  className={`px-4 py-3 text-left text-xs font-medium text-[#64748B] ${field ? 'cursor-pointer hover:text-[#1E293B] select-none' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#94A3B8]">
                  {isLoading ? '불러오는 중...' : '고객이 없습니다. 첫 고객을 추가해보세요.'}
                </td>
              </tr>
            ) : (
              customers.map(customer => (
                <tr
                  key={customer.id}
                  onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#1E293B] text-sm">{customer.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">
                    <a href={`tel:${customer.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-[#38BDF8]">
                      <Phone size={13} />
                      {customer.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748B]">{customer.company ?? '-'}</td>
                  <td className="px-4 py-3">
                    <StageBadge name={customer.stage} color={stageColorMap[customer.stage] ?? '#94A3B8'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8]">{formatDate(customer.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8] max-w-[200px] truncate">
                    {customer.memo ?? '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 */}
      <div className={`md:hidden space-y-3 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        {customers.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#94A3B8]">
            {isLoading ? '불러오는 중...' : '고객이 없습니다. 첫 고객을 추가해보세요.'}
          </div>
        ) : (
          customers.map(customer => (
            <div
              key={customer.id}
              onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-semibold text-[#1E293B]">{customer.name}</span>
                <StageBadge name={customer.stage} color={stageColorMap[customer.stage] ?? '#94A3B8'} size="sm" />
              </div>
              <p className="text-sm text-[#64748B]">{customer.phone}{customer.company ? ` | ${customer.company}` : ''}</p>
              <p className="text-xs text-[#94A3B8] mt-1">등록: {formatDate(customer.created_at)}</p>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      )}

      {/* CustomerForm 슬라이드 패널 */}
      {isFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          stages={stages}
          onClose={() => { setIsFormOpen(false); setEditingCustomer(null) }}
          onSuccess={handleFormSuccess}
        />
      )}

      {isCsvModalOpen && (
        <CsvImportModal
          onClose={() => setIsCsvModalOpen(false)}
          onSuccess={handleBulkImportSuccess}
        />
      )}

      {isGoogleContactsModalOpen && (
        <GoogleContactsImportModal
          onClose={() => setIsGoogleContactsModalOpen(false)}
          onSuccess={handleBulkImportSuccess}
        />
      )}

      {/* FAB: 모바일 전용 고객 추가 버튼 */}
      <button
        onClick={() => { setEditingCustomer(null); setIsFormOpen(true) }}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[#38BDF8] text-white shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

// ─── 페이지네이션 컴포넌트 ─────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = getPageNumbers(page, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#94A3B8]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-[#0F172A] text-white'
                : 'border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}
