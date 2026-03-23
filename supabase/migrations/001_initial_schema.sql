-- customers 테이블
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users NOT NULL,
  name                TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT,
  birth_date          DATE,
  gender              TEXT CHECK (gender IN ('남', '여')),
  stage               TEXT NOT NULL DEFAULT 'DB배정',
  source              TEXT,
  tags                TEXT[] DEFAULT '{}',
  memo                TEXT,
  company             TEXT,
  job_title           TEXT,
  order_index         INTEGER DEFAULT 0,
  is_blacklist        BOOLEAN DEFAULT FALSE,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- interactions 테이블
CREATE TABLE interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES customers NOT NULL,
  user_id          UUID REFERENCES auth.users NOT NULL,
  type             TEXT NOT NULL
    CHECK (type IN ('전화', '문자', '이메일', '방문', '화상', '기타')),
  content          TEXT,
  duration         INTEGER,
  stage_changed_to TEXT,
  occurred_at      TIMESTAMPTZ DEFAULT NOW()
);

-- reminders 테이블
CREATE TABLE reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers NOT NULL,
  user_id     UUID REFERENCES auth.users NOT NULL,
  due_date    DATE NOT NULL,
  memo        TEXT,
  is_done     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "본인 데이터만" ON customers
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 데이터만" ON interactions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 데이터만" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스 (성능)
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_stage ON customers(stage);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_interactions_customer_id ON interactions(customer_id);
CREATE INDEX idx_interactions_occurred_at ON interactions(occurred_at DESC);
CREATE INDEX idx_reminders_user_id_due_date ON reminders(user_id, due_date);
