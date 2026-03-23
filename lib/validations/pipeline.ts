import { z } from 'zod'
import { PIPELINE_MAX, PIPELINE_MIN } from '@/lib/utils/constants'

export const pipelineStageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, '단계명을 입력하세요'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드가 아닙니다'),
  order_index: z.number().int().min(0),
  stage_type: z.enum(['pipeline', 'escape']),
})

export const pipelineStagesSchema = z
  .array(pipelineStageSchema)
  .min(PIPELINE_MIN, `최소 ${PIPELINE_MIN}개 이상이어야 합니다`)
  .max(PIPELINE_MAX, `최대 ${PIPELINE_MAX}개까지 추가할 수 있습니다`)

export type PipelineStageFormData = z.infer<typeof pipelineStageSchema>
