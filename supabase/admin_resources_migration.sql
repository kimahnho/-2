-- ============================================
-- 관리자 전용 자료 보관 시스템
-- ============================================
-- 
-- 1. admin_resources 테이블 생성
-- 2. is_admin() 함수 생성
-- 3. RLS 정책 적용
--
-- 실행 전: Supabase Dashboard에서 관리자 계정의 user_metadata에 
-- "is_admin": true 추가 필요
-- ============================================

-- ============================================
-- 1단계: admin_resources 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS admin_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    elements JSONB DEFAULT '[]'::jsonb,
    pages JSONB DEFAULT '[{"id": "page-1"}]'::jsonb,
    thumbnail TEXT,
    preview_elements JSONB,
    
    -- 제출 정보
    submitted_by UUID REFERENCES auth.users(id) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    
    -- 원본 프로젝트 참조 (선택)
    original_project_id UUID,
    
    -- 상태 관리
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_admin_resources_submitted_by ON admin_resources(submitted_by);
CREATE INDEX IF NOT EXISTS idx_admin_resources_status ON admin_resources(status);
CREATE INDEX IF NOT EXISTS idx_admin_resources_submitted_at ON admin_resources(submitted_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_admin_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_admin_resources_updated_at ON admin_resources;
CREATE TRIGGER trigger_admin_resources_updated_at
    BEFORE UPDATE ON admin_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_resources_updated_at();

-- ============================================
-- 2단계: is_admin() 함수 생성
-- ============================================

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
-- 3단계: RLS 활성화 및 정책 생성
-- ============================================

ALTER TABLE admin_resources ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행 시)
DROP POLICY IF EXISTS "Admins can view all resources" ON admin_resources;
DROP POLICY IF EXISTS "Users can submit resources" ON admin_resources;
DROP POLICY IF EXISTS "Admins can update resources" ON admin_resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON admin_resources;
DROP POLICY IF EXISTS "Users can view their own submissions" ON admin_resources;

-- 관리자: 모든 자료 열람 가능
CREATE POLICY "Admins can view all resources"
    ON admin_resources FOR SELECT
    USING (is_admin());

-- 일반 사용자: 자신이 제출한 자료만 볼 수 있음
CREATE POLICY "Users can view their own submissions"
    ON admin_resources FOR SELECT
    USING (auth.uid() = submitted_by);

-- 인증된 사용자: 자료 제출 가능
CREATE POLICY "Users can submit resources"
    ON admin_resources FOR INSERT
    WITH CHECK (auth.uid() = submitted_by);

-- 관리자: 상태 업데이트 가능
CREATE POLICY "Admins can update resources"
    ON admin_resources FOR UPDATE
    USING (is_admin());

-- 관리자: 삭제 가능
CREATE POLICY "Admins can delete resources"
    ON admin_resources FOR DELETE
    USING (is_admin());

-- ============================================
-- 완료!
-- ============================================
-- 
-- 다음 단계:
-- 1. Supabase Dashboard > Authentication > Users
-- 2. 관리자 계정 선택 > Edit User > User Metadata
-- 3. {"is_admin": true} 추가
-- ============================================
