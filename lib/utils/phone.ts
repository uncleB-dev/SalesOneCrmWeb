/**
 * 다양한 한국 전화번호 형식을 010-XXXX-XXXX 로 정규화.
 * "+82 10-1234-5678" / "+8210-1234-5678" / "01012345678" 모두 처리.
 * 실패 시 null 반환.
 */
export function normalizeKoreanPhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let s = raw.replace(/\s/g, '')
  s = s.replace(/^\+82/, '0').replace(/^0082/, '0')
  const digits = s.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }
  return null
}
