-- customers 테이블 컬럼 추가
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS google_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT,
  ADD COLUMN IF NOT EXISTS is_google_contact_synced BOOLEAN DEFAULT FALSE;

-- reminders 테이블 컬럼 추가
ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- 드라이브 파일 스냅샷 테이블
CREATE TABLE IF NOT EXISTS customer_drive_files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES customers NOT NULL,
  file_id       TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  created_time  TIMESTAMPTZ,
  modified_time TIMESTAMPTZ,
  last_seen_at  TIMESTAMPTZ DEFAULT NOW(),
  is_deleted    BOOLEAN DEFAULT FALSE,
  UNIQUE(customer_id, file_id)
);

ALTER TABLE customer_drive_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 데이터만" ON customer_drive_files
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_drive_files_customer_id
  ON customer_drive_files(customer_id);
