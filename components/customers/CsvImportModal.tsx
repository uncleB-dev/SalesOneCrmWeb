'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { X, Upload, Download, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { normalizeKoreanPhone } from '@/lib/utils/phone'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const CSV_TEMPLATE_HEADERS =
  'Name,Given Name,Family Name,Phone 1 - Value,E-mail 1 - Value,Organization 1 - Name,Organization 1 - Title,Address 1 - Formatted,Notes'

interface ParsedRow {
  name: string
  rawPhone: string
  normalizedPhone: string | null
  email: string
  company: string
  status: 'ok' | 'skip'
  skipReason?: string
  // internal
  job_title: string
  address: string
  memo: string
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE_HEADERS + '\n홍길동,길동,홍,010-1234-5678,hong@example.com,ABC회사,영업팀장,서울시 강남구,메모 예시\n'], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'google_contacts_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedRow[] = (results.data as any[]).map((raw) => {
          // Name resolution
          const name = (
            raw['Name'] ||
            `${raw['Family Name'] ?? ''} ${raw['Given Name'] ?? ''}`.trim()
          ).trim()

          const rawPhone = (raw['Phone 1 - Value'] ?? '').trim()
          const normalizedPhone = normalizeKoreanPhone(rawPhone)
          const email = (raw['E-mail 1 - Value'] ?? '').trim()
          const company = (raw['Organization 1 - Name'] ?? '').trim()
          const job_title = (raw['Organization 1 - Title'] ?? '').trim()
          const address = (raw['Address 1 - Formatted'] ?? '').trim()
          const memo = (raw['Notes'] ?? '').trim()

          if (!name) {
            return { name: '(이름 없음)', rawPhone, normalizedPhone: null, email, company, job_title, address, memo, status: 'skip' as const, skipReason: '이름 없음' }
          }
          if (!rawPhone) {
            return { name, rawPhone: '-', normalizedPhone: null, email, company, job_title, address, memo, status: 'skip' as const, skipReason: '전화번호 없음' }
          }
          if (!normalizedPhone) {
            return { name, rawPhone, normalizedPhone: null, email, company, job_title, address, memo, status: 'skip' as const, skipReason: '전화번호 변환 불가' }
          }
          return { name, rawPhone, normalizedPhone, email, company, job_title, address, memo, status: 'ok' as const }
        })
        resolve(rows)
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}

export default function CsvImportModal({ onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const okRows = rows?.filter(r => r.status === 'ok') ?? []
  const skipRows = rows?.filter(r => r.status === 'skip') ?? []

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('CSV 파일만 업로드 가능합니다')
      return
    }
    try {
      const parsed = await parseFile(file)
      setRows(parsed)
    } catch (e: any) {
      toast.error(`파일 파싱 실패: ${e.message}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (okRows.length === 0) return
    setIsImporting(true)
    try {
      const body = okRows.map(r => ({
        name: r.name,
        phone: r.rawPhone,
        email: r.email || null,
        company: r.company || null,
        job_title: r.job_title || null,
        address: r.address || null,
        memo: r.memo || null,
      }))
      const res = await fetch('/api/v1/customers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: body }),
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
            <h2 className="text-base font-bold text-[#1E293B]">CSV 파일로 고객 대량 등록</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">구글 주소록 내보내기 CSV 형식 지원</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#94A3B8] hover:text-[#1E293B] rounded-lg hover:bg-[#F1F5F9]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {rows === null ? (
            <>
              {/* 형식 안내 */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-xs text-[#64748B] space-y-1.5">
                <p className="font-semibold text-[#1E293B] text-sm mb-2">지원 컬럼 (구글 주소록 형식)</p>
                <div className="grid grid-cols-2 gap-1">
                  {['Name (이름)', 'Phone 1 - Value (전화번호)', 'E-mail 1 - Value (이메일)', 'Organization 1 - Name (회사)', 'Organization 1 - Title (직책)', 'Address 1 - Formatted (주소)', 'Notes (메모)'].map(col => (
                    <span key={col} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] flex-shrink-0" />
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* 템플릿 다운로드 */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-[#38BDF8] hover:text-[#0EA5E9] font-medium"
              >
                <Download size={15} /> CSV 템플릿 다운로드
              </button>

              {/* 드래그앤드롭 */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl py-12 flex flex-col items-center gap-3 cursor-pointer transition-colors',
                  isDragging
                    ? 'border-[#38BDF8] bg-[#F0F9FF]'
                    : 'border-[#E2E8F0] hover:border-[#38BDF8] hover:bg-[#F8FAFC]'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                  <Upload size={22} className="text-[#94A3B8]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#1E293B]">파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-xs text-[#94A3B8] mt-1">CSV 파일만 지원 (.csv)</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </>
          ) : (
            <>
              {/* 통계 */}
              <div className="flex gap-3">
                <div className="flex-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#16A34A]">{okRows.length}</p>
                  <p className="text-xs text-[#16A34A] mt-0.5">등록 예정</p>
                </div>
                {skipRows.length > 0 && (
                  <div className="flex-1 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[#EA580C]">{skipRows.length}</p>
                    <p className="text-xs text-[#EA580C] mt-0.5">건너뜀</p>
                  </div>
                )}
              </div>

              {/* 미리보기 테이블 */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] sticky top-0">
                      <tr className="text-xs text-[#64748B]">
                        <th className="px-3 py-2 text-left font-medium">이름</th>
                        <th className="px-3 py-2 text-left font-medium">전화번호</th>
                        <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">이메일</th>
                        <th className="px-3 py-2 text-left font-medium">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className={cn('border-t border-[#F1F5F9]', row.status === 'skip' && 'opacity-50')}>
                          <td className="px-3 py-2 text-[#1E293B]">{row.name}</td>
                          <td className="px-3 py-2 text-[#64748B]">{row.normalizedPhone ?? row.rawPhone}</td>
                          <td className="px-3 py-2 text-[#94A3B8] hidden sm:table-cell truncate max-w-[120px]">{row.email || '-'}</td>
                          <td className="px-3 py-2">
                            {row.status === 'ok' ? (
                              <span className="flex items-center gap-1 text-[#16A34A]">
                                <CheckCircle2 size={13} /> 정상
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[#EA580C]" title={row.skipReason}>
                                <XCircle size={13} /> 건너뜀
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => { setRows(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="text-sm text-[#64748B] hover:text-[#1E293B]"
              >
                ← 다시 선택
              </button>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#64748B] hover:text-[#1E293B]">
            취소
          </button>
          {rows !== null && (
            <button
              onClick={handleImport}
              disabled={isImporting || okRows.length === 0}
              className="px-5 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#1e293b]"
            >
              {isImporting ? '등록 중...' : `${okRows.length}명 등록하기`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
