-- 첫 로그인 시 /auth/callback 에서 자동 실행되는 기본 단계
-- 아래는 참고용. 실제 삽입은 /auth/callback/route.ts API에서 처리.

-- 영업 파이프라인 기본 10단계 (stage_type = 'pipeline')
-- 이탈 관리 기본 5단계 (stage_type = 'escape')
-- lib/utils/constants.ts 의 PIPELINE_DEFAULTS, ESCAPE_DEFAULTS 참조
