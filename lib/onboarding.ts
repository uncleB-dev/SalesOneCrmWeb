export const JOB_STAGE_DEFAULTS = {
  insurance:  ['리드배정', '초기연락', '니즈파악', '상담중', '계약완료'],
  realestate: ['잠재고객', '매물안내', '현장방문', '협의중', '계약완료'],
  finance:    ['리드', '상담', '제안', '심사중', '승인완료'],
  auto:       ['잠재고객', '시승안내', '견적', '계약', '출고완료'],
  b2b:        ['리드', '미팅', '제안', '협상', '수주완료'],
  other:      ['리드배정', '초기연락', '상담중', '제안완료', '계약완료'],
} as const

export type JobType = keyof typeof JOB_STAGE_DEFAULTS

export const JOB_TYPE_META: Record<JobType, { label: string; icon: string }> = {
  insurance:  { label: '보험 영업', icon: '🛡️' },
  realestate: { label: '부동산',   icon: '🏠' },
  finance:    { label: '금융',     icon: '💰' },
  auto:       { label: '자동차',   icon: '🚗' },
  b2b:        { label: 'B2B 영업', icon: '🤝' },
  other:      { label: '기타',     icon: '💼' },
}

export const STAGE_COLORS = ['#60A5FA', '#A78BFA', '#FBBF24', '#10B981', '#14B8A6']

export const ESCAPE_DEFAULTS = [
  { name: '연락불가', color: '#F87171', order_index: 0 },
  { name: '블랙리스트', color: '#6B7280', order_index: 1 },
]

export function formatKoreanPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export const isValidKoreanPhone = (v: string) => /^010-\d{4}-\d{4}$/.test(v)
