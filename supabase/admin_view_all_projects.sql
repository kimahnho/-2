-- ============================================
-- 관리자 전체 프로젝트 열람 권한
-- ============================================
-- 
-- projects 테이블에 관리자용 RLS 정책 추가
-- 관리자는 모든 사용자의 프로젝트를 볼 수 있음
-- ============================================

-- is_admin() 함수 생성 (없으면)
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

-- ============================================
-- projects 테이블: 관리자 열람 정책 추가
-- ============================================

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;

-- 사용자: 자신의 프로젝트만 보기
CREATE POLICY "Users can view their own projects" 
    ON projects FOR SELECT 
    USING (auth.uid() = user_id);

-- 관리자: 모든 프로젝트 보기
CREATE POLICY "Admins can view all projects" 
    ON projects FOR SELECT 
    USING (is_admin());

-- ============================================
-- students 테이블: 관리자 열람 정책 추가
-- ============================================

DROP POLICY IF EXISTS "Users can view their own students" ON students;
DROP POLICY IF EXISTS "Admins can view all students" ON students;

CREATE POLICY "Users can view their own students" 
    ON students FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all students" 
    ON students FOR SELECT 
    USING (is_admin());

-- ============================================
-- groups 테이블: 관리자 열람 정책 추가
-- ============================================

DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Admins can view all groups" ON groups;

CREATE POLICY "Users can view their own groups" 
    ON groups FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all groups" 
    ON groups FOR SELECT 
    USING (is_admin());

-- ============================================
-- 완료!
-- ============================================
