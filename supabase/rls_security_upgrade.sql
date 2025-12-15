-- ============================================
-- RLS 보안 적용 (기존 데이터 마이그레이션 포함)
-- ============================================
-- 
-- 단계별로 실행하세요:
-- 1단계: user_id 컬럼 추가
-- 2단계: 기존 데이터에 user_id 할당
-- 3단계: RLS 정책 적용

-- ============================================
-- 1단계: user_id 컬럼 추가 (이미 추가되어 있으면 스킵됨)
-- ============================================

ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ============================================
-- 2단계: 기존 데이터에 user_id 할당
-- (본인의 user_id를 아래에 입력하세요)
-- Supabase Dashboard > Authentication > Users에서 확인
-- ============================================

-- ⚠️ 아래 'YOUR_USER_ID' 부분을 실제 본인 UUID로 교체하세요!
-- 예: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

UPDATE students SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE groups SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE projects SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
UPDATE schedule_items SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- ============================================
-- 3단계: 기존 정책 삭제
-- ============================================

DROP POLICY IF EXISTS "Allow all operations on students" ON students;
DROP POLICY IF EXISTS "Allow all operations on groups" ON groups;
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Allow all operations on schedule_items" ON schedule_items;

-- 인증 기반 정책도 삭제 (재생성 위해)
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

-- ============================================
-- 4단계: 새로운 RLS 정책 생성
-- ============================================

-- STUDENTS
CREATE POLICY "Users can view their own students" ON students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own students" ON students FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own students" ON students FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own students" ON students FOR DELETE USING (auth.uid() = user_id);

-- GROUPS
CREATE POLICY "Users can view their own groups" ON groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own groups" ON groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own groups" ON groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own groups" ON groups FOR DELETE USING (auth.uid() = user_id);

-- PROJECTS
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- SCHEDULE_ITEMS
CREATE POLICY "Users can view their own schedule_items" ON schedule_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own schedule_items" ON schedule_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedule_items" ON schedule_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedule_items" ON schedule_items FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5단계: 인덱스 추가 (성능 최적화)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_user_id ON schedule_items(user_id);

-- ============================================
-- 완료!
-- ============================================
