import type { Customer } from '@/types'

const PEOPLE_API = 'https://people.googleapis.com/v1'

export async function createGoogleContact(accessToken: string, customer: Customer): Promise<string> {
  const body: any = {
    names: [{ givenName: customer.name }],
    phoneNumbers: [{ value: customer.phone }],
  }
  if (customer.email) body.emailAddresses = [{ value: customer.email }]
  if (customer.address) body.addresses = [{ formattedValue: customer.address }]
  if (customer.company) body.organizations = [{ name: customer.company, title: customer.job_title ?? undefined }]

  const res = await fetch(`${PEOPLE_API}/people:createContact`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Contacts 생성 실패: ${err?.error?.message ?? res.statusText}`)
  }

  const data = await res.json()
  // resourceName: "people/c1234567890"
  return data.resourceName as string
}

export async function updateGoogleContact(accessToken: string, contactId: string, customer: Customer): Promise<void> {
  // contactId is the full resourceName e.g. "people/c1234567890"
  const updateFields = ['names', 'phoneNumbers']
  if (customer.email) updateFields.push('emailAddresses')
  if (customer.address) updateFields.push('addresses')
  if (customer.company) updateFields.push('organizations')

  const body: any = {
    names: [{ givenName: customer.name }],
    phoneNumbers: [{ value: customer.phone }],
  }
  if (customer.email) body.emailAddresses = [{ value: customer.email }]
  if (customer.address) body.addresses = [{ formattedValue: customer.address }]
  if (customer.company) body.organizations = [{ name: customer.company, title: customer.job_title ?? undefined }]

  const url = `${PEOPLE_API}/${contactId}:updateContact?updatePersonFields=${updateFields.join(',')}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Contacts 수정 실패: ${err?.error?.message ?? res.statusText}`)
  }
}

export async function deleteGoogleContact(accessToken: string, contactId: string): Promise<void> {
  const res = await fetch(`${PEOPLE_API}/${contactId}:deleteContact`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Contacts 삭제 실패: ${err?.error?.message ?? res.statusText}`)
  }
}

export function getGoogleContactUrl(contactId: string): string {
  // contactId: "people/c1234567890" → strip "people/" prefix
  const id = contactId.startsWith('people/') ? contactId.slice('people/'.length) : contactId
  return `https://contacts.google.com/person/${id}`
}
