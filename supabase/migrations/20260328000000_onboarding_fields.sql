ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS agreed_terms BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agreed_privacy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agreed_consignment BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agreed_marketing BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 기존 사용자: pipeline_stages가 있으면 온보딩 완료 처리
UPDATE user_profiles SET onboarding_completed = TRUE
WHERE id IN (SELECT DISTINCT user_id FROM pipeline_stages);
