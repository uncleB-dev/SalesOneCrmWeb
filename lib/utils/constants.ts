export const PIPELINE_DEFAULTS = [
  { name: '리드배정', color: '#94A3B8', order_index: 0 },
  { name: '초기연락', color: '#60A5FA', order_index: 1 },
  { name: '니즈파악', color: '#A78BFA', order_index: 2 },
  { name: '상담중', color: '#C084FC', order_index: 3 },
  { name: '제안완료', color: '#FBBF24', order_index: 4 },
  { name: '협상중', color: '#F97316', order_index: 5 },
  { name: '계약완료', color: '#10B981', order_index: 6 },
  { name: '사후관리', color: '#14B8A6', order_index: 7 },
  { name: '추가영업', color: '#6366F1', order_index: 8 },
  { name: '재터치', color: '#64748B', order_index: 9 },
]

export const ESCAPE_DEFAULTS = [
  { name: '연락불가', color: '#EF4444', order_index: 0 },
  { name: '고민중', color: '#F59E0B', order_index: 1 },
  { name: '연락두절', color: '#9CA3AF', order_index: 2 },
  { name: '거절', color: '#EC4899', order_index: 3 },
  { name: '블랙리스트', color: '#374151', order_index: 4 },
]

export const COLOR_PALETTE = [
  '#94A3B8', '#60A5FA', '#A78BFA', '#C084FC',
  '#FBBF24', '#F97316', '#10B981', '#14B8A6',
  '#6366F1', '#EF4444',
]

export const INTERACTION_TYPES = ['전화', '문자', '이메일', '방문', '화상', '기타'] as const

export const INTERACTION_ICONS: Record<string, string> = {
  전화: '📞',
  문자: '💬',
  이메일: '📧',
  방문: '🏢',
  화상: '💻',
  기타: '📝',
}

export const CUSTOMER_SOURCES = [
  '지인소개',
  'SNS',
  '블로그',
  '콜드콜',
  '기존고객',
  '전시회',
  '기타',
] as const

export const PIPELINE_MIN = 5
export const PIPELINE_MAX = 12
export const ESCAPE_MIN = 1
