CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  manager_id  UUID REFERENCES auth.users NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES teams NOT NULL,
  user_id     UUID REFERENCES auth.users NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('manager', 'member')),
  status      TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'rejected')),
  invited_by  UUID REFERENCES auth.users,
  joined_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  from_user_id  UUID REFERENCES auth.users,
  type          TEXT NOT NULL
    CHECK (type IN (
      'team_join_request',
      'team_invite',
      'team_accepted',
      'team_rejected',
      'team_disconnected'
    )),
  team_id       UUID REFERENCES teams,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "팀 조회" ON teams
  USING (auth.uid() = manager_id OR
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "팀원 조회" ON team_members
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR user_id = auth.uid()
  );

CREATE POLICY "본인 알림만" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
