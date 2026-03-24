'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { normalizeKoreanPhone } from '@/lib/utils/phone'
import type { GoogleContactItem } from '@/app/api/v1/google/contacts/route'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

function selectBestPhone(phones: string[]): string | null {
  for (const p of phones) {
    if (normalizeKoreanPhone(p)) return p
  }
  return phones[0] ?? null
}

type LoadState = 'loading' | 'reauth-required' | 'loaded' | 'error'

export default function GoogleContactsImportModal({ onClose, onSuccess }: Props) {
  const router = useRouter()
  const [contacts, setContacts] = useState<GoogleContactItem[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search) return contacts
    const q = search.toLowerCase()
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phones.some(p => p.includes(q)) ||
      (c.email ?? '').toLowerCase().includes(q)
    )
  }, [contacts, search])

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.has(c.resourceName))
  const someSelected = filtered.some(c => selected.has(c.resourceName))
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allFilteredSelected
    }
  }, [someSelected, allFilteredSelected])

  const loadContacts = async (pageToken?: string) => {
    const url = pageToken
      ? `/api/v1/google/contacts?pageToken=${encodeURIComponent(pageToken)}`
      : '/api/v1/google/contacts'
    const res = await fetch(url)
    const result = await res.json()

    if (!result.success) {
      if (result.error === 'REAUTH_REQUIRED') {
        setLoadState('reauth-required')
        return
      }
      throw new Error(result.error)
    }
    setContacts(prev => pageToken ? [...prev, ...result.data] : result.data)
    setNextPageToken(result.nextPageToken ?? null)
    setLoadState('loaded')
  }

  useEffect(() => {
    loadContacts().catch(e => {
      setErrorMsg(e.message)
      setLoadState('error')
    })
  }, [])

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      await loadContacts(nextPageToken)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const toggleContact = (resourceName: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(resourceName)) next.delete(resourceName)
      else next.add(resourceName)
      return next
    })
  }

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(c => next.delete(c.resourceName))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(c => next.add(c.resourceName))
        return next
      })
    }
  }

  const handleImport = async () => {
    if (selected.size === 0) return
    setIsImporting(true)
    try {
      const selectedContacts = contacts
        .filter(c => selected.has(c.resourceName))
        .map(c => ({
          google_contact_id: c.resourceName,
          name: c.name,
          phone: selectBestPhone(c.phones) ?? '',
          email: c.email,
          company: c.company,
          job_title: c.jobTitle,
        }))

      const res = await fetch('/api/v1/customers/bulk-import-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: selectedContacts }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      const msg = `${result.imported}명 등록 완료${result.skipped > 0 ? ` (${result.skipped}건 건너뜀)` : ''}`
      toast.success(msg)
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">구글 주소록에서 가져오기</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">연락처를 선택해 CRM에 등록합니다</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#94A3B8] hover:text-[#1E293B] rounded-lg hover:bg-[#F1F5F9]">
            <X size={18} />
          </button>
        </div>

        {/* 본문 */}
        {loadState === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="animate-spin text-[#38BDF8]" />
            <p className="text-sm text-[#94A3B8]">주소록 불러오는 중...</p>
          </div>
        )}

        {loadState === 'reauth-required' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle size={24} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E293B]">구글 토큰이 만료되었습니다</p>
              <p className="text-xs text-[#94A3B8] mt-1">로그아웃 후 구글 계정으로 다시 로그인해주세요.</p>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="px-5 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium"
            >
              재로그인
            </button>
          </div>
        )}

        {loadState === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-[#64748B]">{errorMsg || '주소록 로딩에 실패했습니다'}</p>
          </div>
        )}

        {loadState === 'loaded' && (
          <>
            {/* 검색 */}
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="이름, 전화번호, 이메일 검색..."
                  className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/30"
                />
              </div>
            </div>

            {/* 전체 선택 */}
            <div className="px-6 py-2 border-b border-[#E2E8F0]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[#D1D5DB] accent-[#38BDF8]"
                />
                <span className="text-sm text-[#64748B]">전체 선택 ({filtered.length}명)</span>
              </label>
            </div>

            {/* 연락처 목록 */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#94A3B8]">
                  {contacts.length === 0 ? '주소록이 비어있습니다' : '검색 결과가 없습니다'}
                </div>
              ) : (
                <>
                  {filtered.map((contact) => {
                    const bestPhone = selectBestPhone(contact.phones)
                    const normalizedPhone = normalizeKoreanPhone(bestPhone ?? '')
                    const isSelected = selected.has(contact.resourceName)
                    return (
                      <label
                        key={contact.resourceName}
                        className={cn(
                          'flex items-center gap-3 px-6 py-3 border-b border-[#F1F5F9] cursor-pointer hover:bg-[#F8FAFC] transition-colors',
                          isSelected && 'bg-[#F0F9FF]'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleContact(contact.resourceName)}
                          className="w-4 h-4 flex-shrink-0 rounded border-[#D1D5DB] accent-[#38BDF8]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#1E293B]">{contact.name}</span>
                            {!normalizedPhone && bestPhone && (
                              <span className="text-xs text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">번호 변환불가</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-[#64748B]">{normalizedPhone ?? bestPhone ?? '전화번호 없음'}</span>
                            {contact.email && (
                              <span className="text-xs text-[#94A3B8] truncate">{contact.email}</span>
                            )}
                            {contact.company && (
                              <span className="text-xs text-[#94A3B8]">{contact.company}</span>
                            )}
                          </div>
                        </div>
                      </label>
                    )
                  })}

                  {/* 더 불러오기 */}
                  {nextPageToken && !search && (
                    <div className="flex justify-center py-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] disabled:opacity-50"
                      >
                        {isLoadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                        더 불러오기
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <p className="text-sm text-[#64748B]">
                <span className="font-semibold text-[#1E293B]">{selected.size}</span>명 선택됨
              </p>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748B] hover:text-[#1E293B]">
                  취소
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting || selected.size === 0}
                  className="px-5 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#1e293b]"
                >
                  {isImporting ? '등록 중...' : 'CRM에 등록하기'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
