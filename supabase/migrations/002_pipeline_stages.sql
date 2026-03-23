CREATE TABLE pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#94A3B8',
  order_index INTEGER NOT NULL,
  stage_type  TEXT NOT NULL DEFAULT 'pipeline'
    CHECK (stage_type IN ('pipeline', 'escape')),
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 데이터만" ON pipeline_stages
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_pipeline_stages_user_id ON pipeline_stages(user_id);
