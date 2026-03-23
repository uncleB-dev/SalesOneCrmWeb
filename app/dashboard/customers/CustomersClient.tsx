'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, ChevronUp, ChevronDown, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { formatRelative, formatDate } from '@/lib/utils/format'
import StageBadge from '@/components/customers/StageBadge'
import CustomerForm from '@/components/customers/CustomerForm'
import type { Customer, PipelineStage } from '@/types'

interface Props {
  initialCustomers: Customer[]
  stages: PipelineStage[]
}

type SortField = 'name' | 'stage' | 'created_at' | 'updated_at'

export default function CustomersClient({ initialCustomers, stages }: Props) {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('전체')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const pipelineStages = stages.filter(s => s.stage_type === 'pipeline')
  const allStages = stages

  const stageColorMap = useMemo(() =>
    Object.fromEntries(stages.map(s => [s.name, s.color])),
    [stages]
  )

  const filtered = useMemo(() => {
    let list = [...customers]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q)
      )
    }
    if (stageFilter !== '전체') {
      list = list.filter(c => c.stage === stageFilter)
    }
    list.sort((a, b) => {
      const av = a[sortField as keyof Customer] as string ?? ''
      const bv = b[sortField as keyof Customer] as string ?? ''
      return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return list
  }, [customers, search, stageFilter, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={14} className="opacity-20" />
    return sortOrder === 'asc'
      ? <ChevronUp size={14} className="text-[#38BDF8]" />
      : <ChevronDown size={14} className="text-[#38BDF8]" />
  }

  const handleFormSuccess = useCallback((customer: Customer) => {
    setCustomers(prev => {
      const exists = prev.find(c => c.id === customer.id)
      if (exists) return prev.map(c => c.id === customer.id ? customer : c)
      return [customer, ...prev]
    })
    setIsFormOpen(false)
    setEditingCustomer(null)
  }, [])

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  return (
    <div className="p-4 md:p-6">
      {/* 툴바 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 또는 전화번호 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30 focus:border-[#38BDF8]"
          />
        </div>

        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none min-w-[120px]"
        >
          <option value="전체">전체 단계</option>
          {stages.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <button
          onClick={() => { setEditingCustomer(null); setIsFormOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] whitespace-nowrap"
        >
          <Plus size={16} />
          고객 추가
        </button>
      </div>

      <p className="text-sm text-[#64748B] mb-3">
        총 <span className="font-semibold text-[#1E293B]">{filtered.length}</span>명
      </p>

      {/* PC 테이블 */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#94A3B8]">
                  고객이 없습니다. 첫 고객을 추가해보세요.
                </td>
              </tr>
            ) : (
              filtered.map(customer => (
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
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#94A3B8]">
            고객이 없습니다. 첫 고객을 추가해보세요.
          </div>
        ) : (
          filtered.map(customer => (
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

      {/* CustomerForm 슬라이드 패널 */}
      {isFormOpen && (
        <CustomerForm
          customer={editingCustomer}
          stages={stages}
          onClose={() => { setIsFormOpen(false); setEditingCustomer(null) }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
