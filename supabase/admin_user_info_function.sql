-- ============================================
-- 관리자용 유저 정보 조회 함수
-- ============================================
-- 
-- 관리자가 유저의 이메일과 이름을 조회할 수 있게 함
-- 카카오/구글 로그인 시 저장된 이름 사용
-- ============================================

-- 단일 유저 정보 조회
CREATE OR REPLACE FUNCTION get_user_info_for_admin(target_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    provider TEXT
) AS $$
BEGIN
    -- 관리자만 접근 가능
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 모든 유저 정보 조회 (프로젝트가 있는 유저만)
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
    -- 관리자만 접근 가능
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 완료!
-- ============================================
