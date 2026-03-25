import { NextRequest, NextResponse } from 'next/server'
import { getApiAuth } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

const PEOPLE_API = 'https://people.googleapis.com/v1'

export interface GoogleContactItem {
  resourceName: string
  name: string
  phones: string[]
  email: string | null
  company: string | null
  jobTitle: string | null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getApiAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 })
  const { supabase, userId } = auth

    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token ?? null
    if (!providerToken) {
      return NextResponse.json({ error: 'REAUTH_REQUIRED', success: false }, { status: 401 })
    }

    const pageToken = request.nextUrl.searchParams.get('pageToken')
    const params = new URLSearchParams({
      personFields: 'names,phoneNumbers,emailAddresses,organizations',
      pageSize: '100',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(`${PEOPLE_API}/people/me/connections?${params.toString()}`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    })

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: 'REAUTH_REQUIRED', success: false }, { status: 401 })
      }
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? `Google API 오류: ${res.status}`)
    }

    const data = await res.json()

    const contacts: GoogleContactItem[] = (data.connections ?? [])
      .map((person: any) => {
        const nameObj = person.names?.[0]
        const name = nameObj?.displayName ??
          [nameObj?.familyName, nameObj?.givenName].filter(Boolean).join(' ') ?? ''
        const phones: string[] = (person.phoneNumbers ?? []).map((p: any) => p.value as string)
        const email = person.emailAddresses?.[0]?.value ?? null
        const org = person.organizations?.[0]
        return {
          resourceName: person.resourceName,
          name,
          phones,
          email,
          company: org?.name ?? null,
          jobTitle: org?.title ?? null,
        } as GoogleContactItem
      })
      .filter((c: GoogleContactItem) => c.name)

    return NextResponse.json({
      success: true,
      data: contacts,
      nextPageToken: data.nextPageToken ?? null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
