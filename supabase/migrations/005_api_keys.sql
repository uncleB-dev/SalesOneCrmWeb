-- 앱에서 사용할 API 키 관리 (추후 모바일 앱 연동 시 활성화)
CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE,     -- bcrypt 해시된 키
  name        TEXT NOT NULL,            -- "iOS 앱", "Android 앱"
  last_used   TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 API 키만" ON api_keys
  FOR ALL USING (auth.uid() = user_id);
