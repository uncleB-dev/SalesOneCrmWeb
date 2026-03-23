const BASE = '/api/v1'

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T; success: true } | { error: string; success: false }> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res.json()
}

export const apiClient = {
  customers: {
    list: (params?: Record<string, string>) =>
      request(`/customers${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id: string) => request(`/customers/${id}`),
    create: (data: unknown) =>
      request('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/customers/${id}`, { method: 'DELETE' }),
    updateStage: (id: string, stage: string) =>
      request(`/customers/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    reorder: (items: Array<{ id: string; order_index: number }>) =>
      request('/customers/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  },
  interactions: {
    list: (customerId: string) => request(`/customers/${customerId}/interactions`),
    create: (customerId: string, data: unknown) =>
      request(`/customers/${customerId}/interactions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (customerId: string, id: string) =>
      request(`/customers/${customerId}/interactions/${id}`, { method: 'DELETE' }),
  },
  reminders: {
    list: (customerId: string) => request(`/customers/${customerId}/reminders`),
    listAll: (filter?: string) =>
      request(`/reminders${filter ? '?filter=' + filter : ''}`),
    create: (customerId: string, data: unknown) =>
      request(`/customers/${customerId}/reminders`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (customerId: string, id: string, data: unknown) =>
      request(`/customers/${customerId}/reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (customerId: string, id: string) =>
      request(`/customers/${customerId}/reminders/${id}`, { method: 'DELETE' }),
  },
  pipelineStages: {
    list: (stageType?: string) =>
      request(`/pipeline-stages${stageType ? '?stage_type=' + stageType : ''}`),
    save: (stages: unknown[]) =>
      request('/pipeline-stages', { method: 'POST', body: JSON.stringify({ stages }) }),
    delete: (id: string) => request(`/pipeline-stages/${id}`, { method: 'DELETE' }),
  },
  notifications: {
    list: () => request('/notifications'),
    readAll: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
}
