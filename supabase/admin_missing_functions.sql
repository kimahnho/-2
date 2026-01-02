-- ============================================
-- 관리자 패널 누락 함수 추가 (수정본)
-- ============================================
-- 
-- 기존 함수 삭제 후 재생성
-- ============================================

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS get_all_projects_admin();
DROP FUNCTION IF EXISTS get_projects_by_user_admin(UUID);
DROP FUNCTION IF EXISTS get_all_students_admin();
DROP FUNCTION IF EXISTS get_all_groups_admin();

-- ============================================
-- 1. get_all_projects_admin
-- ============================================
CREATE OR REPLACE FUNCTION get_all_projects_admin()
RETURNS TABLE (
    id UUID,
    title TEXT,
    thumbnail TEXT,
    preview_elements JSONB,
    user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- 관리자만 접근 가능
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.title::TEXT,
        p.thumbnail::TEXT,
        p.preview_elements,
        p.user_id,
        p.created_at,
        p.updated_at
    FROM projects p
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 2. get_projects_by_user_admin
-- ============================================
CREATE OR REPLACE FUNCTION get_projects_by_user_admin(target_user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    thumbnail TEXT,
    preview_elements JSONB,
    user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- 관리자만 접근 가능
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.title::TEXT,
        p.thumbnail::TEXT,
        p.preview_elements,
        p.user_id,
        p.created_at,
        p.updated_at
    FROM projects p
    WHERE p.user_id = target_user_id AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 3. get_all_students_admin
-- ============================================
CREATE OR REPLACE FUNCTION get_all_students_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    birth_year INTEGER,
    notes TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- 관리자만 접근 가능
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        s.id,
        s.name::TEXT,
        s.birth_year,
        s.notes::TEXT,
        s.user_id,
        s.created_at
    FROM students s
    WHERE s.deleted_at IS NULL
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 4. get_all_groups_admin
-- ============================================
CREATE OR REPLACE FUNCTION get_all_groups_admin()
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    member_count INTEGER,
    user_id UUID,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    -- 관리자만 접근 가능
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        g.id,
        g.name::TEXT,
        g.description::TEXT,
        g.member_count,
        g.user_id,
        g.created_at
    FROM groups g
    WHERE g.deleted_at IS NULL
    ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 5. get_project_data_admin (프로젝트 상세 데이터)
-- ============================================
DROP FUNCTION IF EXISTS get_project_data_admin(UUID);

CREATE OR REPLACE FUNCTION get_project_data_admin(target_project_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    elements JSONB,
    pages JSONB,
    thumbnail TEXT,
    user_id UUID
) AS $$
BEGIN
    -- 관리자만 접근 가능
    IF NOT is_admin() THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.title::TEXT,
        p.elements,
        p.pages,
        p.thumbnail::TEXT,
        p.user_id
    FROM projects p
    WHERE p.id = target_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 완료!
-- ============================================
