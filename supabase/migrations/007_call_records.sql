-- Call Records: AI 통화 요약 기록 테이블
CREATE TABLE call_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  customer_id   UUID REFERENCES customers(id) ON DELETE SET NULL,
  file_name     TEXT NOT NULL,
  phone_number  TEXT,
  occurred_at   TIMESTAMPTZ,
  duration      INTEGER,         -- 통화시간(초)
  summary       TEXT,
  action_items  TEXT,
  sentiment     TEXT,
  raw_text      TEXT,
  is_matched    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 데이터만" ON call_records
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_call_records_user_id ON call_records(user_id);
CREATE INDEX idx_call_records_customer_id ON call_records(customer_id);
CREATE INDEX idx_call_records_occurred_at ON call_records(occurred_at DESC);
CREATE INDEX idx_call_records_phone ON call_records(phone_number);
