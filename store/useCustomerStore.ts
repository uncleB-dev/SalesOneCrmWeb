import { create } from 'zustand'
import type { Customer } from '@/types'

interface CustomerStore {
  customers: Customer[]
  selectedIds: Set<string>
  setCustomers: (customers: Customer[]) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  selectedIds: new Set(),
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) =>
    set((state) => ({ customers: [customer, ...state.customers] })),
  updateCustomer: (id, data) =>
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  removeCustomer: (id) =>
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),
  clearSelection: () => set({ selectedIds: new Set() }),
}))
