import { create } from 'zustand'
import type { KanbanColumn } from '@/types'

interface PipelineStore {
  pipelineColumns: KanbanColumn[]
  escapeColumns: KanbanColumn[]
  setColumns: (pipeline: KanbanColumn[], escape: KanbanColumn[]) => void
  updateCustomerStage: (customerId: string, fromStageId: string, toStageId: string, toIndex: number) => void
  revertColumns: (pipeline: KanbanColumn[], escape: KanbanColumn[]) => void
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  pipelineColumns: [],
  escapeColumns: [],
  setColumns: (pipelineColumns, escapeColumns) => set({ pipelineColumns, escapeColumns }),
  updateCustomerStage: (customerId, fromStageId, toStageId, toIndex) =>
    set((state) => {
      const allCols = [...state.pipelineColumns, ...state.escapeColumns]
      const fromCol = allCols.find((c) => c.id === fromStageId)
      const toCol = allCols.find((c) => c.id === toStageId)
      if (!fromCol || !toCol) return state

      const customer = fromCol.customers.find((c) => c.id === customerId)
      if (!customer) return state

      const newFromCustomers = fromCol.customers.filter((c) => c.id !== customerId)
      const newToCustomers = [...toCol.customers]
      newToCustomers.splice(toIndex, 0, { ...customer, stage: toCol.name })

      const update = (cols: KanbanColumn[]) =>
        cols.map((col) => {
          if (col.id === fromStageId) return { ...col, customers: newFromCustomers }
          if (col.id === toStageId) return { ...col, customers: newToCustomers }
          return col
        })

      return {
        pipelineColumns: update(state.pipelineColumns),
        escapeColumns: update(state.escapeColumns),
      }
    }),
  revertColumns: (pipelineColumns, escapeColumns) => set({ pipelineColumns, escapeColumns }),
}))
