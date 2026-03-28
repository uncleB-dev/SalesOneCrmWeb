-- pipeline_stages 중복 방지: (user_id, name, stage_type) 유니크 제약
-- 기존 중복 데이터는 SQL로 정리된 것으로 가정
ALTER TABLE pipeline_stages
  ADD CONSTRAINT pipeline_stages_user_name_type_unique
  UNIQUE (user_id, name, stage_type);
