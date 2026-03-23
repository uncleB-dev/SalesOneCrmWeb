import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력하세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional().or(z.literal('')),
  birth_year: z.number().min(1900).max(2010).optional().nullable(),
  birth_month: z.number().min(1).max(12).optional().nullable(),
  birth_day: z.number().min(1).max(31).optional().nullable(),
  gender: z.enum(['남', '여']).optional().nullable(),
  stage: z.string().min(1, '단계를 선택하세요'),
  source: z
    .enum(['지인소개', 'SNS', '블로그', '콜드콜', '기존고객', '전시회', '기타'])
    .optional()
    .nullable(),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
})

export type CustomerFormData = z.infer<typeof customerSchema>

export const interactionSchema = z.object({
  type: z.enum(['전화', '문자', '이메일', '방문', '화상', '기타']),
  content: z.string().optional().nullable(),
  duration: z.number().min(0).optional().nullable(),
  occurred_at: z.string().optional(),
})

export type InteractionFormData = z.infer<typeof interactionSchema>

export const reminderSchema = z.object({
  due_date: z.string().min(1, '날짜를 선택하세요'),
  memo: z.string().optional().nullable(),
})

export type ReminderFormData = z.infer<typeof reminderSchema>
