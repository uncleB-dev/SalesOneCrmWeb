export interface PipelineStage {
  id: string
  user_id: string
  name: string
  color: string
  order_index: number
  stage_type: 'pipeline' | 'escape'
  is_default: boolean
  created_at: string
}

export interface KanbanColumn {
  id: string
  name: string
  color: string
  customers: import('./customer').Customer[]
}

export interface KanbanData {
  pipelineColumns: KanbanColumn[]
  escapeColumns: KanbanColumn[]
}
