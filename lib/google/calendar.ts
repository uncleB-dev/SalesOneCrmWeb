import type { Reminder } from '@/types'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

function buildEventTimes(dueDate: string, startTime?: string | null) {
  if (startTime) {
    const startISO = `${dueDate}T${startTime}:00`
    const endDate = new Date(startISO)
    endDate.setMinutes(endDate.getMinutes() + 30)
    return {
      start: { dateTime: startISO, timeZone: 'Asia/Seoul' },
      end: { dateTime: endDate.toISOString(), timeZone: 'Asia/Seoul' },
    }
  }
  return {
    start: { date: dueDate },
    end: { date: dueDate },
  }
}

export async function createCalendarEvent(
  accessToken: string,
  reminder: Reminder,
  customerName: string
): Promise<string> {
  const body = {
    summary: `📅 [${customerName}] 일정`,
    description: reminder.memo ?? '',
    ...buildEventTimes(reminder.due_date, reminder.start_time),
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 9 * 60 }],
    },
  }

  const res = await fetch(CALENDAR_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Calendar 이벤트 생성 실패: ${err?.error?.message ?? res.statusText}`)
  }

  const data = await res.json()
  return data.id as string
}

export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  reminder: Partial<Pick<Reminder, 'due_date' | 'memo' | 'start_time'>>,
  customerName?: string
): Promise<void> {
  const body: any = {}
  if (reminder.due_date !== undefined) {
    Object.assign(body, buildEventTimes(reminder.due_date, reminder.start_time))
  } else if (reminder.start_time !== undefined) {
    // start_time만 변경된 경우 — due_date 없이 처리 불가, 무시
  }
  if (reminder.memo !== undefined) {
    body.description = reminder.memo ?? ''
  }
  if (customerName) {
    body.summary = `📅 [${customerName}] 일정`
  }

  const res = await fetch(`${CALENDAR_API}/${eventId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Calendar 이벤트 수정 실패: ${err?.error?.message ?? res.statusText}`)
  }
}

export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const res = await fetch(`${CALENDAR_API}/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Calendar 이벤트 삭제 실패: ${err?.error?.message ?? res.statusText}`)
  }
}

export function getGoogleCalendarEventUrl(eventId: string): string {
  return `https://calendar.google.com/calendar/event?eid=${eventId}`
}
