-- ============================================
-- RLS 정책 수정 - 일반 사용자는 자신의 자료만 열람
-- ============================================
-- 
-- 문제: 일반 사용자가 모든 프로젝트를 볼 수 있음
-- 해결: RLS 정책을 명확하게 재설정
-- ============================================

-- 1. 기존 정책 모두 삭제 (새 정책 이름 포함)
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- 3. is_admin 함수 (없으면 생성)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
        AND (
            raw_user_meta_data->>'is_admin' = 'true'
            OR raw_app_meta_data->>'is_admin' = 'true'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. 새 정책 생성 - 일반 사용자는 자기 것만!

-- SELECT: 자기 프로젝트 또는 관리자이면 전체
CREATE POLICY "projects_select_policy" ON projects FOR SELECT
USING (
    user_id = auth.uid()  -- 자신의 프로젝트
    OR is_admin()          -- 또는 관리자
);

-- INSERT: 자기 user_id로만 삽입 가능
CREATE POLICY "projects_insert_policy" ON projects FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: 자기 프로젝트만 수정 가능
CREATE POLICY "projects_update_policy" ON projects FOR UPDATE
USING (user_id = auth.uid());

-- DELETE: 자기 프로젝트만 삭제 가능
CREATE POLICY "projects_delete_policy" ON projects FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- STUDENTS 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "Allow all operations on students" ON students;
DROP POLICY IF EXISTS "Users can view their own students" ON students;
DROP POLICY IF EXISTS "Users can insert their own students" ON students;
DROP POLICY IF EXISTS "Users can update their own students" ON students;
DROP POLICY IF EXISTS "Users can delete their own students" ON students;
DROP POLICY IF EXISTS "Admins can view all students" ON students;
DROP POLICY IF EXISTS "students_select_policy" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "students_delete_policy" ON students;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students FORCE ROW LEVEL SECURITY;

CREATE POLICY "students_select_policy" ON students FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "students_insert_policy" ON students FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "students_update_policy" ON students FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "students_delete_policy" ON students FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- GROUPS 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "Allow all operations on groups" ON groups;
DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Users can insert their own groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;
DROP POLICY IF EXISTS "Admins can view all groups" ON groups;
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy" ON groups;

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups FORCE ROW LEVEL SECURITY;

CREATE POLICY "groups_select_policy" ON groups FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "groups_insert_policy" ON groups FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "groups_update_policy" ON groups FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "groups_delete_policy" ON groups FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- SCHEDULE_ITEMS 테이블 RLS 정책
-- ============================================

DROP POLICY IF EXISTS "Allow all operations on schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can view their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can insert their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can update their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "Users can delete their own schedule_items" ON schedule_items;
DROP POLICY IF EXISTS "schedule_items_select_policy" ON schedule_items;
DROP POLICY IF EXISTS "schedule_items_insert_policy" ON schedule_items;
DROP POLICY IF EXISTS "schedule_items_update_policy" ON schedule_items;
DROP POLICY IF EXISTS "schedule_items_delete_policy" ON schedule_items;

ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items FORCE ROW LEVEL SECURITY;

CREATE POLICY "schedule_items_select_policy" ON schedule_items FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "schedule_items_insert_policy" ON schedule_items FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "schedule_items_update_policy" ON schedule_items FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "schedule_items_delete_policy" ON schedule_items FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- 확인
-- ============================================
-- 아래 쿼리로 정책 확인 가능:
-- SELECT * FROM pg_policies WHERE tablename = 'projects';

-- ============================================
-- 완료!
-- ============================================
