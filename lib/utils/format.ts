import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'yyyy.MM.dd', { locale: ko })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'yyyy.MM.dd HH:mm', { locale: ko })
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return formatDistanceToNow(d, { addSuffix: true, locale: ko })
}

export function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null
  const d = parseISO(birthDate)
  if (!isValid(d)) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}
