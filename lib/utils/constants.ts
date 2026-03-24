export const PIPELINE_DEFAULTS = [
  { name: '리드배정', color: '#94A3B8', order_index: 0 },
  { name: '초기연락', color: '#60A5FA', order_index: 1 },
  { name: '상담중', color: '#C084FC', order_index: 2 },
  { name: '계약완료', color: '#10B981', order_index: 3 },
  { name: '사후관리', color: '#14B8A6', order_index: 4 },
]

export const ESCAPE_DEFAULTS = [
  { name: '연락불가', color: '#EF4444', order_index: 0 },
  { name: '블랙리스트', color: '#374151', order_index: 1 },
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

export const PIPELINE_MIN = 1
export const PIPELINE_MAX = 20
export const ESCAPE_MIN = 1
export const ESCAPE_MAX = 5
