import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1, '팀 이름을 입력하세요').max(50, '팀 이름은 50자 이내여야 합니다'),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
})

export const joinRequestSchema = z.object({
  manager_email: z.string().email('올바른 이메일 형식이 아닙니다'),
})

export type CreateTeamData = z.infer<typeof createTeamSchema>
export type InviteMemberData = z.infer<typeof inviteMemberSchema>
export type JoinRequestData = z.infer<typeof joinRequestSchema>
