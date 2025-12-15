-- ============================================
-- RLS 정책 롤백 (임시 복원)
-- 기존 "모든 접근 허용" 정책으로 복원
-- ============================================
-- 
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요.
-- 보안 정책 적용 전 상태로 복원됩니다.

-- 1. 새로운 인증 기반 정책 삭제
DROP POLICY IF EXISTS "Users can view their own students" ON students;
DROP POLICY IF EXISTS "Users can insert their own students" ON students;
DROP POLICY IF EXISTS "Users can update their own students" ON students;
DROP POLICY IF EXISTS "Users can delete their own students" ON students;

DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Users can insert their own groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Users can view their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can insert their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can update their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can delete their own schedule_items" ON schedule_items;

-- 2. 기존 "모든 접근 허용" 정책 복원
CREATE POLICY "Allow all operations on students" ON students
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on groups" ON groups
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on schedule_items" ON schedule_items
  FOR ALL USING (true) WITH CHECK (true);

-- 완료! 이제 모든 CRUD 작업이 정상 작동합니다.
-- 
-- 나중에 보안을 다시 강화하려면:
-- 1. 먼저 모든 기존 데이터에 user_id를 설정
-- 2. 그 다음 rls_security_upgrade.sql 실행
