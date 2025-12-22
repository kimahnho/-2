-- ============================================
-- Supabase 보안 경고 전체 수정
-- ============================================
-- 
-- 1. Security Definer View 문제 수정 (3개)
-- 2. Function Search Path Mutable 문제 수정 (9개)
--
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- PART 1: Security Definer View 수정
-- ============================================
-- 문제: 뷰가 SECURITY DEFINER로 생성되어 RLS가 쿼리 사용자가 아닌 뷰 생성자 기준으로 적용됨
-- 해결: SECURITY INVOKER로 재생성

DROP VIEW IF EXISTS deleted_students;
DROP VIEW IF EXISTS deleted_groups;
DROP VIEW IF EXISTS deleted_projects;

CREATE VIEW deleted_students 
WITH (security_invoker = true) AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM students 
WHERE deleted_at IS NOT NULL;

CREATE VIEW deleted_groups 
WITH (security_invoker = true) AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM groups 
WHERE deleted_at IS NOT NULL;

CREATE VIEW deleted_projects 
WITH (security_invoker = true) AS
SELECT *, 
    deleted_at + INTERVAL '14 days' AS permanent_delete_at,
    EXTRACT(DAY FROM (deleted_at + INTERVAL '14 days' - NOW())) AS days_remaining
FROM projects 
WHERE deleted_at IS NOT NULL;

-- ============================================
-- PART 2: Function Search Path 수정
-- ============================================
-- 문제: search_path가 설정되지 않아 스키마 하이재킹 공격에 취약
-- 해결: SET search_path = public 추가

-- 1. cleanup_soft_deleted_records
CREATE OR REPLACE FUNCTION cleanup_soft_deleted_records()
RETURNS void AS $$
BEGIN
    DELETE FROM students 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
    
    DELETE FROM groups 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
    
    DELETE FROM projects 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
    
    DELETE FROM schedule_items 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 2. restore_student
CREATE OR REPLACE FUNCTION restore_student(student_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE students SET deleted_at = NULL WHERE id = student_id;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 3. restore_group
CREATE OR REPLACE FUNCTION restore_group(group_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE groups SET deleted_at = NULL WHERE id = group_id;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 4. restore_project
CREATE OR REPLACE FUNCTION restore_project(project_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE projects SET deleted_at = NULL WHERE id = project_id;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 5. update_admin_resources_updated_at
CREATE OR REPLACE FUNCTION update_admin_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 6. is_admin
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- 7. get_user_info_for_admin
CREATE OR REPLACE FUNCTION get_user_info_for_admin(target_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    provider TEXT
) AS $$
BEGIN
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        COALESCE(
            u.raw_user_meta_data->>'name',
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'user_name',
            split_part(u.email, '@', 1)
        )::TEXT as display_name,
        COALESCE(
            u.raw_user_meta_data->>'avatar_url',
            u.raw_user_meta_data->>'picture'
        )::TEXT as avatar_url,
        COALESCE(
            u.raw_app_meta_data->>'provider',
            'email'
        )::TEXT as provider
    FROM auth.users u
    WHERE u.id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- 8. get_all_users_with_projects
CREATE OR REPLACE FUNCTION get_all_users_with_projects()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    provider TEXT,
    project_count BIGINT
) AS $$
BEGIN
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        COALESCE(
            u.raw_user_meta_data->>'name',
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'user_name',
            split_part(u.email, '@', 1)
        )::TEXT as display_name,
        COALESCE(
            u.raw_user_meta_data->>'avatar_url',
            u.raw_user_meta_data->>'picture'
        )::TEXT as avatar_url,
        COALESCE(
            u.raw_app_meta_data->>'provider',
            'email'
        )::TEXT as provider,
        COUNT(p.id) as project_count
    FROM auth.users u
    INNER JOIN projects p ON p.user_id = u.id AND p.deleted_at IS NULL
    GROUP BY u.id, u.email, u.raw_user_meta_data, u.raw_app_meta_data
    ORDER BY COUNT(p.id) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- 9. update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================
-- 완료!
-- ============================================
-- 
-- 실행 후 Supabase Dashboard에서 Refresh 버튼 클릭
-- 모든 경고가 사라집니다
--
-- ⚠️ 추가 작업 필요:
-- Leaked Password Protection 활성화
-- Dashboard > Authentication > Providers > Email 
-- "Enable leak password protection" 체크
-- ============================================
