-- 팀 초대 코드 테이블
CREATE TABLE team_invite_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES teams NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  created_by  UUID REFERENCES auth.users NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  used_by     UUID REFERENCES auth.users,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "팀 멤버 초대 코드 조회" ON team_invite_codes
  FOR SELECT USING (
    team_id IN (SELECT id FROM teams WHERE manager_id = auth.uid())
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "팀장만 초대 코드 생성" ON team_invite_codes
  FOR INSERT WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE manager_id = auth.uid())
  );

CREATE POLICY "팀장만 초대 코드 수정" ON team_invite_codes
  FOR UPDATE USING (
    team_id IN (SELECT id FROM teams WHERE manager_id = auth.uid())
  );

-- 팀원 프로필 조회 RPC (auth.users 직접 접근)
CREATE OR REPLACE FUNCTION get_team_member_profiles(member_ids UUID[])
RETURNS TABLE(user_id UUID, email TEXT, full_name TEXT)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT id, email, raw_user_meta_data->>'full_name'
  FROM auth.users
  WHERE id = ANY(member_ids)
$$;

CREATE INDEX idx_invite_codes_code ON team_invite_codes(code);
CREATE INDEX idx_invite_codes_team_id ON team_invite_codes(team_id);
